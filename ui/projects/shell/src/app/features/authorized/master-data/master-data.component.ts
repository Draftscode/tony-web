import { ChangeDetectionStrategy, Component, computed, inject, model } from "@angular/core";
import { RouterLink, RouterLinkActive, RouterOutlet } from "@angular/router";
import { TranslatePipe } from "@ngx-translate/core";
import { TreeNode } from "primeng/api";
import { SystemRole } from "../../../data-access/provider/auth.service";
import { AccountStore } from "../../../data-access/store/account.store";
import { TreeComponent } from "../../../ui/tree/tree.component";

@Component({
    selector: 'app-master-data',
    templateUrl: 'master-data.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [TranslatePipe, RouterOutlet, RouterLinkActive, TreeComponent, RouterLink],
    host: { class: 'flex w-full h-full justify-center' },
})
export default class MasterDataComponent {
    protected readonly me = inject(AccountStore).me.value;
    protected readonly selectedItem = model<TreeNode | null>(null);
    protected readonly items = computed(() => {
        const me = this.me();
        const items: TreeNode[] = [];

        if (me?.roles.find(role => [SystemRole.admin, SystemRole.users].includes(role.name))) {
            items.push({
                key: 'users',
                data: {
                    routerLink: ['users'],
                },
                label: 'label.users',
                icon: 'pi pi-sitemap'
            });
        }
        if (me?.roles.find(role => [SystemRole.admin, SystemRole.customers].includes(role.name))) {
            items.push({
                key: 'customer',
                data: {
                    routerLink: ['customer'],
                },
                label: 'customer.label',
                icon: 'pi pi-users',

            })
        }
        if (me?.roles.find(role => [SystemRole.admin, SystemRole.insurers].includes(role.name))) {
            items.push({
                key: 'insurer',
                data: {
                    routerLink: ['insurer'],
                },
                label: 'insurer.label',
                icon: 'pi pi-crown'
            });
        }
        if (me?.roles.find(role => [SystemRole.admin, SystemRole.divisions].includes(role.name))) {
            items.push({
                key: 'division',
                data: {
                    routerLink: ['division'],
                },
                label: 'administration.division.label',
                icon: 'pi pi-home'
            });
        }

        return items;
    });
}

