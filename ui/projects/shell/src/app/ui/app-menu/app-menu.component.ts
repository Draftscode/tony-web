

import { NgTemplateOutlet } from "@angular/common";
import { ChangeDetectionStrategy, Component, HostListener, input } from "@angular/core";
import { RouterLink, RouterLinkActive } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { TreeNode } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';

@Component({
    selector: 'app-menu',
    templateUrl: './app-menu.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        NgTemplateOutlet, ButtonModule, TranslatePipe,
        TooltipModule, RouterLink, RouterLinkActive],
})
export class AppMenuComponent {
    items = input<TreeNode[]>([]);
    isSmall = input<boolean>();
    menuState = input<'minimal' | 'expanded'>();

    @HostListener('document:click', ['$event'])
    onDocumentClick(event: MouseEvent) {
        this.closeAll();
    }

    private closeAll(item: TreeNode | undefined = undefined) {
        this.items()?.forEach(item =>
            item.data.class = item.data.class?.replace('expanded', '').trim());

        if (item) {
            item.data.class = `${item.data.class} expanded`;
        }
    }

    protected toggle(event: MouseEvent, item: TreeNode) {
        event?.stopPropagation();
        this.closeAll(item);
    }
}