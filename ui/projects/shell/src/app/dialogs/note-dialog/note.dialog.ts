import { ChangeDetectionStrategy, Component, inject, signal } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { ButtonModule } from "primeng/button";
import { DividerModule } from "primeng/divider";
import { DynamicDialogConfig, DynamicDialogRef } from "primeng/dynamicdialog";
import { TextareaModule } from 'primeng/textarea';

@Component({
    selector: 'app-note-dialog',
    changeDetection: ChangeDetectionStrategy.OnPush,
    templateUrl: 'note.dialog.html',
    imports: [FormsModule, ButtonModule, DividerModule, TextareaModule],
})
export class NoteDialog {
    private readonly pDialogConfig = inject(DynamicDialogConfig);
    private readonly pDialogRef = inject(DynamicDialogRef);

    protected readonly text = signal<string>(this.pDialogConfig.data?.text);

    protected close() {
        const data = {
            text: this.text(),
            type: 'default',
        };

        this.pDialogRef.close({ type: 'manually', data })
    }
}