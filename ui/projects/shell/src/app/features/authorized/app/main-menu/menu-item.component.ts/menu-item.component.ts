import { CdkDrag } from "@angular/cdk/drag-drop";
import { NgTemplateOutlet } from "@angular/common";
import { ChangeDetectionStrategy, Component, computed, contentChild, forwardRef, input, linkedSignal, model, output, TemplateRef } from "@angular/core";
import { RouterLink, RouterLinkActive } from "@angular/router";
import { TranslatePipe } from "@ngx-translate/core";
import { MenuItem } from "primeng/api";
import { DividerModule } from "primeng/divider";

@Component({
    selector: 'app-menu-item',
    templateUrl: './menu-item.component.html',
    styleUrl: './menu-item.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [MenuItemComponent, CdkDrag, NgTemplateOutlet, RouterLink, RouterLinkActive, TranslatePipe, DividerModule],
    host: { class: 'relative flex flex-col w-full' },
    viewProviders: [
        { provide: CdkDrag, useExisting: forwardRef(() => CdkDrag) }
    ]
})
export class MenuItemComponent {
    item = input<MenuItem>();
    toggled = output<void>();
    itemRef = contentChild<TemplateRef<unknown>>('item');
    showLabel = input<boolean>(true);
    dragging = model<boolean>(false);
    dragEnd = output<void>();
    dragStart = output<void>();
    favorites = input<MenuItem[]>([]);

    expanded = linkedSignal<boolean>(() => {
        const state = this.item()?.state ?? {};
        return state['expanded'] ?? false;
    });

    protected readonly isDragDisabled = computed(() => this.favorites().find(fav => fav.id === this.item()?.id) || this.hasChildren());

    protected readonly hasChildren = computed(() => !!this.item()?.items?.length);

    protected readonly isCloseable = computed(() => {
        const state = this.item()?.state ?? {};
        return state['closeable'] !== false;
    });

    protected toggle() {
        if (!this.isCloseable()) { return; }
        this.expanded.update(state => !state);
        if (!this.showLabel()) {
            this.toggled.emit();
        }
    }

    protected onDragStarted(): void {
        this.dragging.set(true);
        this.dragStart.emit();
    }

    protected onDragEnded(): void {
        this.dragging.set(false);
        this.dragEnd.emit();
    }
}