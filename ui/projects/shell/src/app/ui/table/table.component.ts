import { NgTemplateOutlet } from "@angular/common";
import { ChangeDetectionStrategy, Component, contentChild, input, output, TemplateRef } from "@angular/core";
import { ColumnFilter, TableLazyLoadEvent, TableModule } from "primeng/table";

type TableColumn<Row> = {
    key: string;
    label?: string;
    hideLabel?: boolean;
    sortable?: boolean;
    width?: number;
    filterable?: boolean;
}

export type TableConfig<Row> = {
    columns: TableColumn<Row>[];
}

@Component({
    selector: 'app-table',
    templateUrl: 'table.component.html',
    imports: [TableModule, NgTemplateOutlet],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class TableComponent<Row> {
    items = input<Row[]>([]);
    config = input<TableConfig<Row>>();
    lazy = input<boolean>(true);
    rowsPerPage = input<number>(20);
    paginator = input<boolean>(true);
    totalRows = input<number>(0);
    disabled = input<boolean>(false);
    sortField = input<string>('');
    sortOrder = input<number>(1);

    rowClick = output<{ row: Row, column: TableColumn<unknown> }>();

    lazyLoad = output<TableLazyLoadEvent>();

    cellTemplate = contentChild<TemplateRef<unknown>>('cell');
    columnTemplate = contentChild<TemplateRef<unknown>>('column');
    filterTemplate = contentChild<TemplateRef<unknown>>('filter');

    protected _onFilter(filterCb: (v: unknown, field: string) => void, ref: ColumnFilter, value: unknown, field: string) {
        // filter value
        filterCb(value, field);
        // applies values
        // ref.applyFilter();
        // // do not discard changes on hide
        // // ref['applyHasBeenClicked'] = true;
        // // forces overlay to stay opened
        // ref.overlayVisible = true;
    }
}