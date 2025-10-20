import { inject } from "@angular/core";
import { patchState, signalMethod, signalStore, withMethods, withProps, withState } from "@ngrx/signals";
import { DialogService } from "primeng/dynamicdialog";
import { lastValueFrom } from "rxjs";
import { LinkDialog } from "../../dialogs/link/link.dialog";
import { withResources } from "../../utils/signals";
import { BlaudirektCustomer } from "../provider/blaudirekt.service";
import { LinkService } from "../provider/link.service";

export const LinkStore = signalStore(
    { providedIn: 'root' },
    withState({
        hash: '' as string,
    }),
    withProps(store => ({
        linkService: inject(LinkService),
        dialogService: inject(DialogService),
    })),
    withResources(store => ({
        link: store.linkService.findLink(store.hash),
    })),
    withMethods(store => ({
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
        revoke: async (linkId: number) => {
            await lastValueFrom(store.linkService.revoke(linkId))
        },
        createLink: async (customer: BlaudirektCustomer) => {
            const link = await lastValueFrom(store.linkService.createLink(customer.id, {
                path: 'signing',
                customerId: customer.id,
            }));

            console.log('LINK', link)
        }
    }))
);