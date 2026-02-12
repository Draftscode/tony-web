import { HttpClient, httpResource } from "@angular/common/http";
import { inject, Injectable, Signal } from "@angular/core";
import { environment } from "../../../environments/environment";
import { ListResponse } from "../../utils/types/lists/list.model";
import { User } from "./auth.service";

export type Message = {
    id: number;
    createdAt: string;
    text: string;
    user: User;
    userId: number;
    filename: string;
}

@Injectable({ providedIn: 'root' })
export class MessageService {
    private readonly http = inject(HttpClient);

    find(file: Signal<string | null>, i: Signal<string>) {
        return httpResource<ListResponse<Message>>(() => file() ? ({
            url: `${environment.origin}/notes`,
            method: 'GET',
            params: {
                i: i(),
                file: file() ?? ''
            }
        }) : undefined, {
            defaultValue: {
                items: [],
                total: 0
            },
        })
    }

    createMessage(message: Partial<Message>) {
        return this.http.put<Message>(`${environment.origin}/notes`, message)
    }

    deleteMessage(id: number) {
        return this.http.delete<void>(`${environment.origin}/notes/${id}`)
    }

    readMessage(messageId: number) {
        return this.http.delete(`${environment.origin}/messages/${messageId}`);
    }
}