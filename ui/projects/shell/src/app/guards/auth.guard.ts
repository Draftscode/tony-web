import { inject } from "@angular/core";
import { toObservable } from '@angular/core/rxjs-interop';
import { ActivatedRouteSnapshot, Router, RouterStateSnapshot } from "@angular/router";
import { filter, map, tap } from "rxjs";
import { AuthService } from "../data-access/auth.service";

export function authGuard(activatedRoute: ActivatedRouteSnapshot, route: RouterStateSnapshot) {
    const resource = inject(AuthService).me;
    const status$ = toObservable(resource.status);
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
