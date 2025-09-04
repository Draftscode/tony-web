import { HttpService } from "@nestjs/axios";
import { Injectable, Logger } from "@nestjs/common";
import { Cron, CronExpression } from "@nestjs/schedule";
import { importJWK, SignJWT } from 'jose';
import { lastValueFrom } from "rxjs";
import { CompanyEntity } from "src/entities/company.entity";
import { ContractEntity } from "src/entities/contract.entity";
import { CustomerEntity } from "src/entities/customer.entity";
import { DataSource, ILike } from "typeorm";
import { API, GRANT } from "./api";

async function imageUrlToBase64(url: string): Promise<string> {
    const response = await fetch(url);
    const contentType = response.headers.get('content-type') || 'application/octet-stream';
    const arrayBuffer = await response.arrayBuffer();
    const base64 = Buffer.from(arrayBuffer).toString('base64');
    return `data:${contentType};base64,${base64}`;
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

@Injectable()
export class BlaudirektService {
    private readonly logger = new Logger(BlaudirektService.name);

    constructor(
        private readonly dataSource: DataSource,
        private readonly httpService: HttpService
    ) {

        // setTimeout(() => {
        //     this.fetchDataFromBlaudirekt();
        // })
    }

    private async ask(path: string) {
        const token = await this.getAccessToken();

        const url = `${API}/bd/employee/1.0/rest/${path}`;
        try {
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Authorization': `Bearer ${token}`
                },
            });
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Request failed with status ${response.status}: ${errorText}`);
            }

            const data = await response.json();
            return data;
        } catch (error) {
            this.logger.error(error);
        }
    }

    async fetchCompanies(token: string, pageSize: number = 100, page: number = 1, order: 'ASC' | 'DESC' = 'ASC') {
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
                }
            }
        ));

        return response.data;
    }


    async getCompanies(offset: number = 0, limit: number = 100, query?: string) {
        return this.dataSource.manager.find(CompanyEntity, { where: { name: ILike(`%${query}%`) }, skip: offset, take: limit })
    }

    async getContracts(customerId: string, offset: number = 0, limit: number = 100) {
        return this.dataSource.manager.find(ContractEntity, { where: { customerId }, skip: offset, take: limit, relations: ['customer', 'company'] })
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

    async fetchCustomers(token: string, pageSize: number = 100, page: number = 1, order: 'ASC' | 'DESC' = 'ASC') {
        try {
            const response = await lastValueFrom(this.httpService.get(
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

    async getCustomers(offset: number = 0, limit: number = 100, query?: string) {
        return this.dataSource.manager.find(CustomerEntity, { where: { displayName: ILike(`%${query}%`) }, skip: offset, take: limit })
    }

    private createOrUpdateCustomers(customers: Partial<CustomerEntity>[]) {
        customers = customers?.filter(customer => !!customer.id).map(customer => {
            if (customer.mainAddress) {
                const { streetNo, street } = splitStreetAndNumber(customer.mainAddress.street);
                customer.mainAddress.street = street;
                customer.mainAddress.streetNo = streetNo;
            }
            return customer;
        });
        return this.dataSource.transaction(async manager => {
            await manager.getRepository(CustomerEntity).upsert(customers, {
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
        // fetch companies
        try {
            const companies = await this.ask(`${GRANT.sub}/gesellschaften`);

            const items: Partial<CompanyEntity>[] = [];

            for (const company of companies) {
                const logo = await imageUrlToBase64(company.Logos[0].Pfad);
                items.push({
                    id: company.Value,
                    name: company.Text,
                    logoId: company.Logos[0].Pfad,
                    logo,
                });
            }

            await this.createOrUpdateCompanies(items);
        } catch (e) {
            this.logger.error(e);
        }
        

        // fetch customers
        const token = await this.getAccessToken();
        let numberOfPages = 1;
        const pageSize = 1000;
        for (let i = 1; i <= numberOfPages; i++) {
            const response = await this.fetchCustomers(token, pageSize, i, 'ASC');
            numberOfPages = response.numberOfPages;
            for (const customer of response.items) {
                await this.fetchContracts(token, customer.id, 1000, 1, 'ASC');

            }
        }

        this.logger.log('Synchronized data from blaudirekt!');
    }
}