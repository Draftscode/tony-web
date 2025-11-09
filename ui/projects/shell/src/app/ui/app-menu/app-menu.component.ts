

import { NgTemplateOutlet } from "@angular/common";
import { ChangeDetectionStrategy, Component, input } from "@angular/core";
import { RouterLink, RouterLinkActive } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { TreeNode } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';

@Component({
    selector: 'app-menu',
    templateUrl: './app-menu.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [NgTemplateOutlet, ButtonModule, TranslatePipe, TooltipModule, RouterLink, RouterLinkActive],
})
export class AppMenuComponent {
    items = input<TreeNode[]>([]);
    isSmall = input<boolean>();
    menuState = input<'minimal' | 'expanded'>();


    protected toggle(ref: HTMLElement) {
        ref.classList.toggle('expanded');
    }
}