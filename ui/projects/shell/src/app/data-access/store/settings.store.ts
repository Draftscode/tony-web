import { inject } from "@angular/core";
import { patchState, signalStore, withMethods, withProps, withState } from "@ngrx/signals";
import { lastValueFrom } from "rxjs";
import { withResources } from "../../utils/signals";
import { BlaudirektService } from "../provider/blaudirekt.service";

export const SettingsStore = signalStore(
    { providedIn: 'root' },
    withState({
        isVisible: false,
        i: new Date().toISOString(),
    }),
    withProps(store => ({
        baludirektService: inject(BlaudirektService),
    })),
    withResources(store => ({
        status: store.baludirektService.getStatus(store.i),
    })),
    withMethods(store => ({
        toggle: (value?: boolean) => {
            patchState(store, ({ isVisible }) =>
                ({ isVisible: typeof value === 'boolean' ? value : !isVisible }));
        },
        synchronize: async () => {
            patchState(store, { i: new Date().toISOString() });
            await lastValueFrom(store.baludirektService.synchronize());
            patchState(store, { i: new Date().toISOString() });
        }
    })),
);