import { ApplicationConfig, ErrorHandler, provideBrowserGlobalErrorListeners, provideZonelessChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';

import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { provideAnimations, } from '@angular/platform-browser/animations';
import { provideTranslateLoader, provideTranslateService } from "@ngx-translate/core";
import { ConfirmationService, MessageService } from 'primeng/api';
import { providePrimeNG } from 'primeng/config';
import { DialogService } from 'primeng/dynamicdialog';
import { routes } from './app.routes';
import { GlobalErrorHandler } from './data-access/error.handler';
import { JsonFileLoader } from './data-access/translate.loader';
import { authInterceptor } from './interceptors/auth.interceptor';
import { tonyMThemePreset } from './theme';
import { provideFirebaseApp, initializeApp } from '@angular/fire/app';
import { provideMessaging, getMessaging } from '@angular/fire/messaging';
import { environment } from '../environments/environment';

export const appConfig: ApplicationConfig = {
  providers: [
    { provide: ErrorHandler, useClass: GlobalErrorHandler },
    provideBrowserGlobalErrorListeners(),
    provideZonelessChangeDetection(),
    provideRouter(routes),
    provideAnimations(),
    provideTranslateService({
      loader: provideTranslateLoader(JsonFileLoader),
    }),
    MessageService,
    DialogService,
    ConfirmationService,
    provideZonelessChangeDetection(),
    provideRouter(routes),
    provideFirebaseApp(() => initializeApp(environment.firebaseConfig)),
    provideMessaging(() => getMessaging()),
    provideHttpClient(
      withFetch(),
      withInterceptors([authInterceptor]),
    ),
    providePrimeNG({
      theme: {
        preset: tonyMThemePreset,
        options: {
          darkModeSelector: '.p-dark',
          cssLayer: {
            name: 'primeng',
            order: 'theme, base, primeng'
          },
        }
      }
    })
  ]
};
