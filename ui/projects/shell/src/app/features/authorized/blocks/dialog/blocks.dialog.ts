import { ChangeDetectionStrategy, Component, inject, linkedSignal, signal } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { applyEach, Field, form, required, schema, submit } from "@angular/forms/signals";
import { TranslatePipe } from "@ngx-translate/core";
import { ButtonModule } from "primeng/button";
import { DynamicDialogConfig, DynamicDialogRef } from "primeng/dynamicdialog";
import { EditorModule } from 'primeng/editor';
import { InputTextModule } from "primeng/inputtext";
import { SelectModule } from "primeng/select";
import { TextareaModule } from "primeng/textarea";
import { BlaudirektDivision, BuildingBlock } from "../../../../data-access/provider/blaudirekt.service";
import { DivisionStore } from "../../../../data-access/store/division.store";

type BlockDialogConfig = {
    division: BlaudirektDivision;
}

export const blockSchema = schema<BuildingBlock>((path) => {
    required(path.key);
});

@Component({
    selector: 'app-blocks-dialog',
    changeDetection: ChangeDetectionStrategy.OnPush,
    templateUrl: 'blocks.dialog.html',
    imports: [SelectModule, TranslatePipe, Field, EditorModule, TextareaModule, ButtonModule, InputTextModule, FormsModule],
})
export class BlocksDialog {
    protected readonly divisionStore = inject(DivisionStore);
    private readonly dialogConfig = inject(DynamicDialogConfig<BlockDialogConfig>);
    private readonly dialogRef = inject(DynamicDialogRef);

    protected readonly selectedBlock = signal<BlaudirektDivision>(this.dialogConfig.data.division);
    protected readonly model = linkedSignal(() => {
        const defaultBlocks =   this.selectedBlock().blocks?.length ? this.selectedBlock().blocks ?? [] : [{ key: '', description: '', placeholder: '' }];
        return {
            blocks: defaultBlocks,
            info: this.dialogConfig.data.division.info,
        };
    });


    protected readonly blockForm = form(this.model, path => {
        applyEach(path.blocks, blockSchema)
    });

    protected addBlock() {
        const blockForm = this.blockForm.blocks();
        blockForm.value.update((blocks) => blocks.concat({ key: '', description: '', placeholder: '' }))
    }

    protected removeBlock(index: number) {
        const blockForm = this.blockForm.blocks();
        blockForm.value.update((blocks) => blocks.filter((_, i) => i !== index))
    }

    protected close() {
        submit(this.blockForm, async (form) => {
            const result = form().value();
            this.dialogRef.close({ type: 'manually', data: result });
        });
    }
}