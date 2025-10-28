import { ChangeDetectionStrategy, Component, model } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { MultiSelectModule } from 'primeng/multiselect';
import { BlaudirektCustomerStatus } from "../../../../data-access/provider/blaudirekt.service";
import { CustomerStatusComponent } from "../../../../ui/customer-status/customer-status.component";
import { TranslatePipe } from "@ngx-translate/core";

@Component({
    selector: 'app-customer-status-filter',
    templateUrl: `customer-status-filter.component.html`,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [MultiSelectModule, CustomerStatusComponent, TranslatePipe, FormsModule]
})
export class CustomerStatusFilterComponent {
    protected readonly options = BlaudirektCustomerStatus;
    value = model<string[]>([...BlaudirektCustomerStatus]);
}