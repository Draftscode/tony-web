import { HttpClient, HttpHeaders, httpResource } from "@angular/common/http";
import { computed, inject, Injectable, signal } from "@angular/core";
import { lastValueFrom, map, tap } from "rxjs";
import { environment } from "../../environments/environment";
import { InterceptorSkipReason } from "../interceptors/auth.interceptor";

export type User = {

};

class TUser {
    static parse(value: unknown): User | null {
        return {};
    }
}

type Credentials = {
    accessToken: string;
    refreshToken: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
    private readonly http = inject(HttpClient);
    private readonly credentials = signal<Credentials | null>(null);

    readonly refreshToken = computed(() => this.credentials()?.refreshToken ?? '');
    readonly accessToken = computed(() => this.credentials()?.accessToken ?? '');

    private readonly timestamp = signal<string | null>(null);

    canRefresh() {
        return !!this.credentials()?.refreshToken
    }

    readonly me = httpResource(() => {
        return this.timestamp() ? {
            url: `${environment.origin}/auth/me`,
        } : undefined;
    }, {
        parse: TUser.parse,
        defaultValue: undefined
    });

    constructor() {
        this.getCredentials();
    }

    setCredentials(credentials: Credentials | null) {
        if (!credentials) {
            sessionStorage.removeItem('credentials');
        } else {
            sessionStorage.setItem('credentials', JSON.stringify(credentials ?? {}));
        }

        this.credentials.set(credentials ?? null);
        this.timestamp.set(new Date().toISOString());
    }

    getCredentials() {
        const creds = sessionStorage.getItem('credentials');
        if (creds) {
            this.credentials.set(JSON.parse(creds) ?? null);
        }
        this.timestamp.set(new Date().toISOString())
    }

    async login(username: string, password: string) {
        const credentials = await (lastValueFrom(
            this.http.post<{ access_token: string; refresh_token: string }>
                (
                    `${environment.origin}/auth/login`,
                    { username, password },
                    {
                        headers: new HttpHeaders().set(InterceptorSkipReason.skipAuth, '')
                    },
                ).pipe(
                    map(response => ({
                        accessToken: response.access_token,
                        refreshToken: response.refresh_token,
                    })))));

        this.setCredentials(credentials);
    }

    refresh() {
        return this.http.post<{ access_token: string; refresh_token: string }>(
            `${environment.origin}/auth/refresh`,
            { refreshToken: this.refreshToken() },
            {
                headers: new HttpHeaders().set(InterceptorSkipReason.skipAuth, '')
            }
        ).pipe(
            map(response => ({
                accessToken: response.access_token,
                refreshToken: response.refresh_token,
            })),
            tap(credentials =>
                this.setCredentials(credentials)));

    }
}