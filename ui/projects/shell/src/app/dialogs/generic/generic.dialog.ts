import { ChangeDetectionStrategy, Component, computed, inject, signal } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { DomSanitizer } from "@angular/platform-browser";
import { TranslatePipe } from "@ngx-translate/core";
import { Button } from "primeng/button";
import { DynamicDialogConfig, DynamicDialogRef } from "primeng/dynamicdialog";
import { Editor } from "primeng/editor";
import { Message } from "primeng/message";

type Config = {
    contents: string;
}

@Component({
    selector: 'app-generic-dialog',
    templateUrl: 'generic.dialog.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [Editor, FormsModule, Button, TranslatePipe, Message]
})
export class GenericDialog {
    private readonly dialogRef = inject(DynamicDialogRef<GenericDialog>);
    protected readonly dialogConf = inject(DynamicDialogConfig<Config>);
    private readonly sanitizer = inject(DomSanitizer);
    protected readonly editable = signal<boolean>(false);

    protected readonly content = signal<string>(this.dialogConf.data.contents);
    protected readonly safeContent = computed(() => this.content() ? this.sanitizer.bypassSecurityTrustHtml(this.content()) : null);

    protected complete() {
        this.dialogRef.close({ type: 'manually', data: this.content() });
    }
}