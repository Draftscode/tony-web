import { MenuItem } from "primeng/api";
import { SystemRole, User } from "../../../data-access/provider/auth.service";

export function getMasterDataItems(me: User | null): MenuItem[] {
    const items: MenuItem[] = [];

    if (me?.roles.find(role => [SystemRole.admin, SystemRole.users].includes(role.name))) {
        items.push({
            key: 'users',
            routerLink: ['administration', 'users'],
            label: 'label.users',
            icon: 'pi pi-sitemap'
        });
    }
    if (me?.roles.find(role => [SystemRole.admin, SystemRole.customers].includes(role.name))) {
        items.push({
            key: 'customer',
            routerLink: ['administration', 'customer'],
            label: 'customer.label',
            icon: 'pi pi-users',

        })
    }
    if (me?.roles.find(role => [SystemRole.admin, SystemRole.insurers].includes(role.name))) {
        items.push({
            key: 'insurer',
            routerLink: ['administration', 'insurer'],
            label: 'insurer.label',
            icon: 'pi pi-crown'
        });
    }
    if (me?.roles.find(role => [SystemRole.admin, SystemRole.divisions].includes(role.name))) {
        items.push({
            key: 'division',
            routerLink: ['administration', 'division'],
            label: 'administration.division.label',
            icon: 'pi pi-home'
        });
    }

    return items;
}