import { Component, effect, inject, untracked } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { RouterOutlet } from '@angular/router';
import { ConfirmPopupModule } from 'primeng/confirmpopup';
import { FcmService } from './data-access/provider/fcm.service';
import { SettingsStore } from './data-access/store/settings.store';
import { toSignal } from '@angular/core/rxjs-interop';
import { PrimeNG } from 'primeng/config';
import { merge, switchMap } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, ConfirmPopupModule],
  templateUrl: './app.html',
})
export class App {
  private readonly title = inject(Title);
  private readonly fcm = inject(FcmService);
  private readonly settingsStore = inject(SettingsStore);
  private readonly primeng = inject(PrimeNG);
  private readonly translate = inject(TranslateService);
  private readonly trxChanges = toSignal(merge(
    this.translate.onLangChange,
    this.translate.onTranslationChange
  ).pipe(switchMap(() => this.translate.get('primeng'))));

  constructor() {
    this.title.setTitle('tonym');
    this.fcm.listen();
    // this.settingsStore.init();
    this.settingsStore.updateLanguage(navigator.language);

    effect(() => {
      const trx = this.trxChanges();

      untracked(() => this.primeng.setTranslation(trx));
    });
  }

}
