import { HttpClient } from "@angular/common/http";
import { Injectable, inject } from "@angular/core";
import { TranslateLoader } from "@ngx-translate/core";
import { Observable, forkJoin, map } from "rxjs";

@Injectable()
export class JsonFileLoader implements TranslateLoader {
    private readonly http = inject(HttpClient);
    private readonly prefix = 'i18n';
    private readonly files = ['common', 'person', 'blaudirekt', 'validation', 'auth','roles'];
    private readonly suffix = '.json';

    getTranslation(lang: string): Observable<any> {
        const requests = this.files.map(filename =>
            this.http.get(`${this.prefix}/${lang}/${filename}${this.suffix}`)
        );
        return forkJoin(requests).pipe(
            map(responses => {
                // Merge all JSON objects; later ones override earlier
                return responses.reduce((acc, resp) => ({ ...acc, ...(resp as object) }), {});
            })
        );
    }
}