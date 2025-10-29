import { Component, inject, model, signal } from "@angular/core";
import { FormControl, FormGroup, ReactiveFormsModule } from "@angular/forms";
import { TranslatePipe } from "@ngx-translate/core";
import { ButtonModule } from "primeng/button";
import { DividerModule } from "primeng/divider";
import { DynamicDialogConfig, DynamicDialogRef } from "primeng/dynamicdialog";
import { InputTextModule } from "primeng/inputtext";
import { MultiSelectModule } from 'primeng/multiselect';
import { PasswordModule } from "primeng/password";
import { PickListModule } from 'primeng/picklist';
import { Role } from "../../../../data-access/provider/auth.service";
import { Broker } from "../../../../data-access/provider/broker.service";
import { BrokerStore } from "../../../../data-access/store/broker.store";
import { RoleStore } from "../../../../data-access/store/role.store";
import { RoleComponent } from "../../../../ui/role/role.component";
@Component({
    selector: 'app-user-dialog',
    templateUrl: 'user-dialog.html',
    imports: [
        ButtonModule, PasswordModule, PickListModule, MultiSelectModule,
        ReactiveFormsModule, TranslatePipe, InputTextModule, DividerModule,
        RoleComponent],
})
export class UserDialog {
    private readonly pDialogRef = inject<DynamicDialogRef<UserDialog>>(DynamicDialogRef);
    protected readonly pDialogConf = inject<DynamicDialogConfig<any>>(DynamicDialogConfig);
    protected readonly roleStore = inject(RoleStore);
    protected readonly brokerStore = inject(BrokerStore);

    protected readonly isNew = signal<boolean>(false);
    protected readonly isAdmin = signal<boolean>(true);

    protected readonly formGroup = new FormGroup({
        username: new FormControl<string | null>(null, []),
        firstname: new FormControl<string | null>(null, []),
        lastname: new FormControl<string | null>(null, []),
        password: new FormControl<string | null>(null, []),
        brokers: new FormControl<Broker[]>([]),
        roles: new FormControl<Role[]>([]),
    });

    protected readonly assignedRoles = model<Role[]>([]);
    protected readonly assignedBrokers = model<Broker[]>([]);

    constructor() {
        this.formGroup.patchValue(this.pDialogConf.data ?? {});
        const isNew = !this.pDialogConf.data?.username;
        this.isNew.set(isNew);
        this.isAdmin.set(this.pDialogConf.data?.username === 'admin');

        this.assignedRoles.set(this.pDialogConf.data?.roles ?? []);
        this.assignedBrokers.set(this.pDialogConf.data?.brokers ?? []);

        if (!isNew) {
            this.formGroup.controls.username.disable();
        }
    }

    protected close() {
        const data = {
            ...this.formGroup.getRawValue(),
        };

        this.pDialogRef.close({ type: 'manually', data });
    }
}