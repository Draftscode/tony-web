import { computed, inject } from "@angular/core";
import { patchState, signalMethod, signalStore, withComputed, withMethods, withProps, withState } from "@ngrx/signals";
import { withResources } from "../../utils/signals";
import { BlaudirektCustomer, BlaudirektService } from "../provider/blaudirekt.service";
import { DialogService } from "primeng/dynamicdialog";
import { lastValueFrom } from "rxjs";
import { LinkDialog } from "../../dialogs/link/link.dialog";
import { LinkService } from "../provider/link.service";

export const CustomerStore = signalStore(
    { providedIn: 'root' },
    withState({
        hash: '' as string,
        filter: {
            query: '' as string,
            limit: 100,
            offset: 0,
            sortField: 'lastname',
            sortOrder: -1,
            i: new Date().toISOString(),
        },
    }),
    withProps(store => ({
        blaudirectService: inject(BlaudirektService),
        linkService: inject(LinkService),
        dialogService: inject(DialogService),
    })),
    withResources(store => ({
        link: store.linkService.findLink(store.hash),
        customers: store.blaudirectService.getAllCustomers({
            query: store.filter.query,
            limit: store.filter.limit,
            offset: store.filter.offset,
            sortField: store.filter.sortField,
            sortOrder: store.filter.sortOrder,
            i: store.filter.i,
        }),
    })),
    withComputed(store => ({
        isLoading: computed(() => store.customers.isLoading()),
    })),
    withMethods(store => ({
        search: (filter: Partial<{ query: string; limit: number; offset: number; sortField: string; sortOrder: number }>) => {
            patchState(store, { filter: { ...store.filter(), ...filter } });
        },
        connectHash: signalMethod<string | null>(hash => {
            if (!hash || store.hash() === hash) { return; }
            patchState(store, { hash });
        }),
        viewLink: (customer: string) => {
            const ref = store.dialogService.open(LinkDialog, {
                closable: true,
                data: customer,
                header: 'FOO',
                modal: true,
            });
        },
        revokeLink: async (linkId: number) => {
            await lastValueFrom(store.linkService.revoke(linkId));
            patchState(store, { filter: { ...store.filter(), i: new Date().toISOString() } });
        },
        createLink: async (customer: BlaudirektCustomer) => {
            const link = await lastValueFrom(store.linkService.createLink(customer.id, {
                path: 'signing',
                customerId: customer.id,
            }));
            patchState(store, { filter: { ...store.filter(), i: new Date().toISOString() } });
        }
    })),
);