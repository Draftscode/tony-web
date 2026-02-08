import { Component, inject } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { RouterOutlet } from '@angular/router';
import { ConfirmPopupModule } from 'primeng/confirmpopup';
import { FcmService } from './data-access/provider/fcm.service';
import { SettingsStore } from './data-access/store/settings.store';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, ConfirmPopupModule],
  templateUrl: './app.html',
})
export class App {
  private readonly title = inject(Title);
  private readonly fcm = inject(FcmService);
  private readonly settingsStore = inject(SettingsStore);

  constructor() {
    this.title.setTitle('tonym');
    this.fcm.listen();
    // this.settingsStore.init();
    this.settingsStore.updateLanguage(navigator.language);
  }

}
