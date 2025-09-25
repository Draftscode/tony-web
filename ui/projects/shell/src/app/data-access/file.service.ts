import { HttpClient, HttpEvent, HttpParams } from "@angular/common/http";
import { inject, Injectable, resource, signal } from "@angular/core";
import { TranslateService } from "@ngx-translate/core";
import { MessageService } from "primeng/api";
import { finalize, lastValueFrom, map, Observable, tap } from "rxjs";
import { environment } from "../../environments/environment";
import { Content, toPdf } from "../utils/to-pdf";


type DropboxFile = {
    id: number;
    lastModified: string;
    filename: string;
}


@Injectable({ providedIn: 'root' })
export class FileService {
    private readonly http = inject(HttpClient);
    private readonly _isLoading = signal<boolean>(false);
    private readonly pMessage = inject(MessageService);
    private readonly translateService = inject(TranslateService);

    readonly query = signal<string>('');
    private readonly timestamp = signal<string>(new Date().toISOString());

    private readonly _files = resource({
        params: () => {
            return { query: this.query(), timestamp: this.timestamp() }
        },
        loader: ({ params }) => this.listFiles(params.query, params.timestamp),
        defaultValue: [],
    });



    connectQuery(stream$: Observable<string>) {
        stream$.subscribe(value => {
            this.search(value);
        });
    }

    constructor() {


    }

    search(value: string) {
        this.query.set(value);
    }


    private async listFiles(query: string = '', timestamp: string = '') {
        this._isLoading.set(true);
        const params = new HttpParams().append('q', query);
        return lastValueFrom(
            this.http.get<DropboxFile[]>(`${environment.origin}/files`, { params }).pipe(
                finalize(() => this._isLoading.set(false)),
            ));
    }

    importFiles(files: File[]): Observable<HttpEvent<any>> {
        const formData = new FormData();
        files.forEach(file => formData.append('files', file, file.name));

        return this.http.post<DropboxFile>(`${environment.origin}/files/import`, formData, {
            reportProgress: true,
            observe: 'events', // allows tracking upload progress
        }).pipe(finalize(() => this.refresh()));
    }



    async renameFile(fileId: string, toPath: string) {
        this._isLoading.set(true);
        try {
            const original = this._files.value()?.find(file => `${file.id}` === fileId);

            if (original) {
                await lastValueFrom(this.http.put<void>(`${environment.origin}/files/move`, {
                    fromPath: original.filename,
                    toPath: toPath
                }).pipe(
                    tap(() => this.refresh())
                ));
            }
        } finally {
            this._isLoading.set(false);
        }
    }

    async deleteFile(filename: string) {
        this._isLoading.set(true);
        try {
            await lastValueFrom(this.http.delete<void>(`${environment.origin}/files/${filename}`));
            this.refresh();
        } finally {
            this.isLoading.set(false)
        }
    }

    createPdf<T extends Content>(contents: T) {
        this.isLoading.set(true);

        const html = toPdf(contents, this.translateService);

        return this.http.post(`${environment.origin}/files/pdf`, { contents: html }, { responseType: 'blob' }).pipe(
            tap((blob) => {
                const fileURL = URL.createObjectURL(blob);
                window.open(fileURL, '_blank');
            }),
            finalize(() => this.isLoading.set(false)));
    }

    async writeFile<T>(filename: string, contents: T) {
        await lastValueFrom(this.http.put<any>(`${environment.origin}/files/${filename}`, {
            data: contents
        }).pipe(finalize(() => this.refresh())));
    }

    async readFile<T>(filename: string): Promise<T> {
        this._isLoading.set(true);

        return lastValueFrom(this.http.get<{ data: T }>(`${environment.origin}/files/${filename}`).pipe(
            map(response => response?.data),
            finalize(() => this._isLoading.set(false))
        ));
    }

    refresh() {
        this.timestamp.set(new Date().toISOString());
    }

    get isLoading() {
        return this._isLoading;
    }

    get files() {
        return this._files.value;
    }

}