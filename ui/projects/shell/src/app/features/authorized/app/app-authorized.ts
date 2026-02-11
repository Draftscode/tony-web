import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { NgTemplateOutlet } from '@angular/common';
import { Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { RouterModule, RouterOutlet } from '@angular/router';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { MenuItem } from 'primeng/api';
import { AutoComplete } from 'primeng/autocomplete';
import { AvatarModule } from 'primeng/avatar';
import { Breadcrumb } from 'primeng/breadcrumb';
import { ButtonModule } from 'primeng/button';
import { Card } from 'primeng/card';
import { DividerModule } from 'primeng/divider';
import { DrawerModule } from 'primeng/drawer';
import { DialogService } from 'primeng/dynamicdialog';
import { IconField } from 'primeng/iconfield';
import { InputIcon } from 'primeng/inputicon';
import { MenubarModule } from 'primeng/menubar';
import { MessageModule } from 'primeng/message';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { RippleModule } from 'primeng/ripple';
import { ScrollerModule } from 'primeng/scroller';
import { ToastModule } from 'primeng/toast';
import { TooltipModule } from 'primeng/tooltip';
import { debounceTime, lastValueFrom, map, startWith, Subject } from 'rxjs';
import * as packageJson from '../../../../../../../package.json';
import { ThemeService } from '../../../data-access/provider/theme.service';
import { AccountStore } from '../../../data-access/store/account.store';
import { BreadcrumbStore } from '../../../data-access/store/breadcrumb.store';
import { DivisionStore } from '../../../data-access/store/division.store';
import { SearchStore } from '../../../data-access/store/search.store';
import { SettingsStore } from '../../../data-access/store/settings.store';
import { GenericDialog } from '../../../dialogs/generic/generic.dialog';
import { getMasterDataItems } from '../master-data/master-data.items';
import { SettingsComponent } from '../settings/settings.component';
import { MainMenuComponent } from './main-menu/main-menu.component';
import { ProfileComponent } from './profile/profile.component';

@Component({
  selector: 'app',
  host: { class: 'w-full h-full contents' },
  imports: [
    RouterOutlet, MessageModule, DrawerModule, MainMenuComponent, InputIcon, IconField, AutoComplete,
    DividerModule, TooltipModule, SettingsComponent, AvatarModule, RippleModule, RouterModule,
    ToastModule, MenubarModule, TranslatePipe, ScrollerModule, Card, Breadcrumb,
    ButtonModule, ProgressSpinnerModule, NgTemplateOutlet],
  templateUrl: 'app-authorized.html',
  styleUrl: 'app-authorized.scss',
})
export default class App {
  private readonly translate = inject(TranslateService);
  protected readonly version = packageJson.version;
  protected readonly _themeService = inject(ThemeService);
  protected readonly accountStore = inject(AccountStore);
  private readonly breakpointObserver = inject(BreakpointObserver);
  protected readonly settingsStore = inject(SettingsStore);
  protected readonly breadcrumbStore = inject(BreadcrumbStore);
  private readonly dialogService = inject(DialogService);

  protected readonly isVerySmall = toSignal(this.breakpointObserver.observe([Breakpoints.XSmall]).pipe(map(s => s.matches)));
  protected readonly isSmall = toSignal(this.breakpointObserver.observe([Breakpoints.Small]).pipe(map(s => s.matches)));
  protected readonly isMedium = toSignal(this.breakpointObserver.observe([Breakpoints.Medium]).pipe(map(s => s.matches)));
  protected readonly avatarLabel = computed(() => this.accountStore.me.value()?.username.slice(0, 1).toUpperCase() ?? '');

  private readonly searchStore = inject(SearchStore);
  protected readonly query$ = new Subject<string | null>();
  protected readonly query = toSignal(this.query$.pipe(debounceTime(500), startWith(undefined)));


  protected readonly searchItems = computed(() => this.searchStore.searchResult.hasValue() ? this.searchStore.searchResult.value().map(s => ({
    ...s,
    items: s.items.map((i) => ({
      ...i,
      kind: s.label,
    }))
  })) : [])

  protected readonly menuItems = computed<MenuItem[]>(() => {
    const items: MenuItem[] = [{
      key: 'files',
      routerLink: ['files'],
      label: 'label.files',
      icon: 'pi pi-folder-open'
    }];

    if (this.accountStore.me.value()?.roles.find(role => role.name === 'admin')) {

      items.push({
        key: 'administration',
        routerLink: ['administration'],
        state: {
          expanded: true,
        },
        label: 'administration.label',
        icon: 'pi pi-database',
        items: getMasterDataItems(this.accountStore.me.value()),
      });
    }

    return items;
  });

  constructor() {
    this.searchStore.connectQuery(this.query);
  }

  private readonly divisionStore = inject(DivisionStore);
  protected async selectItem(item: { kind: string; id: string; name: string; value: string }) {
    switch (item.kind) {

      case 'info': {
        const ref = this.dialogService.open(GenericDialog, {
          data: {
            contents: item.value
          },
          modal: true,
          closable: true,
          width: '420px',
          maximizable: true,
          header: item.name,
        });
        if (!ref) { return; }
        const result = await lastValueFrom(ref.onClose);
        if (result?.type === 'manually') {
          await this.divisionStore.updateDivision(item.id, { info: result.data });
        }
      }
    }
  }

  protected openProfile() {
    const me = this.accountStore.me.value();
    if (!me) { return; }
    const name = me.firstname ? `${me.firstname} ${me.lastname ?? ''}` : me.username;
    this.dialogService.open(ProfileComponent, {
      header: this.translate.instant('utils.hello', { value: name }),
      modal: true,
      closable: true,
      maximizable: true,
    });
  }

}
