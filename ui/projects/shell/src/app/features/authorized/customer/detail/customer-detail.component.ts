import { ChangeDetectionStrategy, Component, inject, signal } from "@angular/core";
import { RouterLink } from "@angular/router";
import { ButtonModule } from "primeng/button";
import { CardModule } from "primeng/card";
import { DividerModule } from "primeng/divider";
import { CustomerStore } from "../../../../data-access/store/customer.store";
import { CustomerNoteComponent } from "../../../../ui/customer-note/customer-note.component";
import { injectParam } from "../../../../utils/signals/inject-param";

@Component({
    selector: 'app-customer-detail',
    imports: [CardModule, ButtonModule, DividerModule, RouterLink, CustomerNoteComponent],
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