import { inject } from "@angular/core";
import { patchState, signalMethod, signalStore, withMethods, withProps, withState } from "@ngrx/signals";
import { TranslateService } from "@ngx-translate/core";
import { ConfirmationService } from "primeng/api";
import { DialogService } from "primeng/dynamicdialog";
import { lastValueFrom, switchMap, take } from "rxjs";
import { FileDialogComponent } from "../../dialogs/file.dialog";
import { withResources } from "../../utils/signals";
import { DataFile, FileService } from "../file.service";

export const FileStore = signalStore(
    { providedIn: 'root' },
    withState({
        query: '' as string,
    }),
    withProps(store => ({
        fileService: inject(FileService),
        dialog: inject(DialogService),
        confirm: inject(ConfirmationService),
        translate: inject(TranslateService),
    })),
    withResources(store => ({
        files: store.fileService.getAllFiles(store.query),
    })),
    withMethods(store => ({
        connectQuery: signalMethod<string>(query => {
            if (store.query() === query) { return; }
            patchState(store, { query });
        }),
        editFile: (file: DataFile) => {
            const ref = store.dialog.open(FileDialogComponent, {
                closable: true,
                data: {
                    name: file.filename
                },
                header:store.translate.instant('utils.edit.value',{value:store.translate.instant('label.file.label')}),
                modal: true,
            });

            return lastValueFrom(ref.onClose.pipe(take(1), switchMap(async result => {
                if (result?.type === 'manually') {
                    await store.fileService.renameFile(`${file.id}`, result.data.name);
                }

                return result;
            })));
        },
        deleteFile: (event: MouseEvent, filename: string) => {
            store.confirm.confirm({
                target: event.currentTarget as EventTarget,
                message: store.translate.instant('messages.confirmation.delete'),
                icon: 'pi pi-exclamation-triangle',
                rejectButtonProps: {
                    label: store.translate.instant('label.no'),
                    severity: 'secondary',
                    outlined: true
                },
                acceptButtonProps: {
                    label: store.translate.instant('label.yes')
                },
                accept: async () => {
                    await store.fileService.deleteFile(filename);
                },
                reject: () => {
                }
            })

        },
        createFile: async () => {
            const ref = store.dialog.open(FileDialogComponent, {
                data: null,
                closable: true,
                header: store.translate.instant('utils.create.value',
                    { value: store.translate.instant('label.file.label') }
                ),
                modal: true,
                width: '420px'
            });

            return lastValueFrom(ref.onClose.pipe(take(1), switchMap(async result => {
                if (result?.type === 'manually') {
                    await store.fileService.writeFile(result.data.name, result.data.contents);
                }

                return result;
            })));
        }
    }))
);