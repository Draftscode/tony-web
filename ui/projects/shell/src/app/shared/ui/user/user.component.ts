import { Component, input } from "@angular/core";
import { TagModule } from "primeng/tag";
import { StringToColorPipe } from "../../../data-access/pipes/string-to-color.pipe";

@Component({
    selector: 'app-user',
    imports: [TagModule, StringToColorPipe],
    template: `
    @if(user(); as user) {
     <p-tag [style]="{background: user|toColor, color: user|toColor:{contrast:true} }"
                    [value]="user" />
    }
    `
})
export class UserComponent {
    user = input<string>();
}