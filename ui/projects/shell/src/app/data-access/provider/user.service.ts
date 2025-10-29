import { HttpClient } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { environment } from "../../../environments/environment";
import { ListResponse } from "../../utils/types/lists/list.model";
import { User } from "./auth.service";

@Injectable({ providedIn: 'root' })
export class UserService {
    private readonly http = inject(HttpClient);

    getAll(query: string) {
        return this.http.get<ListResponse<User>>(`${environment.origin}/users`)
    }

    createUser(user: Partial<User>) {
        return this.http.post<User>(`${environment.origin}/users`, user);
    }

    deleteUser(id: number) {
        return this.http.delete<void>(`${environment.origin}/users/${id}`);
    }

    editUser(id: number, user: User) {
        (Object.keys(user) as (keyof User)[]).forEach(key => {
            if (!user[key]) {
                delete user[key];
            }
        });

        return this.http.put<User>(`${environment.origin}/users/${id}`, user);
    }
}