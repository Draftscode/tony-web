import { Component, computed, inject } from "@angular/core";
import { FormArray, FormControl, FormGroup, ReactiveFormsModule } from "@angular/forms";
import { TranslatePipe, TranslateService } from "@ngx-translate/core";
import { AutoCompleteModule } from "primeng/autocomplete";
import { ButtonModule } from "primeng/button";
import { CheckboxModule } from "primeng/checkbox";
import { DatePickerModule } from "primeng/datepicker";
import { DividerModule } from "primeng/divider";
import { DialogService, DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { InputGroupModule } from "primeng/inputgroup";
import { InputGroupAddonModule } from "primeng/inputgroupaddon";
import { InputNumber } from "primeng/inputnumber";
import { InputTextModule } from "primeng/inputtext";
import { PopoverModule } from "primeng/popover";
import { SelectModule } from "primeng/select";
import { TooltipModule } from "primeng/tooltip";
import { lastValueFrom, take } from "rxjs";
import { BlaudirektCompany } from "../../../../data-access/provider/blaudirekt.service";
import { DivisionStore } from "../../../../data-access/store/division.store";
import { InsurerStore } from "../../../../data-access/store/insurer.store";
import { BlocksAssistantDialog } from "../../../../dialogs/blocks-assistant/blocks-assistant.dialog";
import { CompanyComponent } from "../../../../dialogs/company";
import { TextareaModule } from "primeng/textarea";
export type SuggestionType = 'inventory' | 'terminated' | 'new' | 'acquisition';

export type Suggestion = {
    value: SuggestionType;
    label: string;
}

export type FormArrayType = {
    nr: FormControl<string | null>;
    party: FormControl<string | null>;//VN
    fromTo: FormControl<string | null>;
    insurer: FormControl<BlaudirektCompany | null>;
    scope: FormControl<string | null>;
    suggestion: FormControl<Suggestion | null>;
    oneTimePayment: FormControl<number | null>;
    contribution: FormControl<number | null>;
    type: FormControl<string | null>;
    monthly: FormControl<boolean | null>;
}

export type FormType = {
    zipCode: FormControl<string | null>;
    streetNo: FormControl<string | null>;
    street: FormControl<string | null>;
    city: FormControl<string | null>;
    firstname: FormControl<string | null>;
    lastname: FormControl<string | null>;
    items: FormArray<FormGroup<FormArrayType>>;
}

@Component({
    standalone: true,
    selector: 'form-dialog',
    templateUrl: 'form-dialog.html',
    imports: [
        InputGroupModule, InputGroupAddonModule, PopoverModule, TextareaModule,
        ReactiveFormsModule, CheckboxModule, ButtonModule, InputNumber, AutoCompleteModule, TooltipModule,
        DividerModule, InputTextModule, SelectModule, DatePickerModule, TranslatePipe, SelectModule, CompanyComponent]
})
export class FormDialogComponent {
    private readonly pDialogRef = inject<DynamicDialogRef<FormDialogComponent>>(DynamicDialogRef);
    private readonly pDialogConfig = inject<DynamicDialogConfig<any>>(DynamicDialogConfig);
    private readonly ngxTranslate = inject(TranslateService);
    protected readonly insurerStore = inject(InsurerStore);
    protected readonly divisionStore = inject(DivisionStore);
    private readonly dialogService = inject(DialogService);

    constructor() {
        const data = this.pDialogConfig.data;

        if (data) {
            let fromTo: any = '';
            if (typeof data.fromTo === 'string' && data.fromTo?.startsWith(' -')) {
                fromTo = data.fromTo.replace(' - ', '');
            } else if (Array.isArray(data.fromTo)) {
                fromTo = data.fromTo.map((d: string) => new Date(d));
            }

            this._formGroup = new FormGroup<FormArrayType>({
                nr: new FormControl<string | null>(data.nr),
                fromTo: new FormControl<string | null>(fromTo),
                party: new FormControl<string | null>(data.party),
                type: new FormControl<string | null>(data.type),
                insurer: new FormControl<BlaudirektCompany | null>(data.insurer),
                scope: new FormControl<string | null>(data.scope),
                suggestion: new FormControl<Suggestion | null>(data.suggestion),
                oneTimePayment: new FormControl<number>(data.oneTimePayment),
                contribution: new FormControl<number>(data.contribution),
                monthly: new FormControl<boolean>(data.monthly),
            });
        }
    }

    protected async onAssistant() {
        const ref = this.dialogService.open(BlocksAssistantDialog, {
            data: {
                division: this._formGroup.controls.type.value
            },
            modal: true,
            header: 'Assistant',
            closable: true,
        });

        const result = await lastValueFrom(ref.onClose.pipe(take(1)));
        if (result?.type === 'manually') {
            this._formGroup.controls.scope.patchValue(result.data);
        }
    }

    protected readonly _formGroup = new FormGroup<FormArrayType>({
        nr: new FormControl<string | null>(null),
        fromTo: new FormControl<string | null>(null),
        party: new FormControl<string | null>(null),
        type: new FormControl<string | null>(null),
        insurer: new FormControl<BlaudirektCompany | null>(null),
        scope: new FormControl<string | null>(null),
        suggestion: new FormControl<Suggestion | null>({ value: 'new', label: this.ngxTranslate.instant('label.new') }),
        oneTimePayment: new FormControl<number>(0),
        contribution: new FormControl<number>(0),
        monthly: new FormControl<boolean>(true),
    });

    protected insurers = computed(() => {
        const customInsurer = {
            id: '',
            name: `${this.insurerStore.filter.query()}`,
            logo: '',
        }

        return (this.insurerStore.insurers.value()?.items ?? []).concat(customInsurer);
    })

    protected close() {
        if (this._formGroup.invalid) { return; }

        const values = this._formGroup.getRawValue();
        if (typeof values.insurer === 'string') {
            values.insurer = {
                id: '',
                name: values.insurer,
                logo: '',
            };
        }

        this.pDialogRef.close({
            type: 'manually',
            data: values,
        })
    }

    protected _suggs: Suggestion[] = [];

    protected onSearch(query: string) {
        this._suggs = [
            { value: 'new', label: this.ngxTranslate.instant('label.new') },
            { value: 'terminated', label: this.ngxTranslate.instant('label.terminated') },
            { value: 'inventory', label: this.ngxTranslate.instant('label.inventory') },
            { value: 'acquisition', label: this.ngxTranslate.instant('label.acquisition') }
        ];
    }
}