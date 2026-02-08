import { HttpClient, httpResource } from "@angular/common/http";
import { inject, Injectable, Signal } from "@angular/core";
import { environment } from "../../../environments/environment";

export type SearchResult<T = Record<string, unknown>> = {
    label: string,
    items: (T)[],
}

const ORIGIN = `${environment.origin}/search`;

@Injectable({ providedIn: 'root' })
export class SearchService {
    private readonly http = inject(HttpClient);

    search<T = Record<string, unknown>>(
        query: Signal<string | undefined | null>) {
        return httpResource<SearchResult<T>[]>(() => query() !== null && query() !== undefined ? ({
            url: `${ORIGIN}`,
            method: 'GET',
            params: {
                q: query()!,
            }
        }) : undefined,
            {
                defaultValue: []
            })
    }
}