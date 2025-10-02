import { HttpClient, HttpContext, httpResource } from "@angular/common/http";
import { inject, Injectable, Signal } from "@angular/core";
import { map } from "rxjs";
import { environment } from "../../environments/environment";
import { SKIP_AUTH_INTERCEPTION } from "../interceptors/auth.interceptor";

export type User = {
    id: number;
    firstnames: string;
    lastname: string;
    username: string;
};

class TUser {
    static parse(value: unknown): User | null {
        const v = value as never;
        return {
            id: v['id'],
            firstnames: v['firstnames'],
            lastname: v['lastname'],
            username: v['username'],
        } as User;
    }
}

export type Credentials = {
    accessToken: string;
    refreshToken: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
    private readonly http = inject(HttpClient);

    getMe(accessToken: Signal<string | undefined>) {
        return httpResource<User | null>(() => accessToken() ? ({
            url: `${environment.origin}/auth/me`,
            method: 'GET',
        }) : undefined, {
            defaultValue: null,
        })
    }

    login(username: string, password: string) {
        return this.http.post<{ access_token: string; refresh_token: string }>
            (
                `${environment.origin}/auth/login`,
                { username, password },
                {
                    context: new HttpContext().set(SKIP_AUTH_INTERCEPTION, true),
                },
            ).pipe(
                map(response => ({
                    accessToken: response.access_token,
                    refreshToken: response.refresh_token,
                })));
    }

    refresh(refreshToken: string) {
        return this.http.post<{ access_token: string; refresh_token: string }>(
            `${environment.origin}/auth/refresh`,
            { refreshToken },
            {
                context: new HttpContext().set(SKIP_AUTH_INTERCEPTION, true),
            }
        ).pipe(
            map(response => ({
                accessToken: response.access_token,
                refreshToken: response.refresh_token,
            })));

    }
}