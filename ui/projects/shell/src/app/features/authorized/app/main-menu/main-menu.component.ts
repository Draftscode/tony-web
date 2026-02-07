import { CdkDrag, CdkDragDrop, CdkDropList } from "@angular/cdk/drag-drop";
import { BreakpointObserver, Breakpoints } from "@angular/cdk/layout";
import { NgTemplateOutlet } from "@angular/common";
import { ChangeDetectionStrategy, Component, computed, contentChild, inject, input, linkedSignal, model, signal, TemplateRef, viewChildren } from "@angular/core";
import { toSignal } from "@angular/core/rxjs-interop";
import { MenuItem } from "primeng/api";
import { map } from "rxjs";
import { MenuItemComponent } from "./menu-item.component.ts/menu-item.component";

export enum MenuState {
    expanded = 'expanded',
    collapsed = 'collapsed',
};

export enum MenuMode {
    over = 'over',
    static = 'static',
    slim = 'slim',
}

@Component({
    selector: 'app-main-menu',
    templateUrl: './main-menu.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [NgTemplateOutlet, CdkDropList, MenuItemComponent],
})
export class MainMenuComponent {
    state = model<MenuState>(MenuState.expanded);
    originalMode = input<MenuMode>(MenuMode.static, { alias: 'mode' });
    items = input<MenuItem[]>();
    expandOnHover = input<boolean>(false);
    isDragAndDropDisabled = input<boolean>(true);

    favorites = model<MenuItem[]>([]);
    protected readonly dragging = signal<boolean>(false);

    protected contentRef = contentChild<TemplateRef<unknown>>('content');
    protected startRef = contentChild<TemplateRef<unknown>>('start', { descendants: false });
    protected endRef = contentChild<TemplateRef<unknown>>('end', { descendants: false });
    private readonly breakpointObserver = inject(BreakpointObserver);

    protected readonly isSmall = toSignal(this.breakpointObserver.observe([
        Breakpoints.Small,
        Breakpoints.XSmall,
    ]).pipe(map(result => !!result.matches)));

    protected readonly showBackdrop = computed(() => true);

    itemRefs = viewChildren(MenuItemComponent, { read: MenuItemComponent });
    isMouseOver = signal<boolean>(false);

    protected drop(e: CdkDragDrop<MenuItem[]>) {
        if (this.favorites().find(fav => fav.id === e.item.data.id)) {
            return;
        }

        this.favorites.update(favorites => favorites.concat(e.item.data));
    }

    sortPredicate(index: number, item: CdkDrag<number>) {
        return (index === 0);
    }

    onMouseEnter() {
        this.isMouseOver.set(true);
    }
    onMouseLeave() {
        this.isMouseOver.set(false);
    }

    protected closeMenus(item: MenuItem) {
        this.itemRefs().forEach(ref => {
            if (item.id === ref?.item()?.id) { return; }
            ref.expanded.set(false);
        });
    }

    toggle() {
        this.state.update(state => state === MenuState.expanded ? MenuState.collapsed : MenuState.expanded)
    }


    mode = linkedSignal(() => {
        if (this.isSmall() && this.originalMode() === MenuMode.static) {
            return MenuMode.over;
        }

        if (this.isMouseOver() && this.originalMode() === MenuMode.slim && this.expandOnHover()) {
            return MenuMode.over;
        }

        return this.originalMode();
    });

    protected readonly showLabel = computed(() => {
        const expandOnHover = this.expandOnHover();
        const mode = this.mode();

        if (mode === MenuMode.slim && !this.isMouseOver()) {
            return false
        }

        return true;
    });


    protected readonly sidebarClass = computed(() => {
        let classList = '';
        const state = this.state();
        const mode = this.mode();

        if (state !== MenuState.collapsed) {
            switch (mode) {
                case MenuMode.slim:
                    classList += ` absolute left-0 top-0 w-[46px] `;
                    break;
                case MenuMode.over:
                case MenuMode.static:
                    classList += ` absolute left-0 top-0 w-[216px] `;
                    break;
            }
        } else if (state === MenuState.collapsed) {
            classList += 'w-0 ';
        }


        return classList;
    });

    protected readonly contentClass = computed(() => {
        let classList = '';
        const state = this.state();
        const mode = this.mode();

        if (state !== MenuState.collapsed) {
            switch (mode) {
                case MenuMode.over:
                case MenuMode.slim:
                    classList += `ml-[46px]`;
                    break;
                case MenuMode.static:
                    classList += `ml-[216px]`;
                    break;
            }
        }
        return classList;
    });

    protected dragStart() {
        this.dragging.set(true);
    }
    protected dragEnd() {
        this.dragging.set(false);
    }
}