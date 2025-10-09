import { inject } from "@angular/core";
import { signalStore, withProps } from "@ngrx/signals";
import { withResources } from "../../utils/signals";
import { RoleService } from "../provider/roles.service";

export const RoleStore = signalStore(
    { providedIn: 'root' },
    withProps(store => ({
        roleService: inject(RoleService),
    })),
    withResources(store => ({
        roles: store.roleService.getAllRoles(),
    }))
)