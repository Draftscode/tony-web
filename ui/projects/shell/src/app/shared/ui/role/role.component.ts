import { Component, input } from "@angular/core";
import { TagModule } from "primeng/tag";
import { StringToColorPipe } from "../../../data-access/pipes/string-to-color.pipe";

@Component({
    selector: 'app-role',
    imports: [TagModule, StringToColorPipe],
    template: `
    @if(role(); as role) {
     <p-tag [style]="{background: role|toColor, color: role|toColor:{contrast:true} }"
                    [value]="role" />
    }
    `
})
export class RoleComponent {
    role = input<string>();
}