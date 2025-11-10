

import { BreakpointObserver, Breakpoints } from "@angular/cdk/layout";
import { NgTemplateOutlet } from "@angular/common";
import { ChangeDetectionStrategy, Component, contentChild, HostListener, inject, input, signal, TemplateRef } from "@angular/core";
import { toSignal } from "@angular/core/rxjs-interop";
import { RouterLink, RouterLinkActive } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { TreeNode } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { CardModule } from "primeng/card";
import { DividerModule } from "primeng/divider";
import { TooltipModule } from 'primeng/tooltip';
import { map } from "rxjs";

@Component({
    selector: 'app-menu',
    templateUrl: './app-menu.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        CardModule, DividerModule,
        NgTemplateOutlet, ButtonModule, TranslatePipe,
        TooltipModule, RouterLink, RouterLinkActive],
})
export class AppMenuComponent {
    items = input<TreeNode[]>([]);
    protected readonly menuState = signal<'minimal' | 'expanded'>('minimal');
    private readonly breakpointObserver = inject(BreakpointObserver);
    startRef = contentChild<TemplateRef<unknown>>('start');
    contentRef = contentChild<TemplateRef<unknown>>('content');

    protected readonly isSmall = toSignal(this.breakpointObserver.observe([
        Breakpoints.Small,
        Breakpoints.XSmall,
    ]).pipe(map(result => !!result.matches)));

    @HostListener('document:click', ['$event'])
    onDocumentClick(event: MouseEvent) {
        if (this.menuState() === 'expanded') return;

        this.closeAll();
    }

    toggleMenuState() {
        this.menuState.update(state => {
            if (state === 'minimal') {
                return 'expanded';
            }

            return 'minimal';
        });
    }

    private closeAll(item: TreeNode | undefined = undefined) {
        this.items()?.forEach(_item => {
            _item.data.class = _item.data.class?.replace('expanded', '').trim();
        });
    }

    protected toggle(event: MouseEvent, item: TreeNode) {
        event?.stopPropagation();
        if (!item?.data?.class?.includes('expanded')) {
            item.data.class = `${item.data.class} expanded`;
        } else {
            item.data.class = item.data?.class?.replace('expanded', '').trim()
        }
    }
}