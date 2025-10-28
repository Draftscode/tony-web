import { ChangeDetectionStrategy, Component, computed, input } from "@angular/core";
import { TranslatePipe } from "@ngx-translate/core";
import { TagModule } from "primeng/tag";

@Component({
    selector: 'app-customer-status',
    templateUrl: 'customer-status.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [TagModule, TranslatePipe]
})
export class CustomerStatusComponent {
    status = input<string>();

    protected readonly value = computed(() => this.status() ?? 'new');

    protected readonly severity = computed(() => {
        switch (this.value()) {
            case 'new':
                return 'success';
            case 'advanced':
                return 'info';
            default:
                return 'danger';
        }
    });
}