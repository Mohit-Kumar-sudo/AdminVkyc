/// <reference types="@angular/localize" />

import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { AppModule } from './app/app.module';

// Function to check if running in browser
function isBrowser(): boolean {
  return typeof window !== 'undefined' && typeof document !== 'undefined';
}

async function bootstrapApp() {
  try {
    await platformBrowserDynamic().bootstrapModule(AppModule, {
      ngZoneEventCoalescing: true
    });

    console.log('Angular app bootstrapped successfully');
    
  } catch (err) {
    console.error('App bootstrap failed:', err);
  }
}

// Only bootstrap if we're in a browser environment
if (isBrowser()) {
  bootstrapApp();
}