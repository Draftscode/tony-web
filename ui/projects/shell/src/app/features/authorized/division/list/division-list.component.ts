import { TitleCasePipe } from "@angular/common";
import { ChangeDetectionStrategy, Component, inject, signal } from "@angular/core";
import { TranslatePipe } from "@ngx-translate/core";
import { ButtonModule } from "primeng/button";
import { DividerModule } from "primeng/divider";
import { PopoverModule } from "primeng/popover";
import { TableLazyLoadEvent } from "primeng/table";
import { BlaudirektDivision } from "../../../../data-access/provider/blaudirekt.service";
import { DivisionStore } from "../../../../data-access/store/division.store";
import { SearchComponent } from "../../../../ui/search/search.component";
import { TableComponent, TableConfig } from "../../../../ui/table/table.component";
import { Tooltip } from "primeng/tooltip";

@Component({
    selector: 'app-division-list',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        TableComponent, SearchComponent,
        ButtonModule, PopoverModule, DividerModule,
        TranslatePipe, TitleCasePipe
    ],
    templateUrl: 'division-list.component.html',
    host: { class: 'flex w-full h-full justify-center flex-col overflow-auto' },
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
    protected readonly divisionStore = inject(DivisionStore);
    protected readonly divisionTableConfig = signal<TableConfig<BlaudirektDivision>>({
        columns: [
            { key: 'text', label: 'administration.division.label', width: 200 },
            { key: 'contractsCount', label: 'customer.contract.plural', sortable: false, width: 75 },
            { key: 'blocks', label: 'administration.block.plural', sortable: false, width: 75 },
            { key: 'info', label: 'Beschreibung', sortable: false, width: 200 },
            { key: 'actions', label: '', sortable: false, width: 60 }
        ]
    });

    protected onLazyLoad(event: TableLazyLoadEvent): void {
        this.divisionStore.search({
            query: '',
            limit: event.rows ?? 0,
            offset: event.first,
            sortField: (event.sortField ?? 'text') as string,
            sortOrder: event.sortOrder ?? -1
        });
    }


    protected createBlock(division: BlaudirektDivision) {
        this.divisionStore.createBlocks(division);
    }
}