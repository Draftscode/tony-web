import { Component, inject, signal } from "@angular/core";
import { FormControl, FormGroup, ReactiveFormsModule } from "@angular/forms";
import { TranslateModule } from "@ngx-translate/core";
import { ButtonModule } from "primeng/button";
import { DividerModule } from "primeng/divider";
import { DynamicDialogConfig, DynamicDialogRef } from "primeng/dynamicdialog";
import { InputTextModule } from "primeng/inputtext";
import { PasswordModule } from "primeng/password";

@Component({
    selector: 'app-user-dialog',
    templateUrl: 'user-dialog.html',
    imports: [ButtonModule, PasswordModule, ReactiveFormsModule, TranslateModule, InputTextModule, DividerModule],
})
export class UserDialog {
    private readonly pDialogRef = inject<DynamicDialogRef<UserDialog>>(DynamicDialogRef);
    protected readonly pDialogConf = inject<DynamicDialogConfig<any>>(DynamicDialogConfig);

    protected readonly isNew = signal<boolean>(false);

    protected readonly formGroup = new FormGroup({
        username: new FormControl<string | null>(null, []),
        firstname: new FormControl<string | null>(null, []),
        lastname: new FormControl<string | null>(null, []),
        password: new FormControl<string | null>(null, []),
    })

    constructor() {
        this.formGroup.patchValue(this.pDialogConf.data ?? {});
        const isNew = !this.pDialogConf.data?.username;
        this.isNew.set(isNew);

        if (!isNew) {
            this.formGroup.controls.username.disable();
        }
    }

    protected close() {
        const data = this.formGroup.getRawValue();
        this.pDialogRef.close({ type: 'manually', data });
    }
}