import { HttpService } from "@nestjs/axios";
import { Injectable, Logger } from "@nestjs/common";
import { Cron, CronExpression } from "@nestjs/schedule";
import { AxiosResponse } from "axios";
import { importJWK, SignJWT } from 'jose';
import { lastValueFrom } from "rxjs";
import { CompanyEntity } from "src/entities/company.entity";
import { ContractEntity } from "src/entities/contract.entity";
import { CustomerAddress, CustomerEntity } from "src/entities/customer.entity";
import { DataSource, ILike } from "typeorm";
import { GRANT } from "./api";

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

@Injectable()
export class BlaudirektService {
    private readonly logger = new Logger(BlaudirektService.name);

    constructor(
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
                        order,
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

    async fetchCustomers(token: string, pageSize: number = 100, page: number = 1, order: 'ASC' | 'DESC' = 'ASC') {
        try {
            const response: AxiosResponse<BlaudirektResponse<BlaudirektCustomerDto>> = await lastValueFrom(this.httpService.get(
                `https://stocks.ameiseapis.com/api/customers/${GRANT.broker.id}`,
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
            await this.createOrUpdateCustomers(response.data.items);
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

    async getCompanies(offset: number = 0, limit: number = 100, query?: string) {
        return this.dataSource.manager.find(CompanyEntity, { where: { name: ILike(`%${query}%`) }, skip: offset, take: limit })
    }

    async getContracts(customerId: string, offset: number = 0, limit: number = 100) {
        return this.dataSource.manager.find(ContractEntity, { where: { customerId }, skip: offset, take: limit, relations: ['customer', 'company'] })
    }

    async getCustomers(offset: number = 0, limit: number = 100, query?: string) {
        return this.dataSource.manager.find(CustomerEntity, { where: { displayName: ILike(`%${query}%`) }, skip: offset, take: limit })
    }

    private createOrUpdateCustomers(customers: BlaudirektCustomerDto[]) {
        const items: Partial<CustomerEntity>[] = customers?.filter(customer => !!customer.id).map(customer => {
            return {
                ...customer,
                mainAddress: {
                    ...customer.mainAddress,
                    street: splitStreetAndNumber(customer.mainAddress.street)?.street,
                    streetNo: splitStreetAndNumber(customer.mainAddress.street)?.streetNo,
                },
                gender: customer.salutation.gender,
            }
        });

        return this.dataSource.transaction(async manager => {
            await manager.getRepository(CustomerEntity).upsert(items, {
                conflictPaths: ['id'],
                skipUpdateIfNoValuesChanged: true,
            });
        });
    }

    private createOrUpdateContracts(contracts: Record<string, any>[]) {
        const entities: Partial<ContractEntity>[] = contracts?.filter(contract => !!contract.id).map(contract => ({
            id: contract.id,
            line: contract.line,
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

    private createOrUpdateCompanies(companies: Partial<CompanyEntity>[]) {
        companies = companies?.filter(company => !!company.id).map(company => {
            return company;
        });
        return this.dataSource.transaction(async manager => {
            await manager.getRepository(CompanyEntity).upsert(companies, {
                conflictPaths: ['id'],
                skipUpdateIfNoValuesChanged: true,
            });
        });
    }

    @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
    async fetchDataFromBlaudirekt() {
        const token = await this.getAccessToken();
        const pageSize = 1000;
        let numberOfPages = 1;

        // fetch companies

        for (let i = 1; i <= numberOfPages; i++) {
            const response = await this.fetchCompanies(token, pageSize, i, 'ASC');
            numberOfPages = response.numberOfPages;
        }


        // fetch customers
        numberOfPages = 1;
        for (let i = 1; i <= numberOfPages; i++) {
            const response = await this.fetchCustomers(token, pageSize, i, 'ASC');
            numberOfPages = response?.numberOfPages ?? 1;
            for (const customer of (response?.items ?? [])) {
                await this.fetchContracts(token, customer.id, 1000, 1, 'ASC');

            }
        }

        this.logger.log('Synchronized data from blaudirekt!');
    }
}