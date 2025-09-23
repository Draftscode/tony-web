import { HttpClient, HttpParams } from "@angular/common/http";
import { inject, Injectable, resource, signal } from "@angular/core";
import { toSignal } from "@angular/core/rxjs-interop";
import { debounceTime, lastValueFrom, Subject } from "rxjs";
import { environment } from "../../environments/environment";

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

export type BlaudirektCustomer = {
    id: string;
    mainAddress?: CustomerAddress;
    firstname: string;
    displayName: string;
    lastname: string;
    gender: string;
    title: string;
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

export type BlaudirekContractLine = {
    id: string;
    text: string;
    group: string;
}
export type BlaudirectContract = {
    agency: BlaudirektCompany;
    agencyId: string;
    applicationId: string;
    company: BlaudirektCompany;
    id: string;
    line: BlaudirekContractLine;
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

export type BlaudirektDivision = {
    Text: string;
    Value: string;
}

@Injectable({ providedIn: 'root' })
export class BlaudirektService {
    readonly isInitialized = signal<boolean>(false);
    private readonly http = inject(HttpClient);
    private readonly query$ = new Subject<string>();
    private readonly query = toSignal(this.query$.pipe(debounceTime(500)));

    private readonly _customers = resource({
        params: () => {
            return { query: this.query() }
        },
        loader: ({ params }) => this.searchCustomers(params.query),
        defaultValue: [],

    });

    search(query: string) {
        this.query$.next(query);
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

    get customers() {
        return this._customers;
    }
}