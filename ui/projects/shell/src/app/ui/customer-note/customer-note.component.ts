import { ChangeDetectionStrategy, Component, computed, input, output } from "@angular/core";
import { ButtonModule } from "primeng/button";
import { DividerModule } from "primeng/divider";
import { MessageModule } from "primeng/message";
import { BlaudirektNote } from "../../data-access/provider/blaudirekt.service";

@Component({
    selector: 'app-customer-note',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [MessageModule, DividerModule, ButtonModule],
    templateUrl: 'customer-note.component.html',
    styles: `
    :host ::ng-deep .p-message-text {
        @apply w-full;
    }
    `
})
export class CustomerNoteComponent {
    edit = output<void>();
    remove = output<void>();
    note = input<BlaudirektNote>();

    protected readonly severity = computed(() => {
        switch (this.note()?.type) {
            case '':
                return '';
            default:
                return 'secondary';
        }
    });
}