import { ChangeDetectionStrategy, Component, inject, signal } from "@angular/core";
import { TranslatePipe } from "@ngx-translate/core";
import { CardModule } from "primeng/card";
import { CustomerStore } from "../../../../data-access/store/customer.store";
import { injectParam } from "../../../../utils/signals/inject-param";
import { ButtonModule } from "primeng/button";
import { ActivatedRoute, Router, RouterLink } from "@angular/router";

@Component({
    selector: 'app-customer-detail',
    imports: [CardModule, TranslatePipe, ButtonModule, RouterLink],
    templateUrl: 'customer-detail.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: { class: 'flex p-4 w-full justify-center' },
})
export default class CustomerDetailComponent {
    protected readonly customerStore = inject(CustomerStore);
    protected readonly customerId = signal<string | null>(injectParam('customerId'));

    constructor() {
        this.customerStore.connectCustomer(this.customerId);
    }
}