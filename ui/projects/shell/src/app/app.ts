import { Component, inject } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { RouterOutlet } from '@angular/router';
import { ConfirmPopupModule } from 'primeng/confirmpopup';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, ConfirmPopupModule],
  templateUrl: './app.html',
})
export class App {
  private readonly title = inject(Title);

  constructor() {
    this.title.setTitle('tonym');
  }
}
