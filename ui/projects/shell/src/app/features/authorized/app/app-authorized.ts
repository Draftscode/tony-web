import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { Router, RouterOutlet } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { MenuItem } from 'primeng/api';
import { AvatarModule } from 'primeng/avatar';
import { ButtonModule } from 'primeng/button';
import { DividerModule } from 'primeng/divider';
import { DrawerModule } from 'primeng/drawer';
import { MenubarModule } from 'primeng/menubar';
import { MessageModule } from 'primeng/message';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { RippleModule } from 'primeng/ripple';
import { ScrollerModule } from 'primeng/scroller';
import { ToastModule } from 'primeng/toast';
import { TooltipModule } from 'primeng/tooltip';
import { map } from 'rxjs';
import * as packageJson from '../../../../../../../package.json';
import { BlaudirektService } from '../../../data-access/provider/blaudirekt.service';
import { ThemeService } from '../../../data-access/provider/theme.service';
import { AccountStore } from '../../../data-access/store/account.store';
import { SettingsStore } from '../../../data-access/store/settings.store';
import { getMasterDataItems } from '../master-data/master-data.items';
import { SettingsComponent } from '../settings/settings.component';
import { MenuItemComponent } from './item/menu-item.component';

@Component({
  selector: 'app',
  imports: [
    RouterOutlet, MessageModule, DrawerModule, MenuItemComponent,
    DividerModule, TooltipModule, SettingsComponent, AvatarModule, RippleModule,
    ToastModule, MenubarModule, TranslatePipe, ScrollerModule,
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
  protected readonly settingsStore = inject(SettingsStore);

  protected readonly menuState = signal<'minimal' | 'expanded'>('minimal');

  protected readonly menuItems = computed<MenuItem[]>(() => {
    const items: MenuItem[] = [{
      id: 'files',
      routerLink: ['files'],
      label: 'label.files',
      icon: 'pi pi-folder-open'
    }];

    if (this.accountStore.me.value()?.roles.find(role => role.name === 'admin')) {
      // items.push({
      //   id: 'users',
      //   routerLink: ['users'],
      //   label: 'label.users',
      //   icon: 'pi pi-sitemap'
      // });
    }

    items.push({
      id: 'administration',
      routerLink: ['administration'],
      label: 'administration.label',
      icon: 'pi pi-database',
      items: getMasterDataItems(this.accountStore.me.value()),
    })

    return items;
  });

  protected toggleMenuState() {
    this.menuState.update(state => {
      if (state === 'minimal') {
        return 'expanded';
      }

      return 'minimal';
    });
  }


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
  ]).pipe(map(result => !!result.matches)));
}
