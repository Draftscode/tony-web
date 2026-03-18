import { inject } from '@angular/core';
import { signalStore } from '@ngrx/signals';
import { withResources } from '../../utils/signals';
import { StatsService } from '../provider/stats.service';

export const StatsStore = signalStore(
  { providedIn: 'root' },
  withResources(() => ({
    stats: inject(StatsService).getStats(),
  })),
);
