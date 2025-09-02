import { Component, inject } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { ButtonModule } from "primeng/button";
import { CardModule } from "primeng/card";
import { DividerModule } from "primeng/divider";
import { DialogService } from "primeng/dynamicdialog";
import { take } from "rxjs";
import { FileService } from "../../../data-access/file.service";
import { FileDialogComponent } from "../../../dialogs/file.dialog";

@Component({
    selector: 'app-empty',
    imports: [DividerModule, ButtonModule, CardModule],
    templateUrl: 'empty.component.html',
})
export default class EmptyComponent {
    private readonly pDialog = inject(DialogService);
    private readonly fileService = inject(FileService);
    private readonly ngActiveRoute = inject(ActivatedRoute);
    private readonly router = inject(Router);

    protected onCreateFile(): void {
        const ref = this.pDialog.open(FileDialogComponent, {
            data: null,
            modal: true,
            closable: true,
            header: 'Datei erstellen',
            width: '420px',
        });

        ref.onClose.pipe(take(1)).subscribe(async result => {
            if (result?.type === 'manually') {
                await this.fileService.writeFile(result.data.name, result.data.contents);
                this.router.navigate(['./', result.data.name], { relativeTo: this.ngActiveRoute });
            }
        });

    }
}