import { Component, input } from "@angular/core";
import { BlaudirektCompany } from "../data-access/provider/blaudirekt.service";
import { FallbackImageDirective } from "../utils/fallback-image.directive";

@Component({
    selector: 'app-company',
    imports: [FallbackImageDirective],
    template: `
    @if(company(); as company) {
    <div class="flex gap-2 items-center">
        <img class="shrink-0 h-[32px] w-[100px] object-contain" fallback="images/empty.jpg" [src]="company.logo" alt="Company Logo" />
        <span>{{company.name}}</span>
    </div>
    }
    `
})
export class CompanyComponent {
    company = input<BlaudirektCompany>();
}