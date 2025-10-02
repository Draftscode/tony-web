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
import { BlaudirektService } from '../../../data-access/blaudirekt.service';
import { AccountStore } from '../../../data-access/store/account.store';
import { ThemeService } from '../../../data-access/theme.service';
import { LanguageSelector } from '../../language/selector/language-selector';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { map } from 'rxjs';
import { toSignal } from '@angular/core/rxjs-interop';
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
  private readonly router = inject(Router);
  protected readonly blaudirectService = inject(BlaudirektService);
  protected readonly accountStore = inject(AccountStore);
  private readonly breakpointObserver = inject(BreakpointObserver);

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
    this.accountStore.logout();
    this.router.navigate(['/auth']);
  }

  protected _toggleSidebar() {
    this._isSidebarOpen.update(s => !s);
  }

  protected readonly isSmall = toSignal(this.breakpointObserver.observe([
    Breakpoints.Small,
    Breakpoints.XSmall,
  ]).pipe(map(result => result.matches)));
}
