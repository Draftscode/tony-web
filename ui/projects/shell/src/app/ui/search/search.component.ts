import { ChangeDetectionStrategy, Component, model } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { TranslatePipe } from "@ngx-translate/core";
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from "primeng/inputtext";
import { DebounceInputDirective } from "../../data-access/pipes/debounce-time.directive";

@Component({
    selector: 'app-list-search',
    templateUrl: 'search.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [InputTextModule, InputIconModule, TranslatePipe, IconFieldModule, FormsModule, DebounceInputDirective]

})
export class SearchComponent {
    query = model<string>();
}