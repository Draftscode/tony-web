import { registerLocaleData } from '@angular/common';
import localeDe from '@angular/common/locales/de';
import localeEnGb from '@angular/common/locales/en-GB';
import localeHu from '@angular/common/locales/hu';
import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/app';

registerLocaleData(localeDe);
registerLocaleData(localeEnGb);
registerLocaleData(localeHu);

bootstrapApplication(App, appConfig)
  .catch((err) => console.error(err));
