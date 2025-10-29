import { inject } from "@angular/core";
import { signalStore, withProps } from "@ngrx/signals";
import { withResources } from "../../utils/signals";
import { RoleService } from "../provider/roles.service";
import { BrokerService } from "../provider/broker.service";

export const BrokerStore = signalStore(
    { providedIn: 'root' },
    withProps(store => ({
        brokerService: inject(BrokerService),
    })),
    withResources(store => ({
        brokers: store.brokerService.getAllBrokers(),
    }))
)