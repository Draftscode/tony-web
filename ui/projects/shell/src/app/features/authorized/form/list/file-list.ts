import { DatePipe } from "@angular/common";
import { Component, inject, signal } from "@angular/core";
import { ActivatedRoute, Router, RouterLink, RouterLinkActive } from "@angular/router";
import { TranslatePipe } from "@ngx-translate/core";
import { ButtonModule } from "primeng/button";
import { CardModule } from "primeng/card";
import { DataViewModule } from 'primeng/dataview';
import { DividerModule } from "primeng/divider";
import { FileSelectEvent, FileUploadModule } from "primeng/fileupload";
import { InputGroupModule } from "primeng/inputgroup";
import { InputGroupAddonModule } from "primeng/inputgroupaddon";
import { InputTextModule } from "primeng/inputtext";
import { OverlayBadgeModule } from 'primeng/overlaybadge';
import { PopoverModule } from "primeng/popover";
import { TooltipModule } from "primeng/tooltip";
import { FileStore } from "../../../../data-access/store/file.store";
import { UserComponent } from "../../../../ui/user/user.component";
import { ChatComponent } from "../chat/chat.component";
import { Paginator, PaginatorState } from "primeng/paginator";
import { debounceTime, map, startWith, Subject, tap } from "rxjs";
import { toSignal } from "@angular/core/rxjs-interop";

@Component({
    selector: 'app-file-list',
    templateUrl: 'file-list.html',
    host: { class: 'flex w-full justify-center' },
    imports: [DataViewModule, CardModule, RouterLink, TooltipModule, DatePipe, ChatComponent, Paginator,
        FileUploadModule, DividerModule, RouterLinkActive, TranslatePipe, UserComponent, OverlayBadgeModule,
        PopoverModule, ButtonModule, InputTextModule, InputGroupAddonModule, InputGroupModule]
})
export default class FileList {
    protected readonly fileStore = inject(FileStore);
    private readonly router = inject(Router);
    private readonly activatedRoute = inject(ActivatedRoute);

    protected readonly query$ = new Subject<string>();
    protected readonly query = toSignal<string>(this.query$.pipe(debounceTime(450), startWith(''), map(v => v ?? '')));

    constructor() {
        this.fileStore.connectQuery(this.query);
    }

    protected onInput(query: string) {
        this.query$.next(query);
    }

    protected onPageChange(e: PaginatorState) {
        console.log(e)
        this.fileStore.changePage(e.page ?? 0, e.rows ?? 0);
    }

    protected async onCreateFile() {
        const result = await this.fileStore.createFile();
        if (result) {
            this.router.navigate(['./', result.filename], { relativeTo: this.activatedRoute });
        }
    }

    protected async onImport(event: FileSelectEvent) {
        this.fileStore.importFiles(Array.from(event.files));
    }

}