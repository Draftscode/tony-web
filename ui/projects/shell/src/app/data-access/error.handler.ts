import { HttpErrorResponse } from "@angular/common/http";
import { ErrorHandler, inject } from "@angular/core";
import { TranslateService } from "@ngx-translate/core";
import { MessageService } from "primeng/api";

export class GlobalErrorHandler implements ErrorHandler {
    private readonly translateService = inject(TranslateService);
    private readonly _pMessage = inject(MessageService);

    handleError(error: HttpErrorResponse): void {
        console.error('Err', error);

        if (error instanceof HttpErrorResponse) {
            const code = error.error.error?.toLowerCase() ?? 'unknown';
            this._pMessage.add({
                severity: 'error',
                life: 10_000,
                summary: this.translateService.instant(`auth.code.${code}.summary`),
                detail: this.translateService.instant(`auth.code.${code}.detail`),
                closable: true
            });
        } else {
            this._pMessage.add({ severity: 'error', life: 10_000, summary: 'Local Error', detail: 'something went wrong', closable: true });
        }
    }
}