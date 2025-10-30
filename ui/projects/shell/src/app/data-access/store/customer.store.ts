import { computed, inject } from "@angular/core";
import { patchState, signalMethod, signalStore, withComputed, withMethods, withProps, withState } from "@ngrx/signals";
import { FilterMetadata } from "primeng/api";
import { DialogService } from "primeng/dynamicdialog";
import { lastValueFrom, take } from "rxjs";
import { LinkDialog } from "../../dialogs/link/link.dialog";
import { NoteDialog } from "../../dialogs/note-dialog/note.dialog";
import { withResources } from "../../utils/signals";
import { BlaudirektCustomer, BlaudirektNote, BlaudirektService } from "../provider/blaudirekt.service";
import { LinkService } from "../provider/link.service";

export const CustomerStore = signalStore(
    { providedIn: 'root' },
    withState({
        hash: '' as string,
        customerId: '' as string,
        filter: {
            query: '' as string,
            limit: 100,
            offset: 0,
            sortField: 'lastname',
            sortOrder: -1,
            filters: {} as {
                [s: string]: FilterMetadata | FilterMetadata[] | undefined;
            },
            i: new Date().toISOString(),
        },
        i: new Date().toISOString(),
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
            filters: store.filter.filters,
            offset: store.filter.offset,
            sortField: store.filter.sortField,
            sortOrder: store.filter.sortOrder,
            i: store.filter.i,
        }),
        customer: store.blaudirectService.getCustomer(store.customerId, store.i)
    })),
    withComputed(store => ({
        isLoading: computed(() => store.customers.isLoading()),
    })),
    withMethods(store => ({
        editNote: async (customerId: string, note: BlaudirektNote) => {
            const ref = store.dialogService.open(NoteDialog, {
                modal: true,
                header: 'Notizen',
                data: note,
                closable: true,
                width: '420px'
            });

            const response = await lastValueFrom(ref.onClose.pipe(take(1)));
            if (response?.type === 'manually') {
                await lastValueFrom(store.blaudirectService.editNote(customerId, note.id, response.data));
                patchState(store, { i: new Date().toISOString() });
            }
        },
        addNote: async (customerId: string) => {
            const ref = store.dialogService.open(NoteDialog, {
                modal: true,
                header: 'Notizen',
                closable: true,
                width: '420px'
            });

            const response = await lastValueFrom(ref.onClose.pipe(take(1)));
            if (response?.type === 'manually') {
                await lastValueFrom(store.blaudirectService.addNote(customerId, response.data));
                patchState(store, { i: new Date().toISOString() });
            }
        },
        removeNote: async (noteId: string) => {
            await lastValueFrom(store.blaudirectService.removeNote(noteId));
            patchState(store, { i: new Date().toISOString() });
        },
        search: (filter: Partial<{
            filters?: {
                [s: string]: FilterMetadata | FilterMetadata[] | undefined;
            },
            query: string;
            limit: number;
            offset: number;
            sortField: string;
            sortOrder: number;
            i: string;
        }>) => {
            patchState(store, {
                filter: {
                    ...store.filter(),
                    ...filter,
                    filters: {
                        ...filter.filters,
                    }
                }
            });
        },
        connectHash: signalMethod<string | null>(hash => {
            if (!hash || store.hash() === hash) { return; }
            patchState(store, { hash });
        }),
        connectCustomer: signalMethod<string | null>(customerId => {
            if (!customerId || store.hash() === customerId) { return; }
            patchState(store, { customerId });
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
            patchState(store, { i: new Date().toISOString() });
        },
        createLink: async (customer: BlaudirektCustomer) => {
            const link = await lastValueFrom(store.linkService.createLink(customer.id, {
                path: 'signing',
                customerId: customer.id,
            }));
            patchState(store, { i: new Date().toISOString() });
        }
    })),
);