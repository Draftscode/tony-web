import { inject, Injectable, signal } from "@angular/core";
import { MessageService } from "primeng/api";
import { finalize, of, tap } from "rxjs";
import { Content, toPdf } from "../utils/to-pdf";
import { HttpClient } from "@angular/common/http";
import { environment } from "../../environments/environment";

@Injectable({ providedIn: 'root' })
export class PdfService {
    private readonly _pMessage = inject(MessageService);
    private readonly http = inject(HttpClient);
    isLoading = signal<boolean>(false);

    createPdf<T extends Content>(contents: T) {
        this.isLoading.set(true);

        const html = toPdf(contents);

        return this.http.post(`${environment.origin}/files/pdf`, { contents: html }, { responseType: 'blob' }).pipe(
            tap((blob) => {
                const fileURL = URL.createObjectURL(blob);
                window.open(fileURL, '_blank');
            }),
            finalize(() => this.isLoading.set(false)));
    }
}