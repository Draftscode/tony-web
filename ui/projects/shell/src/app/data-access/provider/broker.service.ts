import { httpResource } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { environment } from "../../../environments/environment";
import { ListResponse } from "../../utils/types/lists/list.model";
import { Role } from "./auth.service";

export type Broker = {
    id: string;
    name: string;
}

@Injectable({ providedIn: 'root' })
export class BrokerService {
    getAllBrokers() {
        return httpResource<ListResponse<Broker>>(() => ({
            url: `${environment.origin}/broker`,
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