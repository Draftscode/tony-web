import { Component, inject, signal } from "@angular/core";
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from "@angular/forms";
import { Router } from "@angular/router";
import { TranslateModule } from "@ngx-translate/core";
import { ButtonModule } from "primeng/button";
import { CardModule } from "primeng/card";
import { DividerModule } from "primeng/divider";
import { InputTextModule } from "primeng/inputtext";
import { MessageModule } from "primeng/message";
import { PasswordModule } from "primeng/password";
import { AccountStore } from "../../../data-access/store/account.store";
import { ThemeService } from "../../../data-access/provider/theme.service";

@Component({
    selector: 'app-login',
    templateUrl: 'login.html',
    imports: [CardModule, MessageModule, PasswordModule, DividerModule, TranslateModule,
        ButtonModule, InputTextModule, FormsModule, ReactiveFormsModule]
})
export default class LoginPage {
    private readonly accountStore = inject(AccountStore);
    private readonly router = inject(Router);
    protected readonly themeService = inject(ThemeService);
    protected readonly error = signal<string | null>(null);

    protected readonly formGroup = new FormGroup({
        username: new FormControl<string | null>('', [Validators.required]),
        password: new FormControl<string | null>('', [Validators.required]),
    });

    protected async submit() {
        this.error.set(null);

        if (this.formGroup.invalid) { return; }
        const payload = this.formGroup.getRawValue();

        try {
            await this.accountStore.login(payload.username!, payload.password!);
            this.router.navigate(['/', 'app']);
        } catch (e: any) {
            this.error.set(e.error);
        }
    }
}