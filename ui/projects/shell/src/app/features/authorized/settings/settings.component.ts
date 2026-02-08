import { NgTemplateOutlet } from "@angular/common";
import { ChangeDetectionStrategy, Component, inject } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { TranslatePipe, TranslateService } from "@ngx-translate/core";
import { MessageService } from "primeng/api";
import { ButtonModule } from "primeng/button";
import { DividerModule } from "primeng/divider";
import { SelectModule } from "primeng/select";
import { ToggleSwitchChangeEvent, ToggleSwitchModule } from 'primeng/toggleswitch';
import { TooltipModule } from "primeng/tooltip";
import { FcmService } from "../../../data-access/provider/fcm.service";
import { AccountStore } from "../../../data-access/store/account.store";
import { SettingsStore } from "../../../data-access/store/settings.store";

@Component({
    selector: 'app-settings',
    imports: [
        ToggleSwitchModule, TranslatePipe,
        TooltipModule, DividerModule, ButtonModule,
        NgTemplateOutlet, FormsModule, SelectModule
    ],
    host: { class: 'flex flex-col h-full w-full' },
    changeDetection: ChangeDetectionStrategy.OnPush,
    templateUrl: './settings.component.html'
})
export class SettingsComponent {
    protected readonly accountStore = inject(AccountStore);
    protected readonly fcm = inject(FcmService);
    protected readonly pMessage = inject(MessageService);
    private readonly translate = inject(TranslateService);
    protected readonly settingsStore = inject(SettingsStore);

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