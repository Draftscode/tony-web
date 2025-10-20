import { ChangeDetectionStrategy, Component, inject, signal } from "@angular/core";
import { patchState, signalState } from "@ngrx/signals";
import { ButtonModule } from "primeng/button";
import { CardModule } from "primeng/card";
import { InputTextModule } from "primeng/inputtext";
import { StepperModule } from 'primeng/stepper';
import { lastValueFrom } from "rxjs";
import { FileService } from "../../../data-access/provider/file.service";
import { LinkStore } from "../../../data-access/store/link.store";
import { SignaturePadComponent } from "../../../ui/signature-pad/signature-pad.component";
import { injectParam } from "../../../utils/signals/inject-param";
import { BlaudirektService } from "../../../data-access/provider/blaudirekt.service";

type ContactInfo = {
    firstname: string;
    lastname: string;
    signature: string;
}

type Contacts = {
    client: { signature: string };
    contact: ContactInfo;
}

@Component({
    selector: 'app-signing',
    templateUrl: 'signing.component.html',
    imports: [SignaturePadComponent, StepperModule, ButtonModule, CardModule, InputTextModule],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class SigningComponent {
    protected readonly hash = signal(injectParam('hash'));
    protected readonly linkStore = inject(LinkStore);
    private readonly blaudirektService = inject(BlaudirektService);

    protected readonly contacts = signalState<Contacts>({
        client: {
            signature: '',
        },
        contact: {
            firstname: '',
            lastname: '',
            signature: ''
        }
    });

    protected updateContact(type: 'client' | 'contact', info: Partial<ContactInfo>) {
        patchState(this.contacts, (state) => ({
            [type]: {
                ...state[type],
                ...info,
            }
        }));
    }

    protected async createPdf() {
        const id = this.linkStore.link.value()?.customer.id;
        if (!id) { return; }
        const blob = await lastValueFrom(this.blaudirektService.addDocument(id, `<html>
        <body>
            <div style="display: flex; flex-direction:column; gap: 8px">
                <div style="display: flex; gap: 4px">
                    <span>${this.linkStore.link.value()?.customer.firstname}</span>
                    <span>${this.linkStore.link.value()?.customer.lastname}</span>
                </div>
                <img style="width:180px; height:100px" src="${this.contacts.client.signature()}">
                <br>
                _________________________
            </div>
            <hr />
            <div style="display: flex; flex-direction:column; gap: 8px">
                <div style="display: flex; gap: 4px">
                    <span>${this.contacts.contact.firstname()}</span>
                    <span>${this.contacts.contact.lastname()}</span>
                </div>
                <img style="width:180px; height:100px" src="${this.contacts.contact.signature()}">
                <br>
                _________________________
            </div>
        </body>    
        </html>`));
        const fileURL = URL.createObjectURL(blob);
        window.open(fileURL, '_blank');
    }

    constructor() {
        this.linkStore.connectHash(this.hash);
    }
}