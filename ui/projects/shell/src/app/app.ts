import { Component, inject } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { RouterOutlet } from '@angular/router';
import { ConfirmPopupModule } from 'primeng/confirmpopup';
import { LanguageStore } from './data-access/store/language.store';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, ConfirmPopupModule],
  templateUrl: './app.html',
})
export class App {
  private readonly languageStore = inject(LanguageStore);
  private readonly title = inject(Title);

  constructor() {
    this.title.setTitle('tonym');
    this.languageStore.use(navigator.language);
  }
}
