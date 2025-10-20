import { inject } from "@angular/core";
import { toObservable } from '@angular/core/rxjs-interop';
import { ActivatedRouteSnapshot, Router, RouterStateSnapshot } from "@angular/router";
import { catchError, filter, map, of } from "rxjs";
import { AccountStore } from "../data-access/store/account.store";

export function authGuard(activatedRoute: ActivatedRouteSnapshot, route: RouterStateSnapshot) {
    const accountStore = inject(AccountStore);
    const status$ = toObservable(accountStore.me.status);
    const router = inject(Router);
    return status$.pipe(
        filter(status => {
            if (accountStore.accessToken() &&
                (status === 'loading' ||
                    status === 'reloading' ||
                    status === 'idle')) {
                return false;
            }

            return true;
        }),
        catchError(e => of('error')),
        map(status => {
            if (status === 'error' || !accountStore.accessToken()) {
                return router.createUrlTree(['/', 'auth', 'login']);
            }
            return true;
        }));
}
