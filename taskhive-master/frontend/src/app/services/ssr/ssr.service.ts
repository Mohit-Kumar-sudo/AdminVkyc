// services/ssr/ssr.service.ts
import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class SsrService {
  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

  isBrowser(): boolean {
    return isPlatformBrowser(this.platformId);
  }

  async loadBootstrap(): Promise<any> {
    if (this.isBrowser()) {
      return await import('bootstrap');
    }
    return null;
  }

  async loadAOS(): Promise<any> {
    if (this.isBrowser()) {
      return await import('aos');
    }
    return null;
  }
}
