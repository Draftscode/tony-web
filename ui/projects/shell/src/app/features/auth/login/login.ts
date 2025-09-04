import { Component, inject } from "@angular/core";
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from "@angular/forms";
import { Router } from "@angular/router";
import { ButtonModule } from "primeng/button";
import { CardModule } from "primeng/card";
import { DividerModule } from "primeng/divider";
import { InputTextModule } from "primeng/inputtext";
import { PasswordModule } from "primeng/password";
import { AuthService } from "../../../data-access/auth.service";
import { ThemeService } from "../../../data-access/theme.service";

@Component({
    selector: 'app-login',
    templateUrl: 'login.html',
    imports: [CardModule, PasswordModule, DividerModule, ButtonModule, InputTextModule, FormsModule, ReactiveFormsModule]
})
export default class LoginPage {
    private readonly authService = inject(AuthService);
    private readonly router = inject(Router);
    protected readonly themeService = inject(ThemeService);

    protected readonly formGroup = new FormGroup({
        username: new FormControl<string | null>('', [Validators.required]),
        password: new FormControl<string | null>('', [Validators.required]),
    });

    protected async submit() {
        if (this.formGroup.invalid) { return; }
        const payload = this.formGroup.getRawValue();

        try {
            await this.authService.login(payload.username!, payload.password!);
            console.log('LOGIN DNE')
            this.router.navigate(['/', 'app']);
        } catch {

        }
    }
}