import { NgTemplateOutlet } from "@angular/common";
import { ChangeDetectionStrategy, Component, inject } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { TranslatePipe, TranslateService } from "@ngx-translate/core";
import { SelectModule } from "primeng/select";
import { ToggleSwitchChangeEvent, ToggleSwitchModule } from 'primeng/toggleswitch';
import { ThemeService } from "../../../data-access/provider/theme.service";
import { LanguageStore } from "../../../data-access/store/language.store";
import { TooltipModule } from "primeng/tooltip";
import { DividerModule } from "primeng/divider";
import { FcmService } from "../../../data-access/provider/fcm.service";
import { MessageService } from "primeng/api";

@Component({
    selector: 'app-settings',
    imports: [
        ToggleSwitchModule, TranslatePipe,
        TooltipModule, DividerModule,
        NgTemplateOutlet, FormsModule, SelectModule
    ],
    changeDetection: ChangeDetectionStrategy.OnPush,
    templateUrl: './settings.component.html'
})
export class SettingsComponent {
    protected readonly languageStore = inject(LanguageStore);
    protected readonly themeStore = inject(ThemeService);
    protected readonly fcm = inject(FcmService);
    protected readonly pMessage = inject(MessageService);
    private readonly translate = inject(TranslateService);

    protected async requestPermission(event: ToggleSwitchChangeEvent) {
        await this.fcm.requestPermission();
        this.pMessage.add({
            closable: true,
            life: 6_000,
            severity: 'info',
            detail: this.translate.instant(`settings.notification.${event.checked ? 'enabled' : 'disabled'}.detail`),
            summary: this.translate.instant(`settings.notification.${event.checked ? 'enabled' : 'disabled'}.summary`),
        });
    }
}