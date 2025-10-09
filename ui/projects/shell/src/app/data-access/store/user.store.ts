
import { inject } from "@angular/core";
import { patchState, signalMethod, signalStore, withMethods, withProps, withState } from "@ngrx/signals";
import { TranslateService } from "@ngx-translate/core";
import { ConfirmationService } from "primeng/api";
import { DialogService } from "primeng/dynamicdialog";
import { lastValueFrom, switchMap, take } from "rxjs";
import { UserDialog } from "../../features/authorized/user/dialog/user-dialog";
import { User } from "../provider/auth.service";
import { UserService } from "../provider/user.service";

export const UserStore = signalStore(
    { providedIn: 'root' },
    withState({
        users: [] as User[],
    }),
    withProps((store) => ({
        userService: inject(UserService),
        dialog: inject(DialogService),
        translate: inject(TranslateService),
        confirm: inject(ConfirmationService)
    })),
    withMethods(store => ({
        connectQuery: signalMethod<string>(async query => {
            const response = await lastValueFrom(store.userService.getAll(query));
            patchState(store, { users: response.items });
        }),
        createUser: () => {
            const ref = store.dialog.open(UserDialog, {
                closable: true,
                modal: true,
                header: store.translate.instant('utils.create.value', { value: store.translate.instant('label.user') })
            });

            return lastValueFrom(ref.onClose.pipe(take(1), switchMap(async result => {
                if (result?.type === 'manually') {
                    const newUser = await lastValueFrom(store.userService.createUser(result.data));

                    // update users
                    patchState(store, ({ users }) => ({
                        users: users.concat(newUser)
                    }))
                }

                return result;
            })));
        },
        deleteUser: (event: MouseEvent, userId: number) => {
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
                    await lastValueFrom(store.userService.deleteUser(userId));
                    patchState(store, ({ users }) => ({ users: users.filter(user => user.id !== userId) }))
                },
                reject: () => {
                }
            });
        },
        editUser: (user: User) => {
            const ref = store.dialog.open(UserDialog, {
                closable: true,
                data: user,
                modal: true,
                header: store.translate.instant('utils.edit.value', { value: store.translate.instant('label.user') })
            });

            return lastValueFrom(ref.onClose.pipe(take(1), switchMap(async result => {
                if (result?.type === 'manually') {
                    const editedUser = await lastValueFrom(store.userService.editUser(user.id, result.data));

                    // update users
                    patchState(store, ({ users }) => ({
                        users: users.map(user =>
                            user.id === editedUser.id ? editedUser : user)
                    }))
                }

                return result;
            })));
        }
    })),

);