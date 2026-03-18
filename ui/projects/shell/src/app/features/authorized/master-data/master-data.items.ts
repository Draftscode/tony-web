import { MenuItem } from "primeng/api";
import { SystemRole, User } from "../../../data-access/provider/auth.service";

export function getMasterDataItems(me: User | null): MenuItem[] {
    const items: MenuItem[] = [];

    if (me?.roles.find(role => [SystemRole.admin, SystemRole.users].includes(role.name))) {
        items.push({
            key: 'users',
            routerLink: ['administration', 'users'],
            label: 'label.users',
            icon: 'pi pi-sitemap',
            iconClass: 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400'
        });
    }
    if (me?.roles.find(role => [SystemRole.admin, SystemRole.customers].includes(role.name))) {
        items.push({
            key: 'customer',
            routerLink: ['administration', 'customer'],
            label: 'customer.label',
            icon: 'pi pi-users',
            iconClass: 'bg-sky-100 dark:bg-sky-900/40 text-sky-600 dark:text-sky-400'
        })
    }
    if (me?.roles.find(role => [SystemRole.admin, SystemRole.insurers].includes(role.name))) {
        items.push({
            key: 'insurer',
            routerLink: ['administration', 'insurer'],
            label: 'insurer.label',
            icon: 'pi pi-crown',
            iconClass: 'bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400'
        });
    }
    if (me?.roles.find(role => [SystemRole.admin, SystemRole.divisions].includes(role.name))) {
        items.push({
            key: 'division',
            routerLink: ['administration', 'division'],
            label: 'administration.division.label',
            icon: 'pi pi-home',
            iconClass: 'bg-rose-100 dark:bg-rose-900/40 text-rose-600 dark:text-rose-400'
        });
    }

    return items;
}