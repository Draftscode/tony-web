import { ChangeDetectionStrategy, Component, inject, signal } from "@angular/core";
import { DynamicDialogConfig } from "primeng/dynamicdialog";
import { InputTextModule } from "primeng/inputtext";
import { BlaudirektCustomer } from "../../data-access/provider/blaudirekt.service";

@Component({
    selector: 'app-link-dialog',
    changeDetection: ChangeDetectionStrategy.OnPush,
    templateUrl: 'link.dialog.html',
    imports: [InputTextModule]

})
export class LinkDialog {
    private readonly config = inject<DynamicDialogConfig<BlaudirektCustomer, {}>>(DynamicDialogConfig);
    protected readonly customer = signal<BlaudirektCustomer | undefined>(undefined);

    constructor() {
        this.customer.set(this.config.data);
    }
}