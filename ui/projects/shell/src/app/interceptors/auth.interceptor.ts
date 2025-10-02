import { HttpContextToken, HttpErrorResponse, HttpEvent, HttpHandlerFn, HttpRequest, HttpStatusCode } from "@angular/common/http";
import { inject } from "@angular/core";
import { toObservable } from "@angular/core/rxjs-interop";
import { catchError, filter, from, Observable, switchMap, take, throwError, timeout } from "rxjs";
import { AccountStore } from "../data-access/store/account.store";

export const SKIP_AUTH_INTERCEPTION = new HttpContextToken(() => false);


export function authInterceptor(req: HttpRequest<unknown>, next: HttpHandlerFn): Observable<HttpEvent<unknown>> {

    const accountStore = inject(AccountStore);
    const shouldWait$ = toObservable(accountStore.isRefreshing);

    const copyWithCredentials = (req: HttpRequest<unknown>) => {
        return req.clone({
            headers: req.headers.append('Authorization', `Bearer ${accountStore.accessToken()}`)
        })
    }
    const handle401 = (req: HttpRequest<unknown>, next: HttpHandlerFn) => {
        if (accountStore.canRefresh() && !accountStore.isRefreshing()) {
            return from(accountStore.refresh()).pipe(
                switchMap(() => next(copyWithCredentials(req))));
        }

        return shouldWait$.pipe(
            filter(wait => !wait),
            timeout(40_000), // ensure this does not queue longer than 40 secs
            take(1),
            switchMap(_ => next(copyWithCredentials(req))),
        );
    }


    if (req.context.has(SKIP_AUTH_INTERCEPTION)) {
        return next(req);
    }

    return next(copyWithCredentials(req)).pipe(
        catchError((e: HttpErrorResponse) => {
            if (e instanceof HttpErrorResponse && e.status === HttpStatusCode.Unauthorized) {
                console.log('ERR')
                return handle401(req, next);
            }
            return throwError(() => e);
        }),
    );
}