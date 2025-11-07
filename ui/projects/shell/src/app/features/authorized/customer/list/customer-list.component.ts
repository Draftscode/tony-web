import { TitleCasePipe } from "@angular/common";
import { ChangeDetectionStrategy, Component, inject, signal } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { TranslatePipe } from "@ngx-translate/core";
import { ButtonModule } from "primeng/button";
import { DividerModule } from "primeng/divider";
import { PopoverModule } from "primeng/popover";
import { TableLazyLoadEvent } from "primeng/table";
import { BlaudirektCustomer } from "../../../../data-access/provider/blaudirekt.service";
import { CustomerStore } from "../../../../data-access/store/customer.store";
import { FileStore } from "../../../../data-access/store/file.store";
import { CustomerStatusComponent } from "../../../../ui/customer-status/customer-status.component";
import { SearchComponent } from "../../../../ui/search/search.component";
import { TableComponent, TableConfig } from "../../../../ui/table/table.component";
import { CustomerStatusFilterComponent } from "./customer-status-filter.component";

@Component({
    selector: 'app-customer-list',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        TableComponent, SearchComponent,
        ButtonModule, PopoverModule, DividerModule, CustomerStatusFilterComponent,
        TranslatePipe, CustomerStatusComponent, TitleCasePipe
    ],
    templateUrl: 'customer-list.component.html',
    host: { class: 'flex w-full flex-col h-full justify-center overflow-auto' },
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
    protected readonly fileStore = inject(FileStore);
    private readonly router = inject(Router);
    private readonly activatedRoute = inject(ActivatedRoute);
    protected readonly customerTableConfig = signal<TableConfig<BlaudirektCustomer>>({
        columns: [
            { key: 'firstname', label: 'person.firstname', width: 200 },
            { key: 'lastname', label: 'person.lastname', width: 200 },
            { key: 'contractsCount', label: 'customer.contract.count', sortable: false },
            { key: 'files', label: 'label.files' },
            { key: 'status', label: 'customer.status.label', filterable: true, width: 80 },
            { key: 'actions', label: '', sortable: false, width: 60 }
        ]
    });

    protected onLazyLoad(event: TableLazyLoadEvent): void {
        this.customerStore.search({
            query: '',
            limit: event.rows ?? 0,
            offset: event.first,
            filters: event.filters,
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


    protected onRowClick(e: { row: BlaudirektCustomer }) {
        this.router.navigate([e.row.id], { relativeTo: this.activatedRoute });
    }
}