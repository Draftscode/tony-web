import { Component, inject, input } from "@angular/core";
import { ButtonModule } from "primeng/button";
import { PopoverModule } from "primeng/popover";
import { LanguageStore } from "../../../data-access/store/language.store";
import { TranslateModule } from "@ngx-translate/core";

@Component({
    selector: 'app-language-selector',
    templateUrl: 'language-selector.html',
    imports: [PopoverModule, ButtonModule, TranslateModule]
})
export class LanguageSelector {
    protected readonly languageStore = inject(LanguageStore);

    size = input<'small' | 'large'>('large');
}