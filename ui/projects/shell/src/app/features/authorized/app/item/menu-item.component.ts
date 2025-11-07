import { ChangeDetectionStrategy, Component, input, output } from "@angular/core";
import { RouterLink, RouterLinkActive } from "@angular/router";
import { TranslatePipe } from "@ngx-translate/core";
import { MenuItem } from "primeng/api";
import { ButtonModule } from "primeng/button";
import { TooltipModule } from "primeng/tooltip";

@Component({
    selector: 'app-menu-item',
    templateUrl: './menu-item.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [TranslatePipe, TooltipModule, RouterLink, ButtonModule, RouterLinkActive]
})
export class MenuItemComponent {
    item = input<MenuItem>();
    isSmall = input<boolean>();
    menuState = input<'minimal' | 'expanded'>();

    click = output<void>();

    protected onClick(): void {
        // noop placeholder for click event
        this.click.emit();
    }
}