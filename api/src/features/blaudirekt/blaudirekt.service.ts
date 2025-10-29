import { HttpService } from "@nestjs/axios";
import { Injectable, Logger } from "@nestjs/common";
import { Cron, CronExpression } from "@nestjs/schedule";
import { AxiosResponse } from "axios";
import { importJWK, SignJWT } from 'jose';
import { lastValueFrom } from "rxjs";
import { BrokerEntity } from "src/entities/broker.entity";
import { CompanyEntity } from "src/entities/company.entity";
import { ContractEntity } from "src/entities/contract.entity";
import { CustomerAddress, CustomerEntity } from "src/entities/customer.entity";
import { CustomerWithStatusView } from "src/entities/customer.view.entity";
import { DivisionEntity } from "src/entities/division.entity";
import { DataSource, ILike, In } from "typeorm";
import { QueryDeepPartialEntity } from "typeorm/query-builder/QueryPartialEntity.js";
import { FcmService } from "../fcm/fcm.service";
import { FilesService } from "../files/files.service";
import { API, GRANT } from "./api";

async function imageUrlToBase64(url: string): Promise<string> {
    if (!url) { return ''; }

    try {
        const response = await fetch(url);
        const contentType = response.headers.get('content-type') || 'application/octet-stream';
        const arrayBuffer = await response.arrayBuffer();
        const base64 = Buffer.from(arrayBuffer).toString('base64');
        return `data:${contentType};base64,${base64}`;
    } catch {
        return '';
    }
}

function splitStreetAndNumber(fullStreet?: string): { street: string; streetNo: string } {
    if (!fullStreet) return { street: "", streetNo: "" };

    // Regex: captures everything before the last number, and the number + optional letters at the end
    const regex = /^(.*?)(\d+\s?[a-zA-Z]?)$/;

    const match = fullStreet?.trim().match(regex);

    if (match) {
        return {
            street: match[1].trim(),
            streetNo: match[2].trim()
        };
    }

    // fallback if no number found
    return { street: fullStreet?.trim(), streetNo: "" };
}

type BlaudirektResponse<T> = {
    items: T[];
    numberOfPages: number;
}

type BlaudirektCustomerDto = {
    id: string;
    displayName: string;
    firstname: string;
    lastname: string;
    mainAddress: CustomerAddress;
    title: string;
    salutation: { text: string; gender: string; };
}

type SearchOptions = {
    query: string;
    limit: number;
    offset: number;
    filters: BlauFilter;
    sortField: string;
    sortOrder: number;
}

export type BlauFilter = Record<string, Filter | Filter[]>;

export type Filter = {
    value: string[];
    matchMode: "in";
    operator: "and";
}

@Injectable()
export class BlaudirektService {
    private readonly logger = new Logger(BlaudirektService.name);

    constructor(
        private readonly fcm: FcmService,
        private readonly fileService: FilesService,
        private readonly dataSource: DataSource,
        private readonly httpService: HttpService
    ) {

        setTimeout(() => {
            this.fetchDataFromBlaudirekt();
        })
    }

