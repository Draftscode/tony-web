import { DatePipe, DecimalPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { RouterModule } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { DividerModule } from 'primeng/divider';
import { SkeletonModule } from 'primeng/skeleton';
import { AccountStore } from '../../../data-access/store/account.store';
import { SettingsStore } from '../../../data-access/store/settings.store';
import { StatsStore } from '../../../data-access/store/stats.store';

@Component({
  selector: 'app-dashboard',
  host: { class: 'flex flex-col w-full overflow-auto' },
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterModule, TranslatePipe, SkeletonModule, CardModule, ButtonModule, DividerModule, DatePipe, DecimalPipe],
  templateUrl: './dashboard.html',
})
export default class DashboardComponent {
  protected readonly accountStore = inject(AccountStore);
  protected readonly statsStore = inject(StatsStore);
  protected readonly settingsStore = inject(SettingsStore);

  protected readonly today = new Date();

  protected readonly greeting = computed(() => {
    const me = this.accountStore.me.value();
    if (!me) { return ''; }
    return me.firstname ? `${me.firstname} ${me.lastname ?? ''}`.trim() : me.username;
  });
}
