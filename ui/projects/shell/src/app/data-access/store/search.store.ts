import { inject } from "@angular/core";
import { patchState, signalMethod, signalStore, withMethods, withProps, withState } from "@ngrx/signals";
import { withResources } from "../../utils/signals";
import { SearchService } from "../provider/search.service";

export const SearchStore = signalStore(
    { providedIn: 'root' },
    withState({
        query: undefined as string | null | undefined,
    }),
    withProps(store => ({
        searchService: inject(SearchService),
    })),
    withResources(store => ({
        searchResult: store.searchService.search(store.query),
    })),
    withMethods(store => ({
        connectQuery: signalMethod<string | undefined | null>((query) => {
            patchState(store, { query });
        }),
    })),
)