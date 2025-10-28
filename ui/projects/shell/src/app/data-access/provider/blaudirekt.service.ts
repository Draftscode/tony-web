import { HttpClient, HttpParams, httpResource } from "@angular/common/http";
import { inject, Injectable, Signal, signal } from "@angular/core";
import { finalize, lastValueFrom } from "rxjs";
import { environment } from "../../../environments/environment";
import { ListOptionsSignal, ListResponse } from "../../utils/types/lists/list.model";
import { Link } from "./link.service";

export type Contract = {

};

export type CustomerAddress = {
    city: string;
    livingSpace: any;
    nation: { id: string; text: string };
    street: string;
    streetNo: string;
    zip: string;
}

export const BlaudirektCustomerStatus = ['new', 'advanced', 'terminated'];

export type BlaudirektCustomer = {
    id: string;
    contractsCount: number;
    mainAddress?: CustomerAddress;
    firstname: string;
    displayName: string;
    lastname: string;
    gender: string;
    title: string;
    blocked: boolean;
    blockReason: string;
    terminatedAt: string;
    isAlive: boolean;
    links: Link<unknown>[];
    status: string;
}

export enum PaymentCycle {
    monthly = '5',
    yearly = '1',
}

export type BlaudirektPayment = {
    interval: { id: string; text: string };
    netAmount: number;
    grossAmount: number;
}

export type BlaudirektDivision = {
    id: string;
    text: string;
    group: string;
    contractsCount: number;
    blocks?: BuildingBlock[];
}

export type BlaudirectContract = {
    agency: BlaudirektCompany;
    agencyId: string;
    applicationId: string;
    company: BlaudirektCompany;
    id: string;
    division: BlaudirektDivision;
    payment: BlaudirektPayment;
    policyNumber: string;
    publicId: string;
    risk: string;
    start?: string;
    end?: string;
}

export type BlaudirektCompany = {
    id: string;
    name: string;
    logo: string;
}

export type BuildingBlock = {
    key: string;
    placeholder: string;
    description: string;
    value?: string;
}

@Injectable({ providedIn: 'root' })
export class BlaudirektService {
    private readonly http = inject(HttpClient);
    isLoading = signal<boolean>(false);


    getAllCustomers(options: ListOptionsSignal & { i: Signal<string> }) {
        return httpResource<ListResponse<BlaudirektCustomer>>(() => ({
            url: `${environment.origin}/blaudirekt/customers`,
            method: 'GET',
            params: {
                q: options?.query(),
                limit: options?.limit() ?? 100,
                filters: JSON.stringify(options?.filters() ?? {}),
                offset: options?.offset() ?? 0,
                sortField: options?.sortField(),
                sortOrder: options?.sortOrder(),
                i: options?.i(),
            }
        }), {
            defaultValue: {
                items: [],
                total: 0
            },
        })
    }

    getCustomer(id: Signal<string>, i: Signal<string>) {
        return httpResource<BlaudirektCustomer | null>(() => id() ? ({
            url: `${environment.origin}/blaudirekt/customers/${id()}`,
            method: 'GET',
            params: {
                i: i()
            }
        }) : undefined, {
            defaultValue: null,
        })
    }

    getAllDivisions(options: ListOptionsSignal & { i: Signal<string> }) {
        return httpResource<ListResponse<BlaudirektDivision>>(() => ({
            url: `${environment.origin}/blaudirekt/divisions`,
            method: 'GET',
            params: {
                i: options.i(),
                q: options?.query(),
                limit: options?.limit() ?? 100,
                offset: options?.offset() ?? 0,
                sortField: options?.sortField(),
                sortOrder: options?.sortOrder()
            }
        }), {
            defaultValue: {
                items: [],
                total: 0
            },
        })
    }

    getAllInsurer(options: ListOptionsSignal & { i: Signal<string> }) {
        return httpResource<ListResponse<BlaudirektCompany>>(() => ({
            url: `${environment.origin}/blaudirekt/companies`,
            method: 'GET',
            params: {
                i: options.i(),
                q: options?.query(),
                limit: options?.limit() ?? 100,
                offset: options?.offset() ?? 0,
                sortField: options?.sortField(),
                sortOrder: options?.sortOrder()
            }
        }), {
            defaultValue: {
                items: [],
                total: 0
            },
        })
    }

    getDocument(id: string) {
        return this.http.get(`${environment.origin}/blaudirekt/document/${id}`, { responseType: 'blob' });
    }

    addDocument(customerId: string, html: string) {
        const params = new HttpParams().append('customer', customerId);
        return this.http.post(`${environment.origin}/blaudirekt/document`, { contents: html }, { params, responseType: 'blob' });
    }

    editInsurer(insurerId: string, insurer: Partial<BlaudirektCompany>) {
        return this.http.post<BuildingBlock[]>(`${environment.origin}/blaudirekt/companies/${insurerId}`, insurer);
    }


    editDivision(divisionId: string, division: Partial<BlaudirektDivision>) {
        return this.http.post<BuildingBlock[]>(`${environment.origin}/blaudirekt/division/${divisionId}`, division);
    }


    async refresh() {
        this.isLoading.set(true);
        return lastValueFrom(this.http.get<void>(`${environment.origin}/blaudirekt/refresh`).pipe(
            finalize(() => this.isLoading.set(false))
        ));
    }

    async searchCompanies(query: string = '') {
        const params = new HttpParams().append('q', query).append('limit', 100);
        return lastValueFrom(this.http.get<BlaudirektCompany[]>(`${environment.origin}/blaudirekt/companies`, { params }));
    }

    async searchCustomers(query: string = '') {
        const params = new HttpParams().append('q', query).append('limit', 100);
        return lastValueFrom(this.http.get<BlaudirektCustomer[]>(`${environment.origin}/blaudirekt/customers`, { params }));
    }

    async searchContracts(customerId?: string) {
        if (!customerId) { return []; }

        const params = new HttpParams().append('limit', 100);
        return lastValueFrom(this.http.get<BlaudirectContract[]>(`${environment.origin}/blaudirekt/contracts/${customerId}`, { params }));
    }
}