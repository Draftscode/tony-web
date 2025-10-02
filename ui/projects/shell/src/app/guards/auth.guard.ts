import { inject } from "@angular/core";
import { toObservable } from '@angular/core/rxjs-interop';
import { ActivatedRouteSnapshot, Router, RouterStateSnapshot } from "@angular/router";
import { filter, map } from "rxjs";
import { AccountStore } from "../data-access/store/account.store";

export function authGuard(activatedRoute: ActivatedRouteSnapshot, route: RouterStateSnapshot) {
    const accountStore = inject(AccountStore);
    const status$ = toObservable(accountStore.me.status);
    const router = inject(Router);
    return status$.pipe(
        filter(status => ['idle', 'loading', 'reloading'].indexOf(status) === -1),
        map(status => {
            if (status === 'error') {
                return router.createUrlTree(['/', 'auth', 'login']);
            }
            return true;
        }));
}
