import { computed, inject } from "@angular/core";
import { patchState, signalStore, withComputed, withMethods, withProps, withState } from "@ngrx/signals";
import { withResources } from "../../utils/signals";
import { BlaudirektService } from "../provider/blaudirekt.service";

export const CustomerStore = signalStore(
    { providedIn: 'root' },
    withState({
        filter: {
            query: '' as string,
            limit: 100,
            offset: 0,
            sortField: 'lastname',
            sortOrder: -1,
        },
    }),
    withProps(store => ({
        blaudirectService: inject(BlaudirektService),
    })),
    withResources(store => ({
        customers: store.blaudirectService.getAllCustomers({
            query: store.filter.query,
            limit: store.filter.limit,
            offset: store.filter.offset,
            sortField: store.filter.sortField,
            sortOrder: store.filter.sortOrder,
        }),
    })),
    withComputed(store => ({
        isLoading: computed(() => store.customers.isLoading()),
    })),
    withMethods(store => ({
        search: (filter: Partial<{ query: string; limit: number; offset: number; sortField: string; sortOrder: number }>) => {
            patchState(store, { filter: { ...store.filter(), ...filter } });
        },
    })),
);