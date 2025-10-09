import { httpResource } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { environment } from "../../../environments/environment";
import { ListResponse } from "../../utils/list.model";
import { Role } from "./auth.service";

@Injectable({ providedIn: 'root' })
export class RoleService {
    getAllRoles() {
        return httpResource<ListResponse<Role>>(() => ({
            url: `${environment.origin}/roles`,
            method: 'GET',
            params: {
                // q: q(),
                // t: timestamp(),
            }
        }), {
            defaultValue: {
                items: [],
                total: 0
            },
        })
    }

}