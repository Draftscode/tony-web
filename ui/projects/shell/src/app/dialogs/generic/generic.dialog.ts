import { ChangeDetectionStrategy, Component, computed, inject, signal } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { DomSanitizer } from "@angular/platform-browser";
import { TranslatePipe } from "@ngx-translate/core";
import { Button } from "primeng/button";
import { DynamicDialogConfig, DynamicDialogRef } from "primeng/dynamicdialog";
import { Editor } from "primeng/editor";

type Config = {
    contents: string;
    name: string;
    kind: string;
}

@Component({
    selector: 'app-generic-dialog',
    templateUrl: 'generic.dialog.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [Editor, FormsModule, Button, TranslatePipe]
})
export class GenericDialog {
    protected readonly dialogRef = inject(DynamicDialogRef<GenericDialog>);
    protected readonly dialogConf = inject(DynamicDialogConfig<Config>);
    private readonly sanitizer = inject(DomSanitizer);
    protected readonly editable = signal<boolean>(false);

    protected readonly content = signal<string>(this.dialogConf.data.contents);
    protected readonly safeContent = computed(() => this.content() ? this.sanitizer.bypassSecurityTrustHtml(this.content()) : null);

    protected readonly icon = computed(() => {
        const kind = this.dialogConf.data.kind;
        if (kind === 'offer') return 'briefcase';
        if (kind === 'ip.asset') return 'shield';
        if (kind === 'strategy') return 'image';
        if (kind === 'jurisdiction') return 'flag';
        if (kind === 'options') return 'address-book';
        return 'th-large';
    });

    protected readonly color = computed(() => {
        const kind = this.dialogConf.data.kind;
        if (kind === 'offer') return 'blue';
        if (kind === 'ip.asset') return 'green';
        if (kind === 'strategy') return 'orange';
        if (kind === 'jurisdiction') return 'red';
        if (kind === 'options') return 'purple';
        return 'violet';
    });

    protected complete() {
        this.dialogRef.close({ type: 'manually', data: this.content() });
    }
}