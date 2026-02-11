import { Component, computed, inject, linkedSignal, signal, viewChild } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { Button } from 'primeng/button';
import { ColorPicker, ColorPickerChangeEvent } from 'primeng/colorpicker';
import { DynamicDialogRef } from 'primeng/dynamicdialog';
import { FileSelectEvent, FileUpload } from 'primeng/fileupload';
import { Message } from 'primeng/message';
import { Tooltip } from 'primeng/tooltip';
import { AccountStore } from '../../../../data-access/store/account.store';
import { fileToBase64 } from '../../../../utils/files/file-to-base64';
import { FormsModule } from '@angular/forms';

@Component({
    selector: 'app-profile',
    imports: [FileUpload, Button, Message, FormsModule, TranslatePipe, Tooltip, ColorPicker],
    templateUrl: 'profile.component.html',
})
export class ProfileComponent {
    private readonly dialogRef = inject(DynamicDialogRef<ProfileComponent>);
    private readonly accountStore = inject(AccountStore);
    private readonly fileupload = viewChild(FileUpload);
    protected readonly me = computed(() => this.accountStore.me.hasValue() ? this.accountStore.me.value() : null);

    protected readonly color = linkedSignal<string>(() => this.accountStore.me.hasValue() ? this.accountStore.me.value()?.color ?? '#6466f1' : '#6466f1');

    protected async clear() {
        await this.accountStore.editMe({ logo: null });
        this.fileupload()?.clear();
    }

    protected async changeColor(e: string) {
        await this.accountStore.editMe({ color: this.color() })
    }

    protected async onImport(e: FileSelectEvent) {
        const base64 = await fileToBase64(Array.from(e.files)[0]);
        await this.accountStore.editMe({ logo: base64 });
        this.fileupload()?.clear();
    }
}