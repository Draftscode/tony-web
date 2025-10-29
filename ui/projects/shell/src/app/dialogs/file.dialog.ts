import { Component, computed, inject, OnInit, signal } from "@angular/core";
import { toSignal } from "@angular/core/rxjs-interop";
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from "@angular/forms";
import { TranslatePipe } from "@ngx-translate/core";
import { AutoCompleteModule } from "primeng/autocomplete";
import { ButtonModule } from "primeng/button";
import { CheckboxModule } from "primeng/checkbox";
import { DividerModule } from "primeng/divider";
import { DynamicDialogConfig, DynamicDialogRef } from "primeng/dynamicdialog";
import { InputTextModule } from "primeng/inputtext";
import { MessageModule } from "primeng/message";
import { SelectModule } from "primeng/select";
import { BlaudirectContract, BlaudirektCustomer, BlaudirektService } from "../data-access/provider/blaudirekt.service";
import { CustomerStore } from "../data-access/store/customer.store";
import { CompanyComponent } from "./company";


@Component({
    selector: 'file-dialog',
    templateUrl: 'file.dialog.html',
    imports: [ReactiveFormsModule, FormsModule, MessageModule, SelectModule,
        CheckboxModule, AutoCompleteModule, CompanyComponent, TranslatePipe,
        InputTextModule, ButtonModule, DividerModule]
})
export class FileDialogComponent implements OnInit {
    private readonly pDialogRef = inject<DynamicDialogRef<FileDialogComponent>>(DynamicDialogRef);
    protected readonly pDialogConf = inject<DynamicDialogConfig<any>>(DynamicDialogConfig);

    private readonly customerStore = inject(CustomerStore);
    private readonly blaudirektService = inject(BlaudirektService);

    protected readonly formGroup = new FormGroup({
        name: new FormControl<string>('', [Validators.required]),
        customer: new FormControl<BlaudirektCustomer | null>(null),
        selectedContracts: new FormControl<BlaudirectContract[]>([]),
    });

    protected readonly contracts = signal<BlaudirectContract[]>([]);
    protected readonly formValues = toSignal(this.formGroup.valueChanges);
    protected readonly customers = computed(() => this.customerStore.customers.value()?.items);
    protected readonly isNew = signal<boolean>(true);

    constructor() {
        this.isNew.set(!this.pDialogConf.data?.name)
    }

    ngOnInit(): void {
        this.formGroup.controls.name.patchValue(this.pDialogConf.data?.name, { emitEvent: false });
        if (this.pDialogConf.data?.customer) {
            this.formGroup.controls.name.patchValue(`${this.pDialogConf.data.customer.displayName}`, { emitEvent: false });
            this.formGroup.controls.customer.patchValue(this.pDialogConf.data.customer, { emitEvent: false });
            this.searchContracts(this.pDialogConf.data.customer.id);
        }
    }

    protected toggleSelection() {
        if (this.formGroup.controls.selectedContracts.value?.length === this.contracts()?.length) {
            this.formGroup.patchValue({ selectedContracts: [] });
        } else {
            this.formGroup.patchValue({ selectedContracts: this.contracts() });
        }
    }


    protected isIndeterminate = computed(() => {
        const isIndeterminate = !!(this.formValues()?.selectedContracts?.length && (this.contracts().length !== (this.formValues()?.selectedContracts?.length ?? 0)));
        return isIndeterminate;
    });

    protected isChecked = computed(() => {
        const isChecked = !this.isIndeterminate() && !!(this.formValues()?.selectedContracts?.length === this.contracts().length);
        return isChecked;
    });



    protected search(query: string) {
        this.customerStore.search({ query, i: new Date().toISOString() });
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
                    type: contract.division.text
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