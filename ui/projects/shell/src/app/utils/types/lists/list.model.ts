import { Signal } from "@angular/core";
import { FilterMetadata } from "primeng/api";

export type ListResponse<T> = {
    items: T[];
    total: number;
}

export type ListOptions = {
    query: string;
    limit: number;
    offset: number;
}

export type ListOptionsSignal = {
    query: Signal<string>;
    limit: Signal<number>;
    offset: Signal<number>;
    filters: Signal<{
        [s: string]: FilterMetadata | FilterMetadata[] | undefined;
    }>;
    sortField: Signal<string>;
    sortOrder: Signal<number>;
}