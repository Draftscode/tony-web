import { ChangeDetectionStrategy, Component, computed, inject, linkedSignal } from "@angular/core";
import { Field, form, submit } from "@angular/forms/signals";
import { ButtonModule } from "primeng/button";
import { DividerModule } from "primeng/divider";
import { DynamicDialogConfig, DynamicDialogRef } from "primeng/dynamicdialog";
import { InputGroupModule } from "primeng/inputgroup";
import { InputGroupAddonModule } from "primeng/inputgroupaddon";
import { InputTextModule } from "primeng/inputtext";
import { TooltipModule } from "primeng/tooltip";
import { DivisionStore } from "../../data-access/store/division.store";

@Component({
    selector: 'app-blocks-assistant-dialog',
    templateUrl: 'blocks-assistant.dialog.html',
    imports: [InputTextModule, TooltipModule, Field, InputGroupAddonModule, InputGroupModule, DividerModule, ButtonModule],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class BlocksAssistantDialog {
    protected readonly divisionStore = inject(DivisionStore);
    private readonly dialogConfig = inject(DynamicDialogConfig);
    private readonly dialogRef = inject(DynamicDialogRef);

    protected readonly selectedDivision = computed(() => this.divisionStore.divisions.value().items?.length ? this.divisionStore.divisions.value().items[0] : null);

    protected readonly model = linkedSignal(() => {
        const selection = this.selectedDivision();

        return {
            blocks: selection?.blocks?.map(b => ({
                ...b,
                placeholder: b.placeholder ?? '',
                description: b.description ?? '',
                value: ''
            })) ?? []
        };
    });

    constructor() {
        this.divisionStore.search({ query: this.dialogConfig.data.division })
    }

    protected readonly ngForm = form(this.model);

    protected close() {
        submit(this.ngForm, async (form) => {
            const result = form.blocks().value();

            const finalResult = result
                .filter(data => !!data.value)
                .map(data => `${data.value}`)
                .reduce((p, c) => `${p}${p ? '; ' : ''}${c}`, '');

            this.dialogRef.close({ type: 'manually', data: finalResult });
        });
    }
}