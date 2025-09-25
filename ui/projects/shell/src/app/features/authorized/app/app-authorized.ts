import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { MenuItem } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { DividerModule } from 'primeng/divider';
import { MenubarModule } from 'primeng/menubar';
import { MessageModule } from 'primeng/message';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { ScrollerModule } from 'primeng/scroller';
import { ToastModule } from 'primeng/toast';
import { TooltipModule } from 'primeng/tooltip';
import * as packageJson from '../../../../../../../package.json';
import { AuthService } from '../../../data-access/auth.service';
import { BlaudirektService } from '../../../data-access/blaudirekt.service';
import { FileService } from '../../../data-access/file.service';
import { ThemeService } from '../../../data-access/theme.service';
import { LanguageSelector } from '../../language/selector/language-selector';

@Component({
  selector: 'app',
  imports: [
    RouterOutlet, MessageModule, RouterLinkActive,
    DividerModule, TooltipModule, LanguageSelector,
    RouterLink, ToastModule, MenubarModule, TranslateModule, ScrollerModule,
    ButtonModule, ProgressSpinnerModule],
  templateUrl: 'app-authorized.html',
  styleUrl: 'app-authorized.scss',
})
export default class App {
  protected readonly version = packageJson.version;
  protected readonly _isSidebarOpen = signal<boolean>(false);
  protected readonly _menuItems = signal<MenuItem[]>([]);
  protected readonly _themeService = inject(ThemeService);
  protected readonly fileService = inject(FileService);
  private readonly router = inject(Router);
  protected readonly blaudirectService = inject(BlaudirektService);
  protected readonly authService = inject(AuthService);

  protected readonly _isLogVisible = signal<boolean>(false);
  protected readonly _logs = signal<string | null>(null);

  protected readonly menuItems = signal<MenuItem[]>([{
    id: 'files',
    routerLink: ['files'],
    label: 'label.files',
    icon: 'pi pi-folder-open'
  }, {
    id: 'users',
    routerLink: ['users'],
    label: 'label.users',
    icon: 'pi pi-users'
  }]);


  protected onLogout() {
    this.authService.logout();
    this.router.navigate(['/auth']);
  }

  protected _toggleSidebar() {
    this._isSidebarOpen.update(s => !s);
  }
}
