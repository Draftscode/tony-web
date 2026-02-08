import { ChangeDetectionStrategy, Component, inject, signal } from "@angular/core";
import { RouterLink } from "@angular/router";
import { TranslatePipe } from "@ngx-translate/core";
import { ButtonModule } from "primeng/button";
import { DividerModule } from "primeng/divider";
import { CustomerStore } from "../../../../data-access/store/customer.store";
import { injectParam } from "../../../../utils/signals/inject-param";

@Component({
    selector: 'app-customer-detail',
    imports: [ButtonModule, DividerModule, TranslatePipe, RouterLink],
    templateUrl: 'customer-detail.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: { class: 'flex w-full justify-center' },
})
export default class CustomerDetailComponent {
    protected readonly customerStore = inject(CustomerStore);
    protected readonly customerId = signal<string | null>(injectParam('customerId'));

    constructor() {
        this.customerStore.connectCustomer(this.customerId);
    }
}