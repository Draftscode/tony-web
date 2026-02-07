import { booleanAttribute, inject } from "@angular/core";
import { patchState, signalStore, withHooks, withMethods, withProps, withState } from "@ngrx/signals";
import { TranslateService } from "@ngx-translate/core";
import { lastValueFrom } from "rxjs";
import { MenuMode } from "../../features/authorized/app/main-menu/main-menu.component";
import { withResources } from "../../utils/signals";
import { BlaudirektService } from "../provider/blaudirekt.service";
export type Language = {
    key: string,
}

export const SettingsStore = signalStore(
    { providedIn: 'root' },
    withState({
        isVisible: false,
        i: new Date().toISOString(),
        languages: [{ key: 'de-DE' }, { key: 'en-GB' }] as Language[],
        selectedLanguageKey: null as string | null,
        isDark: window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches as boolean,
        menuMode: MenuMode.slim as MenuMode,
    }),
    withProps(store => ({
        baludirektService: inject(BlaudirektService),
        translate: inject(TranslateService),
    })),
    withResources(store => ({
        status: store.baludirektService.getStatus(store.i),
    })),
    withMethods(store => ({
        updateLanguage: (key: string | null) => {
            if (key) {
                store.translate.use(key);
            }
            patchState(store, { selectedLanguageKey: key });
            localStorage.setItem('lang', `${store.selectedLanguageKey()}`);
        },
        toggle: (value?: boolean) => {
            patchState(store, ({ isVisible }) =>
                ({ isVisible: typeof value === 'boolean' ? value : !isVisible }));
        },
        synchronize: async () => {
            patchState(store, { i: new Date().toISOString() });
            await lastValueFrom(store.baludirektService.synchronize());
            patchState(store, { i: new Date().toISOString() });
        },
        toggleMenuMode: () => {
            patchState(store, ({ menuMode }) => ({
                menuMode:
                    menuMode === MenuMode.static ?
                        MenuMode.slim :
                        MenuMode.static
            }));
            localStorage.setItem('menuMode', store.menuMode());
        },
        toggleDarkMode: () => {
            patchState(store, ({ isDark }) => ({ isDark: !isDark }));

            if (store.isDark()) {
                document.documentElement.classList.add('p-dark');
            } else {
                document.documentElement.classList.remove('p-dark');
            }

            localStorage.setItem('theme', `${store.isDark()}`);
        },
    })),
    withHooks((store) => ({
        onInit: () => {
            // language
            patchState(store, { selectedLanguageKey: localStorage.getItem('lang') || navigator.language });

            // menu
            patchState(store, { menuMode: localStorage.getItem('menuMode') as MenuMode || MenuMode.slim });

            // dark mode
            patchState(store, { isDark: localStorage.getItem('theme') ? booleanAttribute(localStorage.getItem('theme')) : window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches });
            if (store.isDark()) {
                document.documentElement.classList.add('p-dark');
            }
        }
    })),
);