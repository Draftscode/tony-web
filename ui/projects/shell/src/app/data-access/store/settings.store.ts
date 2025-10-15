import { patchState, signalStore, withMethods, withState } from "@ngrx/signals";

export const SettingsStore = signalStore(
    { providedIn: 'root' },
    withState({
        isVisible: false,
    }),
    withMethods(store => ({
        toggle: (value?: boolean) => {
            patchState(store, ({ isVisible }) =>
                ({ isVisible: typeof value === 'boolean' ? value : !isVisible }));
        },
    }))
);