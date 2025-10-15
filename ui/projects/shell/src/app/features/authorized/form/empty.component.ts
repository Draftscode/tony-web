import { Component, inject } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { TranslatePipe } from "@ngx-translate/core";
import { ButtonModule } from "primeng/button";
import { CardModule } from "primeng/card";
import { DividerModule } from "primeng/divider";
import { FileStore } from "../../../data-access/store/file.store";

@Component({
    selector: 'app-empty',
    imports: [DividerModule, ButtonModule, CardModule, TranslatePipe],
    templateUrl: 'empty.component.html',
    host: { class: 'w-full h-full flex items-center justify-center' }
})
export default class EmptyComponent {
    private readonly activatedRoute = inject(ActivatedRoute);
    private readonly router = inject(Router);
    private readonly fileStore = inject(FileStore);

    protected async onCreateFile() {
        const result = await this.fileStore.createFile();
        if (result) {
            this.router.navigate(['./', result.data.name], { relativeTo: this.activatedRoute });
        }
    }
}