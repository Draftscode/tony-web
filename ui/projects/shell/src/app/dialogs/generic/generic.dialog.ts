import { ChangeDetectionStrategy, Component, computed, inject } from "@angular/core";
import { DomSanitizer } from "@angular/platform-browser";
import { DynamicDialogClasses, DynamicDialogConfig, DynamicDialogRef } from "primeng/dynamicdialog";

type Config = {
    contents: string;
}

@Component({
    selector: 'app-generic-dialog',
    templateUrl: 'generic.dialog.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class GenericDialog {
    private readonly dialogRef = inject(DynamicDialogRef<GenericDialog>);
    protected readonly dialogConf = inject(DynamicDialogConfig<Config>);
    private readonly sanitizer = inject(DomSanitizer);


    protected readonly content = computed(() => this.sanitizer.bypassSecurityTrustHtml(this.dialogConf.data.contents));
}