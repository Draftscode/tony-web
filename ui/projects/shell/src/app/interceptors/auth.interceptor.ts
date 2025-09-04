import { HttpErrorResponse, HttpEvent, HttpHandlerFn, HttpRequest, HttpStatusCode } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { BehaviorSubject, catchError, filter, finalize, Observable, switchMap, take, throwError, timeout } from "rxjs";
import { AuthService } from "../data-access/auth.service";

export enum InterceptorSkipReason {
    skipAuth = 'X-Skip-Auth-Interceptor',
}

@Injectable({ providedIn: 'root' })
export class ShouldWait {
    shouldWait = new BehaviorSubject<boolean>(false);
}



export function authInterceptor(req: HttpRequest<unknown>, next: HttpHandlerFn): Observable<HttpEvent<unknown>> {

    const authService = inject(AuthService);
    const shouldWaitService = inject(ShouldWait);


    const copyWithCredentials = (req: HttpRequest<unknown>) => {
        return req.clone({
            headers: req.headers.append('Authorization', `Bearer ${authService.accessToken()}`)
        })
    }
    const handle401 = (req: HttpRequest<unknown>, next: HttpHandlerFn) => {
        if (authService.canRefresh() && !shouldWaitService.shouldWait.getValue()) {
            shouldWaitService.shouldWait.next(true);
            return authService.refresh().pipe(
                catchError(e => {
                    authService.setCredentials(null);
                    shouldWaitService.shouldWait.next(false);
                    return throwError(() => e);
                }),
                switchMap(() => {
                    return next(copyWithCredentials(req))
                }),
                finalize(() => shouldWaitService.shouldWait.next(false)),
            )
        }

        return shouldWaitService.shouldWait.pipe(
            filter(wait => !wait),
            timeout(40_000), // ensure this does not queue longer than 40 secs
            take(1),
            switchMap(_ => next(copyWithCredentials(req))),
        );
    }


    if (req.headers.has(InterceptorSkipReason.skipAuth)) {
        return next(req.clone({
            headers: req.headers.delete('X-Skip-Auth-Interceptor'),
        }));
    }

    return next(copyWithCredentials(req)).pipe(
        catchError((e: HttpErrorResponse) => {
            if (e instanceof HttpErrorResponse && e.status === HttpStatusCode.Unauthorized) {
                return handle401(req, next);
            }
            return throwError(() => e);
        }),
    );
}