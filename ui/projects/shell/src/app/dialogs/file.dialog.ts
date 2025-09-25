import { Component, computed, inject, signal } from "@angular/core";
import { toSignal } from "@angular/core/rxjs-interop";
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from "@angular/forms";
import { TranslateModule } from "@ngx-translate/core";
import { AutoCompleteModule } from "primeng/autocomplete";
import { ButtonModule } from "primeng/button";
import { CheckboxModule } from "primeng/checkbox";
import { DividerModule } from "primeng/divider";
import { DynamicDialogConfig, DynamicDialogRef } from "primeng/dynamicdialog";
import { InputTextModule } from "primeng/inputtext";
import { KeyFilterModule } from 'primeng/keyfilter';
import { MessageModule } from "primeng/message";
import { SelectModule } from "primeng/select";
import { BlaudirectContract, BlaudirektCustomer, BlaudirektService } from "../data-access/blaudirekt.service";
import { CompanyComponent } from "./company";


@Component({
    selector: 'file-dialog',
    templateUrl: 'file.dialog.html',
    imports: [ReactiveFormsModule, FormsModule, MessageModule, SelectModule,
        CheckboxModule, AutoCompleteModule, CompanyComponent, TranslateModule,
        KeyFilterModule, InputTextModule, ButtonModule, DividerModule]
})
export class FileDialogComponent {
    protected readonly blockChars: RegExp = /^(?!.* {2})[A-Za-z0-9ÄÖÜäöüß\-, ]*$/u;
    private readonly pDialogRef = inject<DynamicDialogRef<FileDialogComponent>>(DynamicDialogRef);
    protected readonly pDialogConf = inject<DynamicDialogConfig<any>>(DynamicDialogConfig);

    protected readonly blaudirektService = inject(BlaudirektService);

    protected readonly formGroup = new FormGroup({
        name: new FormControl<string>('', [Validators.required]),
        customer: new FormControl<BlaudirektCustomer | null>(null),
        selectedContracts: new FormControl<BlaudirectContract[]>([]),
    });

    protected readonly contracts = signal<BlaudirectContract[]>([]);

    constructor() {
        this.formGroup.controls.name.patchValue(this.pDialogConf.data?.name, { emitEvent: false });
    }

    protected toggleSelection() {
        if (this.formGroup.controls.selectedContracts.value?.length === this.contracts()?.length) {
            this.formGroup.patchValue({ selectedContracts: [] });
        } else {
            this.formGroup.patchValue({ selectedContracts: this.contracts() });
        }
    }

    protected readonly formValues = toSignal(this.formGroup.valueChanges);

    protected isIndeterminate = computed(() => {
        const isIndeterminate = !!(this.formValues()?.selectedContracts?.length && (this.contracts().length !== (this.formValues()?.selectedContracts?.length ?? 0)));
        return isIndeterminate;
    });

    protected isChecked = computed(() => {
        const isChecked = !this.isIndeterminate() && !!(this.formValues()?.selectedContracts?.length === this.contracts().length);
        return isChecked;
    });

    protected readonly customers = this.blaudirektService.customers


    protected search(query: string) {
        this.blaudirektService.search(query);
    }

    protected async searchContracts(customerId?: string) {
        this.contracts.set(await this.blaudirektService.searchContracts(customerId));
        this.toggleSelection();
    }

    protected async onClose() {
        if (this.formGroup.invalid) { return; }
        const raw = this.formGroup.getRawValue();


        let contents = {};
        if (raw.customer?.id) {
            const items = raw.selectedContracts?.map(contract => {
                const fromTo = [
                    contract.start ? new Date(contract.start).toISOString() : null,
                    contract.end ? new Date(contract.end).toISOString() : null,
                ];

                return {
                    contribution: contract.payment.grossAmount,
                    fromTo,
                    insurer: { logo: contract.company.logo, name: contract.company.name },
                    monthly: contract.payment.interval.id !== '1',
                    nr: contract.policyNumber,
                    oneTimePayment: 0,
                    party: raw.customer ? raw.customer.displayName : '-',
                    scope: contract.risk,
                    suggestion: { value: 'acquisition', label: 'Übernahme' },
                    type: contract.line.text
                };
            });


            contents = {
                persons: [{
                    title: raw.customer.title,
                    gender: raw.customer.gender,
                    firstname: raw.customer?.firstname,
                    lastname: raw.customer?.lastname,
                    street: raw.customer?.mainAddress?.street,
                    streetNo: raw.customer?.mainAddress?.streetNo,
                    city: raw.customer?.mainAddress?.city,
                    company: raw.customer?.displayName !== `${raw.customer.firstname} ${raw.customer.lastname}` ? raw.customer.displayName : '',
                    zipCode: raw.customer?.mainAddress?.zip
                }],
                groups: [{
                    name: 'Bestand',
                    items,
                }]
            }
        }

        this.pDialogRef.close({
            type: 'manually',
            data: { name: raw.name, contents },
        })
    }
}