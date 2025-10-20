import { ChangeDetectionStrategy, Component, computed, input } from "@angular/core";
import { TagModule } from "primeng/tag";
import { BlaudirektCustomer } from "../../data-access/provider/blaudirekt.service";
import { TranslatePipe } from "@ngx-translate/core";

@Component({
    selector: 'app-customer-status',
    templateUrl: 'customer-status.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [TagModule, TranslatePipe]
})
export class CustomerStatusComponent {
    customer = input<BlaudirektCustomer>();

    protected readonly value = computed(() => {
        const customer = this.customer();

        if (customer?.isAlive === false || customer?.blocked === true || customer?.terminatedAt) {
            return customer.blockReason ?? 'terminated';
        }

        if (customer?.contractsCount === 0) {
            return 'new'
        }

        return 'advanced';
    });
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