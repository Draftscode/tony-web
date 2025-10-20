import { TitleCasePipe } from "@angular/common";
import { ChangeDetectionStrategy, Component, inject, signal } from "@angular/core";
import { TranslatePipe } from "@ngx-translate/core";
import { ButtonModule } from "primeng/button";
import { CardModule } from "primeng/card";
import { DividerModule } from "primeng/divider";
import { PopoverModule } from "primeng/popover";
import { TableLazyLoadEvent } from "primeng/table";
import { BlaudirektCompany } from "../../../../data-access/provider/blaudirekt.service";
import { InsurerStore } from "../../../../data-access/store/insurer.store";
import { CompanyComponent } from "../../../../dialogs/company";
import { SearchComponent } from "../../../../ui/search/search.component";
import { TableComponent, TableConfig } from "../../../../ui/table/table.component";

@Component({
    selector: 'app-insurer-list',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        TableComponent, CardModule, SearchComponent, CompanyComponent,
        ButtonModule, PopoverModule, DividerModule,
        TranslatePipe, TitleCasePipe
    ],
    templateUrl: 'insurer-list.component.html',
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
export default class InsurerListComponent {
    protected readonly insurerStore = inject(InsurerStore);
    protected readonly insurerTableConfig = signal<TableConfig<BlaudirektCompany>>({
        columns: [
            { key: 'name', label: 'insurer.name', width: 200 },
            { key: 'logo', label: 'insurer.logo', width: 200 },
            { key: 'blocks', label: 'insurer.blocks', width: 75 },
            // { key: 'actions', label: '', sortable: false, width: 60 }
        ]
    });

    protected onLazyLoad(event: TableLazyLoadEvent): void {
        this.insurerStore.search({
            query: '',
            limit: event.rows ?? 0,
            offset: event.first,
            sortField: (event.sortField ?? 'name') as string,
            sortOrder: event.sortOrder ?? -1
        });
    }
}