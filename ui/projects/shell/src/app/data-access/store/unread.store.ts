import { inject } from '@angular/core';
import { patchState, signalStore, withMethods, withProps, withState } from '@ngrx/signals';
import { withResources } from '../../utils/signals';
import { MessageService } from '../provider/message.service';

export const UnreadStore = signalStore(
  { providedIn: 'root' },
  withState({ i: new Date().toISOString() }),
  withProps(store => ({
    messageService: inject(MessageService),
  })),
  withResources(store => ({
    count: store.messageService.countUnread(store.i),
  })),
  withMethods(store => ({
    refresh: () => patchState(store, { i: new Date().toISOString() }),
  })),
);
