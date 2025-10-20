import { TitleCasePipe } from "@angular/common";
import { ChangeDetectionStrategy, Component, inject, signal } from "@angular/core";
import { Router } from "@angular/router";
import { TranslatePipe } from "@ngx-translate/core";
import { ButtonModule } from "primeng/button";
import { CardModule } from "primeng/card";
import { DividerModule } from "primeng/divider";
import { PopoverModule } from "primeng/popover";
import { TableLazyLoadEvent } from "primeng/table";
import { BlaudirektCustomer } from "../../../../data-access/provider/blaudirekt.service";
import { CustomerStore } from "../../../../data-access/store/customer.store";
import { FileStore } from "../../../../data-access/store/file.store";
import { LinkStore } from "../../../../data-access/store/link.store";
import { CustomerStatusComponent } from "../../../../ui/customer-status/customer-status.component";
import { SearchComponent } from "../../../../ui/search/search.component";
import { TableComponent, TableConfig } from "../../../../ui/table/table.component";

@Component({
    selector: 'app-customer-list',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        TableComponent, CardModule, SearchComponent,
        ButtonModule, PopoverModule, DividerModule,
        TranslatePipe, CustomerStatusComponent, TitleCasePipe
    ],
    templateUrl: 'customer-list.component.html',
    host: { class: 'flex w-full h-full justify-center p-4' },
    styles: `
    :host ::ng-deep {
        .p-card-body,
        .p-card-content {
            @apply flex flex-col overflow-auto h-full w-full
        }
    }
    `
})
export default class CustomerListComponent {
    protected readonly customerStore = inject(CustomerStore);
    protected readonly linkStore = inject(LinkStore);
    protected readonly fileStore = inject(FileStore);
    private readonly router = inject(Router);
    protected readonly customerTableConfig = signal<TableConfig<BlaudirektCustomer>>({
        columns: [
            { key: 'firstname', label: 'person.firstname', width: 200 },
            { key: 'lastname', label: 'person.lastname', width: 200 },
            { key: 'contractsCount', label: 'customer.contract.count', sortable: false },
            { key: 'files', label: 'label.files' },
            { key: 'status', label: '', sortable: false, width: 80 },
            { key: 'actions', label: '', sortable: false, width: 60 }
        ]
    });

    protected onLazyLoad(event: TableLazyLoadEvent): void {
        this.customerStore.search({
            query: '',
            limit: event.rows ?? 0,
            offset: event.first,
            sortField: (event.sortField ?? 'lastname') as string,
            sortOrder: event.sortOrder ?? -1
        });
    }

    protected async createFile(row: BlaudirektCustomer) {
        const file = await this.fileStore.createFile(row);
        if (file) {
            this.router.navigate(['/', 'app', 'files', file.filename])
        }
    }
}