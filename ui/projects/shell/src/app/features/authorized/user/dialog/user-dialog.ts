import { Component, inject, linkedSignal, signal } from "@angular/core";
import { FormControl, FormGroup, ReactiveFormsModule } from "@angular/forms";
import { TranslatePipe } from "@ngx-translate/core";
import { ButtonModule } from "primeng/button";
import { DividerModule } from "primeng/divider";
import { DynamicDialogConfig, DynamicDialogRef } from "primeng/dynamicdialog";
import { InputTextModule } from "primeng/inputtext";
import { PasswordModule } from "primeng/password";
import { PickListModule } from 'primeng/picklist';
import { Role } from "../../../../data-access/provider/auth.service";
import { RoleStore } from "../../../../data-access/store/role.store";
import { RoleComponent } from "../../../../shared/ui/role/role.component";

@Component({
    selector: 'app-user-dialog',
    templateUrl: 'user-dialog.html',
    imports: [ButtonModule, PasswordModule, PickListModule,
        ReactiveFormsModule, TranslatePipe, InputTextModule, DividerModule,
        RoleComponent],
})
export class UserDialog {
    private readonly pDialogRef = inject<DynamicDialogRef<UserDialog>>(DynamicDialogRef);
    protected readonly pDialogConf = inject<DynamicDialogConfig<any>>(DynamicDialogConfig);
    private readonly roleStore = inject(RoleStore);

    protected readonly roles = linkedSignal(() => {
        return (this.roleStore.roles.value()?.items ?? [])
            .filter(role => !this.assignedRoles().find(r => r.id === role.id))
    });

    protected readonly isNew = signal<boolean>(false);
    protected readonly isAdmin = signal<boolean>(true);

    protected readonly formGroup = new FormGroup({
        username: new FormControl<string | null>(null, []),
        firstname: new FormControl<string | null>(null, []),
        lastname: new FormControl<string | null>(null, []),
        password: new FormControl<string | null>(null, []),
    });

    protected readonly assignedRoles = signal<Role[]>([]);

    constructor() {
        this.formGroup.patchValue(this.pDialogConf.data ?? {});
        const isNew = !this.pDialogConf.data?.username;
        this.isNew.set(isNew);
        this.isAdmin.set(this.pDialogConf.data?.username === 'admin');

        this.assignedRoles.set(this.pDialogConf.data?.roles ?? []);

        if (!isNew) {
            this.formGroup.controls.username.disable();
        }
    }

    protected close() {
        const data = {
            ...this.formGroup.getRawValue(),
            roles: this.assignedRoles(),
        };

        this.pDialogRef.close({ type: 'manually', data });
    }
}