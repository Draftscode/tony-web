import { computed, inject } from "@angular/core";
import { Router } from "@angular/router";
import { patchState, signalStore, withComputed, withHooks, withMethods, withProps, withState } from "@ngrx/signals";
import { lastValueFrom } from "rxjs";
import { withResources } from "../../utils/signals";
import { AuthService, Credentials, User } from "../provider/auth.service";
import { UserService } from "../provider/user.service";

export const AccountStore = signalStore(
    { providedIn: 'root' },
    withState({
        i: new Date().toISOString(),
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
        router: inject(Router),
        authService: inject(AuthService),
        userService: inject(UserService),
        setCredentials: (credentials: Credentials | null) => {
            if (credentials) {
                localStorage.setItem('credentials', JSON.stringify(credentials ?? {}));
            } else {
                localStorage.removeItem('credentials');
            }

            patchState(store, { credentials });
        },

        getCredentials: () => {
            const creds = localStorage.getItem('credentials');
            if (creds) {
                patchState(store, { credentials: JSON.parse(creds) ?? null });
            }
        }
    })),
    withResources(store => ({
        me: store.authService.getMe(store.accessToken, store.i),
    })),
    withMethods(store => ({
        logout: () => {
            store.setCredentials(null);
            store.router.navigate(['/auth']);
        },
        login: async (username: string, password: string) => {
            const credentials = await lastValueFrom(store.authService.login(username, password));
            store.setCredentials(credentials);
        },
        editMe: async (dto: Partial<User>) => {
            const user = await lastValueFrom(store.userService.editMe(dto));
            patchState(store, { i: new Date().toISOString() });
        },
        refresh: async () => {
            const token = store.refreshToken();
            if (!token) { throw new Error('no refresh token'); }

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
    withComputed(store => ({
        abbrev: computed(() => {
            return `${store.me.value()?.firstname?.slice(0, 1)?.toUpperCase() ?? ''}${store.me.value()?.lastname?.slice(0, 1)?.toUpperCase() ?? ''}`;
        }),
    })),
    withHooks(store => ({
        onInit: () => {
            store.getCredentials();
        }
    }))
);