import { computed, inject } from "@angular/core";
import { patchState, signalStore, withComputed, withMethods, withProps, withState } from "@ngrx/signals";
import { rxMethod } from "@ngrx/signals/rxjs-interop";
import { FilterMetadata } from "primeng/api";
import { DialogService } from "primeng/dynamicdialog";
import { lastValueFrom, map, pipe, take } from "rxjs";
import { BlocksDialog } from "../../features/authorized/blocks/dialog/blocks.dialog";
import { withResources } from "../../utils/signals";
import { BlaudirektDivision, BlaudirektService } from "../provider/blaudirekt.service";

export const DivisionStore = signalStore(
    { providedIn: 'root' },
    withState({
        filter: {
            query: '' as string,
            limit: 100,
            offset: 0,
            sortField: 'text',
            sortOrder: -1,
            filters: {} as {
                [s: string]: FilterMetadata | FilterMetadata[] | undefined;
            },
            timestamp: new Date().toISOString(),
        },
        text: undefined as string | undefined,
    }),
    withProps(store => ({
        blaudirectService: inject(BlaudirektService),
        dialogService: inject(DialogService),
    })),
    withResources(store => ({
        divisions: store.blaudirectService.getAllDivisions({
            query: store.filter.query,
            limit: store.filter.limit,
            offset: store.filter.offset,
            filters: store.filter.filters,
            sortField: store.filter.sortField,
            sortOrder: store.filter.sortOrder,
            i: store.filter.timestamp,
        }),
    })),
    withComputed(store => ({
        isLoading: computed(() => store.divisions.isLoading()),
    })),
    withMethods(store => ({
        createBlocks: async (division: BlaudirektDivision) => {
            const ref = store.dialogService.open(BlocksDialog, {
                data: { division },
                header: 'block.label',
                modal: true,
                closable: true,
            });

            if (!ref) {
                return;
            }

            const result = await lastValueFrom(ref.onClose.pipe(take(1)));
            if (result?.type === 'manually') {
                await lastValueFrom(store.blaudirectService.editDivision(division.id, { blocks: result.data.blocks, info: result.data.info }));
                patchState(store, { filter: { ...store.filter(), timestamp: new Date().toISOString() } });
            }
        },
        updateDivision: async (divisionId: string, dto: Partial<BlaudirektDivision>) => {
            await lastValueFrom(store.blaudirectService.editDivision(divisionId, dto));
            patchState(store, { filter: { ...store.filter(), timestamp: new Date().toISOString() } });
        },
        search: (filter: Partial<{ query: string; limit: number; offset: number; sortField: string; sortOrder: number }>) => {
            patchState(store, { filter: { ...store.filter(), ...filter } });
        },
        connectOne: rxMethod<string>(pipe(map((divisionText: string) => {

        }))),
    })),
);