import { inject } from "@angular/core";
import { patchState, signalMethod, signalStore, withMethods, withProps, withState } from "@ngrx/signals";
import { lastValueFrom } from "rxjs";
import { withResources } from "../../utils/signals";
import { MessageService } from "../provider/message.service";

export const MessageStore = signalStore(
    withState({
        i: new Date().toISOString(),
        file: null as string | null,
        userId: null as number | null,
    }),
    withProps(store => ({
        messageService: inject(MessageService),
    })),
    withResources(store => ({
        messages: store.messageService.find(store.file, store.i),
    })),
    withMethods(store => ({
        send: async (message: string) => {
            await lastValueFrom(store.messageService.createMessage({ text: message, userId: store.userId()!, filename: store.file()! }));
            patchState(store, { i: new Date().toISOString() });
        },
        delete: async (id: number) => {
            await lastValueFrom(store.messageService.deleteMessage(id));
            patchState(store, { i: new Date().toISOString() });
        },
        connectFile: signalMethod((file: string | null | undefined) => {
            patchState(store, { file });
        }),
        connectUser: signalMethod((userId: number | null | undefined) => {
            patchState(store, { userId });
        }),
    })),
);