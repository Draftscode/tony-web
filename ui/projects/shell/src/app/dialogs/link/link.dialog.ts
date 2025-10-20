import { ChangeDetectionStrategy, Component, inject, signal } from "@angular/core";
import { DynamicDialogConfig } from "primeng/dynamicdialog";
import { BlaudirektCustomer } from "../../data-access/provider/blaudirekt.service";
import { InputTextModule } from "primeng/inputtext";
import { lastValueFrom } from "rxjs";
import { LinkStore } from "../../data-access/store/link.store";

@Component({
    selector: 'app-link-dialog',
    changeDetection: ChangeDetectionStrategy.OnPush,
    templateUrl: 'link.dialog.html',
    imports: [InputTextModule]

})
export class LinkDialog {
    private readonly config = inject<DynamicDialogConfig<BlaudirektCustomer, {}>>(DynamicDialogConfig);
    protected readonly customer = signal<BlaudirektCustomer | undefined>(undefined);
    private readonly linkStore = inject(LinkStore);

    constructor() {
        this.customer.set(this.config.data);
    }
}