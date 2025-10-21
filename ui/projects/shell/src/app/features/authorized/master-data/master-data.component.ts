import { ChangeDetectionStrategy, Component, computed, effect, model } from "@angular/core";
import { RouterLink, RouterLinkActive, RouterOutlet } from "@angular/router";
import { TranslatePipe } from "@ngx-translate/core";
import { TreeNode } from "primeng/api";
import { TreeComponent } from "../../../ui/tree/tree.component";

@Component({
    selector: 'app-master-data',
    templateUrl: 'master-data.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [TranslatePipe, RouterOutlet, RouterLinkActive, TreeComponent, RouterLink],
    host: { class: 'flex w-full h-full justify-center' },
})
export default class MasterDataComponent {
    protected readonly selectedItem = model<TreeNode | null>(null);
    protected readonly items = computed(() => {
        const items: TreeNode[] = [{
            key: 'customer',
            data: {
                routerLink: ['customer'],
            },
            label: 'customer.label',
            icon: 'pi pi-users'
        }, {
            key: 'insurer',
            data: {
                routerLink: ['insurer'],
            },
            label: 'insurer.label',
            icon: 'pi pi-crown'
        }, {
            key: 'division',
            data: {
                routerLink: ['division'],
            },
            label: 'disivion.label',
            icon: 'pi pi-home'
        }, {
            key: 'users',
            data: {
                routerLink: ['users'],
            },
            label: 'label.users',
            icon: 'pi pi-sitemap'
        }];

        return items;
    });


    constructor() {
        effect(() => console.log(this.selectedItem()))
    }
}

