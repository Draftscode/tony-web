import { computed, inject } from "@angular/core";
import { patchState, signalStore, withComputed, withHooks, withMethods, withProps, withState } from "@ngrx/signals";
import { lastValueFrom } from "rxjs";
import { withResources } from "../../utils/signals";
import { AuthService, Credentials } from "../auth.service";

export const AccountStore = signalStore(
    { providedIn: 'root' },
    withState({
        isRefreshing: false,
        timestamp: new Date().toISOString(),
        credentials: null as Credentials | null,
    }),
    withComputed(store => ({
        accessToken: computed(() => store.credentials()?.accessToken),
        refreshToken: computed(() => store.credentials()?.refreshToken),
        canRefresh: computed(() => !!store.credentials()?.refreshToken)
    })),
    withProps(store => ({
        authService: inject(AuthService),
        setCredentials: (credentials: Credentials | null) => {
            if (!credentials) {
                sessionStorage.removeItem('credentials');
            } else {
                sessionStorage.setItem('credentials', JSON.stringify(credentials ?? {}));
            }

            patchState(store, { credentials });
        },

        getCredentials: () => {
            const creds = sessionStorage.getItem('credentials');
            if (creds) {
                patchState(store, { credentials: JSON.parse(creds) ?? null });
            }
        }
    })),
    withResources(store => ({
        me: store.authService.getMe(store.accessToken),
    })),
    withMethods(store => ({
        logout: () => {
            store.setCredentials(null);
        },
        login: async (username: string, password: string) => {
            const credentials = await lastValueFrom(store.authService.login(username, password));
            store.setCredentials(credentials);
        },
        refresh: async () => {
            const token = store.refreshToken();
            if (!token) { throw Error('no refresh token'); }

            patchState(store, { isRefreshing: true });
            try {
                const credentials = await lastValueFrom(store.authService.refresh(token));
                store.setCredentials(credentials);
            } catch {
                store.setCredentials(null);
            } finally {
                patchState(store, { isRefreshing: false });
            }
        }
    })),

    withHooks(store => ({
        onInit: () => {
            store.getCredentials();
        }
    }))
);