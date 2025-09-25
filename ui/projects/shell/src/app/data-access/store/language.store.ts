import { computed, inject } from "@angular/core";
import { patchState, signalStore, withComputed, withHooks, withMethods, withProps, withState } from "@ngrx/signals";
import { TranslateService } from "@ngx-translate/core";

export type DataLanguage = {
    label: string;
    image: string;
    key: string;
}

export const LanguageStore = signalStore(
    { providedIn: 'root' },
    withState({
        key: 'en-GB' as string,
        languages: [{
            key: 'de-DE',
            image: 'flag-for-germany.svg',
            label: 'german',
        }, {
            key: 'en-GB',
            image: 'flag-for-united-kingdom.svg',
            label: 'english',
        }, {
            key: 'bg-BG',
            image: 'flag-for-bulgaria.svg',
            label: 'bulgarian',
        }] as DataLanguage[],
    }),
    withProps(store => ({
        translateService: inject(TranslateService),
    })),
    withComputed(store => ({
        currentLanguage: computed(() => store.languages().find(lang => lang.key === store.key())),
    })),
    withMethods(store => ({
        use: (key: string) => {
            store.translateService.use(key);
            patchState(store, { key });
        }
    })),
    withHooks(store => ({
        onInit: () => {
            store.translateService.use(navigator.language);
            patchState(store, { key: navigator.language });
        }
    }))
)