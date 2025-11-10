import { ChangeDetectionStrategy, Component, inject } from "@angular/core";
import { RouterOutlet } from "@angular/router";
import { CardModule } from "primeng/card";
import { AccountStore } from "../../../data-access/store/account.store";

@Component({
    selector: 'app-master-data',
    templateUrl: 'master-data.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [RouterOutlet, CardModule],
    host: { class: 'flex w-full max-h-full justify-center p-4 pt-0' },
})
export default class MasterDataComponent {
    protected readonly me = inject(AccountStore).me.value;
}

