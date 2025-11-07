import { Component, inject, signal } from "@angular/core";
import { TranslatePipe } from "@ngx-translate/core";
import { ButtonModule } from "primeng/button";
import { DividerModule } from "primeng/divider";
import { PopoverModule } from "primeng/popover";
import { TableModule } from "primeng/table";
import { UserStore } from "../../../../data-access/store/user.store";
import { RoleComponent } from "../../../../ui/role/role.component";
@Component({
    selector: 'app-user-list',
    templateUrl: './user-list.html',
    imports: [TableModule, RoleComponent, DividerModule, TranslatePipe, ButtonModule, PopoverModule],
    host: { class: 'flex w-full flex-col justify-center overflow-auto' }
})
export default class UserListComponent {
    protected readonly userStore = inject(UserStore);
    protected readonly query = signal<string>('');

    constructor() {
        this.userStore.connectQuery(this.query);
    }
}