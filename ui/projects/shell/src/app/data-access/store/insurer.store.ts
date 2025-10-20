import { computed, inject } from "@angular/core";
import { patchState, signalStore, withComputed, withMethods, withProps, withState } from "@ngrx/signals";
import { DialogService } from "primeng/dynamicdialog";
import { withResources } from "../../utils/signals";
import { BlaudirektService } from "../provider/blaudirekt.service";

export const InsurerStore = signalStore(
    { providedIn: 'root' },
    withState({
        filter: {
            query: '' as string,
            limit: 100,
            offset: 0,
            sortField: 'name',
            sortOrder: -1,
            timestamp: new Date().toISOString(),
        },
    }),
    withProps(store => ({
        blaudirectService: inject(BlaudirektService),
        dialogService: inject(DialogService),
    })),
    withResources(store => ({
        insurers: store.blaudirectService.getAllInsurer({
            query: store.filter.query,
            limit: store.filter.limit,
            offset: store.filter.offset,
            sortField: store.filter.sortField,
            sortOrder: store.filter.sortOrder,
            i: store.filter.timestamp,
        }),
    })),
    withComputed(store => ({
        isLoading: computed(() => store.insurers.isLoading()),
    })),
    withMethods(store => ({
        search: (filter: Partial<{ query: string; limit: number; offset: number; sortField: string; sortOrder: number }>) => {
            patchState(store, { filter: { ...store.filter(), ...filter } });
        },
    })),
);