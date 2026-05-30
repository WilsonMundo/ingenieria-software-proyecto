import {
  ApplicationConfig,
  provideBrowserGlobalErrorListeners,
  provideZoneChangeDetection,
} from '@angular/core';
import { provideRouter, withViewTransitions } from '@angular/router';
import {
  provideHttpClient,
  withFetch,
  withInterceptorsFromDi,
} from '@angular/common/http';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideNativeDateAdapter } from '@angular/material/core';

import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZoneChangeDetection({ eventCoalescing: true }),

    // Router con transiciones suaves entre páginas
    provideRouter(routes, withViewTransitions()),

    // HttpClient: Fetch API moderna + soporte para interceptores DI (ej: JWT)
    provideHttpClient(
      withFetch(),
      withInterceptorsFromDi()
    ),

    // Requerido por Angular Material (animaciones, overlays, dialogs, snackbars)
    provideAnimationsAsync(),

    // Requerido por MatDatepicker — adaptador de fechas nativo de JS
    provideNativeDateAdapter(),
  ]
};