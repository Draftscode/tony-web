import { ChangeDetectionStrategy, Component } from "@angular/core";
import { ToggleSwitchModule } from 'primeng/toggleswitch';

@Component({
    selector: 'app-settings',
    imports: [ToggleSwitchModule],
    changeDetection: ChangeDetectionStrategy.OnPush,
    templateUrl: './settings.component.html'
})
export class SettingsComponent {

}