    private async getAccessToken() {
        const { jwk, issuer, sub, audience, client_id, client_secret, scope, grant_type, token_endpoint } = GRANT;

        const privateKey = await importJWK(jwk, "ES512");

        const assertion = await new SignJWT({
            iss: issuer,
            sub: sub,
            aud: audience,
            iat: (+new Date()) / 1000,
            jti: String(Math.random()),
        })
            .setProtectedHeader({ alg: 'ES512' })
            .setIssuedAt()
            .setExpirationTime('5m')
            .sign(privateKey);

        const url = token_endpoint; // Replace with the actual token endpoint

        const formData = new URLSearchParams();
        formData.append('grant_type', grant_type);
        formData.append('scope', scope.join(' '));
        formData.append('assertion', assertion);

        const credentials = btoa(`${client_id}:${client_secret}`);
        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Authorization': `Basic ${credentials}`
                },
                body: formData.toString(),
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Request failed with status ${response.status}: ${errorText}`);
            }

            const data = await response.json();

            return data.access_token;
        } catch (error) {
            this.logger.error(error);
            throw error;
        }
    }

    async fetchCompanies(token: string, pageSize: number = 100, page: number = 1, order: 'ASC' | 'DESC' = 'ASC') {
        try {
            const response = await lastValueFrom(this.httpService.get(
                `https://stocks.ameiseapis.com/api/companies`,
                {
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                        'Authorization': `Bearer ${token}`
                    },
                    params: {
                        page,
                        pageSize,
                        onlyMandantCompanies: false,
                        query: undefined,
                    }
                }
            ));

            const encoder = 'jpg';
            const size = '100x150';
            const resizer = 'bestfit';


            const items: Partial<CompanyEntity>[] = [];
            for (const company of response.data.items) {
                const logo = await imageUrlToBase64(
                    `http://thumbs.dionera.com/${resizer}/${size}/${company.logoId}.${encoder}`
                );

                items.push({
                    id: company.id,
                    name: company.name,
                    logoId: company.logoId,
                    logo,
                });
            }

            await this.createOrUpdateCompanies(items);

            return response.data;
        } catch (e) {
            this.logger.error(e);
        }
    }

    async fetchBrokers(token: string, pageSize: number = 100, page: number = 1, order: 'ASC' | 'DESC' = 'ASC') {
        try {
            const response: AxiosResponse<BlaudirektResponse<BrokerEntity>> = await lastValueFrom(this.httpService.get(
                `https://stocks.ameiseapis.com/api/brokers`,
                {
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                        'Authorization': `Bearer ${token}`
                    },
                    params: {
                        pageSize,
                        page,
                    }
                }
            ));
            await this.createOrUpdateBrokers(response.data.items as QueryDeepPartialEntity<BrokerEntity>[]);
            return response.data;
        } catch (e) {
            this.logger.error(e);
        }
    }

    async fetchCustomers(broker: BrokerEntity, token: string, pageSize: number = 100, page: number = 1, order: 'ASC' | 'DESC' = 'ASC') {
        try {
            const response: AxiosResponse<BlaudirektResponse<BlaudirektCustomerDto>> = await lastValueFrom(this.httpService.get(
                `https://stocks.ameiseapis.com/api/customers/${broker.id}`,
                {
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                        'Authorization': `Bearer ${token}`
                    },
                    params: {
                        pageSize,
                        page,
                        order,
                    }
                }
            ));
            await this.createOrUpdateCustomers(broker, response.data.items);
            return response.data;
        } catch (e) {
            this.logger.error(e);
        }


    }

    async fetchContracts(token: string, customerId: string, pageSize: number = 100, page: number = 1, order: 'ASC' | 'DESC' = 'ASC') {
        try {
            const response = await lastValueFrom(this.httpService.get(
                `https://stocks.ameiseapis.com/api/contracts/${customerId}`,
                {
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                        'Authorization': `Bearer ${token}`
                    },
                    params: {
                        pageSize,
                        page,
                        order,
                    }
                }
            ));

            await this.createOrUpdateContracts(response.data.items);

            return response.data;
        } catch (e) {
            this.logger.error(e);
        }
    }

    async fetchCustomerState(token: string, customerId: string) {
        try {
            const response = await lastValueFrom(this.httpService.get(
                `https://stocks.ameiseapis.com/api/customer/state/${customerId}`,
                {
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                        'Authorization': `Bearer ${token}`
                    },
                }
            ));

            const dto: QueryDeepPartialEntity<CustomerEntity> = {
                id: customerId,
                terminatedAt: response.data.brokerMandateTerminationDate,
                isAlive: response.data.isAlive,
                blockReason: response.data.blockedReason?.text,
                blocked: response.data.blocked
            };

            await this.dataSource.transaction(async manager => {
                await manager.update(CustomerEntity, customerId, dto);
            });

            return response.data;
        } catch (e) {
            this.logger.error(e);
        }
    }

    async getCompanies(options: Partial<SearchOptions>) {
        const [items, total] = await this.dataSource.manager.findAndCount(CompanyEntity,
            {
                where: { name: ILike(`%${options?.query ?? ''}%`) },
                order: { [options?.sortField ?? 'name']: options?.sortOrder === -1 ? 'DESC' : 'ASC' },
                skip: options?.offset ?? 0,
                take: options?.limit ?? 100
            })
        return { items, total };
    }


    async editCompany(companyId: string, companyDto: QueryDeepPartialEntity<CompanyEntity>) {
        return this.dataSource.manager.transaction(async manager => {
            return await manager.update(CompanyEntity, companyId, companyDto);
        });
    }


    async editDivision(divisionId: string, divisionDto: QueryDeepPartialEntity<DivisionEntity>) {
        return this.dataSource.manager.transaction(async manager => {
            return await manager.update(DivisionEntity, divisionId, divisionDto);
        });
    }

    async getContracts(customerId: string, offset: number = 0, limit: number = 100) {
        return this.dataSource.manager.find(ContractEntity, { where: { customerId }, skip: offset, take: limit, relations: { customer: true, company: true } });
    }

    async ask<Body extends BodyInit | null | undefined, T>(path: string, config?: Partial<{
        method: string;
        body: Body;
        headers: Record<string, string>;
        parseFn: (response: Response) => T
    }>) {
        const token = await this.getAccessToken();
        const url = `${API}/bd/employee/1.0/rest/${path}`;
        try {
            const response = await fetch(url, {
                method: config?.method ?? 'GET',
                headers: {
                    // 'Content-Type': 'application/x-www-form-urlencoded',
                    ...config?.headers,
                    'Authorization': `Bearer ${token}`,
                },
                body: config?.body
            });
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Request failed with status ${response.status}: ${errorText}`);
            }

            if (config?.parseFn) {
                return config.parseFn(response);
            }
            const data = await response.json();
            return data;
        } catch (error) {
            this.logger.error(error);
        }
    }

    async addDocument(customerId: string, html: string) {
        const pdf = await this.fileService.createPdf(html);
        const result = await this.ask(`${GRANT.sub}/archiveintraege`, {
            method: 'POST',
            body: pdf,
            headers: {
                'X-Dio-Zuordnungen': JSON.stringify([
                    // { Typ: 'vertrag', Id: vertragId },
                    // { Typ: 'sparte', Id: sparteId }
                    { "Typ": "kunde", "Id": customerId },
                ]),
                'X-Dio-Tags': JSON.stringify(['Vorsorgevollmacht']),
                'X-Dio-Metadaten': JSON.stringify([{ Value: '_kundensichtbar', Text: '1' }]),
                'X-Dio-Typ': 'dokument',
                'Content-Type': `application/pdf; name="${'Vorsorgevollmacht.pdf'}"`
            }
        });

        await this.dataSource.manager.transaction(async manager => {
            const customer = await manager.findOneOrFail(CustomerEntity, { where: { id: customerId } });

            await manager.update(CustomerEntity, customerId, {
                files: (customer.files ?? []).concat(result.Id)
            });
        });

        return pdf;
    }

    async getDocument(id: string) {
        const result = await this.ask(`${GRANT.sub}/archiveintraege/${id}`, {
            method: 'GET',
            headers: {
                'Content-Type': `application/pdf; name="${'Vorsorgevollmacht.pdf'}"`
            },
            parseFn: async (response) => Buffer.from(await response.arrayBuffer()),
        });

        return result;
    }

    async getDivisions(options: Partial<SearchOptions>) {
        const order: 'ASC' | 'DESC' = options.sortOrder === -1 ? 'DESC' : 'ASC';
        const qb = this.dataSource
            .getRepository(DivisionEntity)
            .createQueryBuilder('division')
            .where('division.text ILIKE :query', {
                query: `%${options?.query ?? ''}%`,
            })
            .orderBy(`division.${options.sortField ?? 'text'}`, order)
            .skip(options?.offset ?? 0)
            .take(options?.limit ?? 100)
            // 👇 this counts related contracts for each customer
            .loadRelationCountAndMap('disivion.contractsCount', 'division.contracts');

        const [items, total] = await qb.getManyAndCount();
        return { items, total };
    }

    async getCustomer(id: string) {
        return this.dataSource.manager.findOneOrFail(CustomerEntity, {
            where: { id },
            relations: {
                links: true
            }
        },)
    }

    async getCustomers(options: Partial<SearchOptions & { status?: string, brokers: string[] }>) {
        const repo = this.dataSource.getRepository(CustomerWithStatusView);

        const qb = repo.createQueryBuilder('customer');

        if (options?.query) {
            qb.where('customer.displayName ILIKE :query', { query: `%${options.query}%` });
        }

        // sorting
        const order: 'ASC' | 'DESC' = options.sortOrder === -1 ? 'DESC' : 'ASC';
        qb.orderBy(`customer.${options.sortField ?? 'lastname'}`, order);

        // handle filters
        if (Array.isArray(options.filters?.status)) {
            // collect all status values (support multiple)
            const statusValues = options.filters.status.flatMap(status => status.value);

            if (statusValues.length) {
                qb.andWhere('customer.status IN (:...statusValues)', { statusValues });
            }
        }

        // filter by broker
        console.log(options?.brokers)
        if (options?.brokers?.length) {
            qb.andWhere('customer."brokerId" IN (:...brokerIds)', { brokerIds: options.brokers });
        }

        qb.skip(options?.offset ?? 0)
            .take(options?.limit ?? 100);

        const [items, total] = await qb.getManyAndCount();

        const result = items.map(item => ({
            ...item,
            linkCount: parseInt(item.linkCount),
            contractsCount: parseInt(item.contractsCount),
        }))

        return { items: result, total };
    }
    // async getCustomers(options: Partial<SearchOptions>) {
    //     const order: 'ASC' | 'DESC' = options.sortOrder === -1 ? 'DESC' : 'ASC';
    //     const qb = this.dataSource
    //         .getRepository(CustomerEntity)
    //         .createQueryBuilder('customer')
    //         .leftJoinAndSelect('customer.links', 'link') // 👈 Load the relation
    //         .where('customer.displayName ILIKE :query', {
    //             query: `%${options?.query ?? ''}%`,
    //         })
    //         .orderBy(`customer.${options.sortField ?? 'lastname'}`, order)
    //         .skip(options?.offset ?? 0)
    //         .take(options?.limit ?? 100)
    //         // 👇 this counts related contracts for each customer
    //         .loadRelationCountAndMap('customer.contractsCount', 'customer.contracts');

    //     const [items, total] = await qb.getManyAndCount();
    //     return { items, total };
    // }

    private createOrUpdateCustomers(broker: BrokerEntity, customers: BlaudirektCustomerDto[]) {
        const items: QueryDeepPartialEntity<CustomerEntity>[] = customers?.filter(customer => !!customer.id)
            .map(customer => {
                return {
                    ...customer,
                    broker,
                    mainAddress: {
                        ...customer.mainAddress,
                        street: splitStreetAndNumber(customer.mainAddress.street)?.street,
                        streetNo: splitStreetAndNumber(customer.mainAddress.street)?.streetNo,
                    },
                    gender: customer.salutation.gender,
                } as QueryDeepPartialEntity<CustomerEntity>;
            });

        return this.dataSource.transaction(async manager => {
            await manager.getRepository(CustomerEntity).upsert(items, {
                conflictPaths: ['id'],
                skipUpdateIfNoValuesChanged: true,
            });
        });
    }

    private createOrUpdateContracts(contracts: Record<string, any>[]) {
        const entities: QueryDeepPartialEntity<ContractEntity>[] = contracts
            ?.filter(contract => !!contract.id)
            .map(contract => ({
                id: contract.id,
                divisionId: contract.line.id,
                payment: contract.payment,
                policyNumber: contract.policyNumber,
                start: contract.duration.begin,
                end: contract.duration.end,
                companyId: contract.company.id,
                risk: contract.risk,
                customerId: contract.customer.id,
            }));

        return this.dataSource.transaction(async manager => {
            await manager.getRepository(ContractEntity).upsert(entities, {
                conflictPaths: ['id'],
                skipUpdateIfNoValuesChanged: true,
            });
        });
    }

    private createOrUpdateBrokers(brokers: QueryDeepPartialEntity<BrokerEntity>[]) {
        return this.dataSource.transaction(async manager => {
            await manager.getRepository(BrokerEntity).upsert(brokers, {
                conflictPaths: ['id'],
                skipUpdateIfNoValuesChanged: true,
            });
        });
    }

    private createOrUpdateCompanies(companies: Partial<CompanyEntity>[]) {
        const mappedCompanies: QueryDeepPartialEntity<CompanyEntity> = companies?.filter(company => !!company.id).map(({ contracts, ...rest }) => rest) as QueryDeepPartialEntity<CompanyEntity>;

        return this.dataSource.transaction(async manager => {
            await manager.getRepository(CompanyEntity).upsert(mappedCompanies, {
                conflictPaths: ['id'],
                skipUpdateIfNoValuesChanged: true,
            });
        });
    }

    async fetchDivisions(token: string, pageSize: number = 100, page: number = 1, order: 'ASC' | 'DESC' = 'ASC') {
        try {
            const response = await lastValueFrom(this.httpService.get(
                `https://stocks.ameiseapis.com/api/contracts/lines`,
                {
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                        'Authorization': `Bearer ${token}`
                    },
                    params: {}
                }
            ));

            const items = response.data;
            return this.dataSource.transaction(async manager => {
                await manager.getRepository(DivisionEntity).upsert(items, {
                    conflictPaths: ['id'],
                    skipUpdateIfNoValuesChanged: true,
                });
            });
        } catch (e) {
            this.logger.error(e);
        }
    }


    private isSynching = false;
    
    getStatus() {
        return {
            isSynching: this.isSynching,
        }
    }

    @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
    async fetchDataFromBlaudirekt() {
        this.isSynching = true;
        if (this.isSynching) { return; }
        try {
            const token = await this.getAccessToken();
            const pageSize = 1000;
            let numberOfPages = 1;

            let brokers: BrokerEntity[] = [];
            for (let i = 1; i <= numberOfPages; i++) {
                const response = await this.fetchBrokers(token, pageSize, i, 'ASC');
                brokers = response?.items ?? [];
                numberOfPages = response?.numberOfPages ?? 1;
            }

            await this.fetchDivisions(token, pageSize, 0, 'ASC');

            // fetch companies
            numberOfPages = 1;
            for (let i = 1; i <= numberOfPages; i++) {
                const response = await this.fetchCompanies(token, pageSize, i, 'ASC');
                numberOfPages = response.numberOfPages;
            }


            // fetch customers
            numberOfPages = 1;
            for (const broker of brokers) {
                for (let i = 1; i <= numberOfPages; i++) {
                    const response = await this.fetchCustomers(broker, token, pageSize, i, 'ASC');
                    numberOfPages = response?.numberOfPages ?? 1;
                    for (const customer of (response?.items ?? [])) {
                        await this.fetchContracts(token, customer.id, 1000, 1, 'ASC');
                        await this.fetchCustomerState(token, customer.id);
                    }
                }
            }

            await this.fcm.broadcastToTopic('all', 'all', JSON.stringify({
                message: 'system.synchronization.done',
                data: {}
            }));
            this.logger.log('Synchronized data from blaudirekt!');
        } finally {
            this.isSynching = false;
        }
    }
}