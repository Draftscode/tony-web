import { computed, inject } from "@angular/core";
import { patchState, signalMethod, signalStore, withComputed, withMethods, withProps, withState } from "@ngrx/signals";
import { TranslateService } from "@ngx-translate/core";
import { ConfirmationService } from "primeng/api";
import { DialogService } from "primeng/dynamicdialog";
import { finalize, lastValueFrom, switchMap, take, tap } from "rxjs";
import { FileDialogComponent } from "../../dialogs/file.dialog";
import { withResources } from "../../utils/signals";
import { Content, toPdf } from "../../utils/to-pdf";
import { DataFile, FileService } from "../provider/file.service";
import { BlaudirektCustomer } from "../provider/blaudirekt.service";

export const FileStore = signalStore(
    { providedIn: 'root' },
    withState({
        busy: 0,
        filter: {
            query: '' as string,
            timestamp: new Date().toISOString(),
        },
    }),
    withProps(store => ({
        fileService: inject(FileService),
        dialog: inject(DialogService),
        confirm: inject(ConfirmationService),
        translate: inject(TranslateService),
        refresh: () => {
            patchState(store, { filter: { ...store.filter(), timestamp: new Date().toISOString() } });
        },
        makeBusy: () => {
            patchState(store, { busy: store.busy() + 1 });
        },
        makeNonBusy: () => {
            patchState(store, { busy: store.busy() - 1 });
        }
    })),
    withResources(store => ({
        files: store.fileService.getAllFiles(store.filter.query, store.filter.timestamp),
    })),
    withMethods(store => ({
        connectQuery: signalMethod<string>(query => {
            if (store.filter.query() === query) { return; }
            patchState(store, { filter: { ...store.filter(), query } });
        }),
        editFile: (file: DataFile) => {
            store.makeBusy();
            const ref = store.dialog.open(FileDialogComponent, {
                closable: true,
                data: {
                    name: file.filename
                },
                header: store.translate.instant('utils.edit.value', { value: store.translate.instant('label.file.label') }),
                modal: true,
            });

            if (!ref) {
                return null;
            }

            return lastValueFrom(ref.onClose.pipe(
                take(1),
                switchMap(async result => {
                    const originalFile = store.files.value().items.find(storedFile => storedFile.id === file.id);
                    if (!originalFile) { return; }

                    if (result?.type === 'manually') {
                        const r = await lastValueFrom(store.fileService.renameFile(originalFile.filename, result.data.name));
                        store.refresh();
                        return r;
                    }

                    return null;
                }),
                finalize(() => store.makeNonBusy())));
        },
        createPdf: async <T extends Content>(contents: T) => {
            store.makeBusy();
            const html = toPdf(contents, store.translate);
            const blob = await lastValueFrom(store.fileService.createPdf(html).pipe(finalize(() => store.makeNonBusy())));
            const fileURL = URL.createObjectURL(blob);
            window.open(fileURL, '_blank');
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
                    store.makeBusy();
                    await lastValueFrom(store.fileService.deleteFile(filename).pipe(finalize(() => store.makeNonBusy())));
                    store.refresh();
                },
                reject: () => {
                }
            })

        },
        importFiles: async (files: File[]) => {
            store.makeBusy();
            await lastValueFrom(store.fileService.importFiles(files).pipe(finalize(() => store.makeNonBusy())));
            store.refresh();

        },
        readFile: <T>(filename: string) => {
            store.makeBusy();
            return lastValueFrom(store.fileService.readFile<T>(filename).pipe(finalize(() => store.makeNonBusy())));
        },
        createFile: async (customer?: BlaudirektCustomer) => {
            store.makeBusy();
            const ref = store.dialog.open(FileDialogComponent, {
                data: { customer },
                closable: true,
                header: store.translate.instant('utils.create.value',
                    { value: store.translate.instant('label.file.label') }
                ),
                modal: true,
                width: '420px'
            });

            if(!ref) {
                return null;
            }

            return lastValueFrom(ref.onClose.pipe(
                take(1),
                switchMap(async result => {
                    if (result?.type === 'manually') {
                        const r = await lastValueFrom(store.fileService.writeFile(result.data.name, result.data.contents));
                        store.refresh();
                        return r;
                    }

                    return null;
                }),
                finalize(() => store.makeNonBusy())));
        },
        writeFile: async <T>(filename: string, contents: T) => {
            store.makeBusy();
            await lastValueFrom(store.fileService.writeFile<T>(filename, contents).pipe(finalize(() => store.makeNonBusy())));
            store.refresh();
        }
    })),
    withComputed(store => ({
        isLoading: computed(() => store.busy() > 0),
    })),
);