import { HttpClient, httpResource } from "@angular/common/http";
import { inject, Injectable, Signal } from "@angular/core";
import { environment } from "../../../environments/environment";
import { BlaudirektCustomer } from "./blaudirekt.service";

export type Link<T> = {
    id: number;
    link: string;
    data: T;
    expirationTime: string;
    customer: BlaudirektCustomer;
}

const BASE = `${environment.origin}/link`;

@Injectable({ providedIn: 'root' })
export class LinkService {
    private readonly http = inject(HttpClient);

    findLink<T>(link: Signal<string>) {
        return httpResource<Link<T> | null>(() => link() ? ({
            url: `${BASE}/${link()}`,
            method: 'GET',
        }) : undefined, {
            defaultValue: null,
        })
    }

    createLink<T>(customerId: string, data: T) {
        return this.http.put(`${BASE}`, { data, customerId })
    }

    revoke(linkId: number) {
        return this.http.delete<void>(`${BASE}/${linkId}`);
    }
}