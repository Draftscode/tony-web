import { Signal } from "@angular/core";

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
    sortField: Signal<string>;
    sortOrder: Signal<number>;
}