import { HttpClient, HttpEvent, httpResource } from "@angular/common/http";
import { inject, Injectable, Signal } from "@angular/core";
import { map, Observable } from "rxjs";
import { environment } from "../../../environments/environment";
import { ListResponse } from "../../utils/types/lists/list.model";
import { User } from "./auth.service";

export type DataFile = {
    id: number;
    lastModified: string;
    filename: string;
    user: User;
    messageCount: number;
    messages: any[];
}

@Injectable({ providedIn: 'root' })
export class FileService {
    private readonly http = inject(HttpClient);

    getAllFiles(q: Signal<string>, timestamp: Signal<string>, limit: Signal<number>, offset: Signal<number>) {
        return httpResource<ListResponse<DataFile>>(() => ({
            url: `${environment.origin}/files`,
            method: 'GET',
            params: {
                q: q(),
                t: timestamp(),
                limit: limit(),
                offset: offset(),
            }
        }), {
            defaultValue: {
                items: [],
                total: 0
            },
        })
    }


    importFiles(files: File[]): Observable<HttpEvent<any>> {
        const formData = new FormData();
        files.forEach(file => formData.append('files', file, file.name));

        return this.http.post<DataFile>(`${environment.origin}/files/import`, formData, {
            reportProgress: true,
            observe: 'events', // allows tracking upload progress
        });
    }

    renameFile(fromPath: string, toPath: string) {
        return this.http.put<void>(`${environment.origin}/files/move`, {
            fromPath,
            toPath,
        });
    }

    deleteFile(filename: string) {
        return this.http.delete<void>(`${environment.origin}/files/${filename}`);
    }

    createPdf(html: string) {
        return this.http.post(`${environment.origin}/files/pdf`, { contents: html }, { responseType: 'blob' });
    }

    writeFile<T>(filename: string, contents: T) {
        return this.http.put<any>(`${environment.origin}/files/${filename}`, {
            data: contents
        });
    }

    readFile<T>(filename: string) {
        return this.http.get<{ data: T }>(`${environment.origin}/files/${filename}`).pipe(
            map(response => response?.data));
    }
}