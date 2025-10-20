import { NgTemplateOutlet } from "@angular/common";
import { ChangeDetectionStrategy, Component, contentChild, input, output, TemplateRef } from "@angular/core";
import { TableLazyLoadEvent, TableModule } from "primeng/table";

type TableColumn<Row> = {
    key: string;
    label?: string;
    hideLabel?: boolean;
    sortable?: boolean;
    width?: number;
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

    lazyLoad = output<TableLazyLoadEvent>();

    cellTemplate = contentChild<TemplateRef<unknown>>('cell');
    columnTemplate = contentChild<TemplateRef<unknown>>('column');
}