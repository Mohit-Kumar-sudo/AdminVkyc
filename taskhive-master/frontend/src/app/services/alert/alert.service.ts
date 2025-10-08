// src/app/services/alert/alert.service.ts
import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

type AWNType = any; // keep simple; adjust if you want strict types

const GLOBAL_OPTIONS = {
  position: 'bottom-right' as const,
  duration: 2000,
};

@Injectable({ providedIn: 'root' })
export class AlertService {
  private notifier: AWNType | null = null;
  private loading: Promise<AWNType | null> | null = null;
  private isBrowser: boolean;

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  private loadNotifier(): Promise<AWNType | null> {
    if (!this.isBrowser) return Promise.resolve(null); // on server: no-op
    if (this.notifier) return Promise.resolve(this.notifier);
    if (this.loading) return this.loading;

    this.loading = import('awesome-notifications')
      .then((mod) => {
        const AWN = (mod as any).default ?? mod;
        this.notifier = new AWN(GLOBAL_OPTIONS);
        return this.notifier;
      })
      .catch((err) => {
        // fail gracefully in browser — log but don't crash app
        console.error('Failed to load awesome-notifications', err);
        this.loading = null;
        return null;
      });

    return this.loading;
  }

  successToast(msg: string): void {
    if (!this.isBrowser) return;
    this.loadNotifier().then((n) => n?.success(msg, GLOBAL_OPTIONS));
  }

  errorToast(msg: string): void {
    if (!this.isBrowser) return;
    this.loadNotifier().then((n) => n?.alert(msg, GLOBAL_OPTIONS));
  }

  warningToast(msg: string): void {
    if (!this.isBrowser) return;
    this.loadNotifier().then((n) => n?.warning(msg, GLOBAL_OPTIONS));
  }

  infoToast(msg: string): void {
    if (!this.isBrowser) return;
    this.loadNotifier().then((n) => n?.info(msg, GLOBAL_OPTIONS));
  }

  tipToast(msg: string): void {
    if (!this.isBrowser) return;
    this.loadNotifier().then((n) => n?.tip(msg, GLOBAL_OPTIONS));
  }

  // Keep async methods returning the underlying promise so callers can await if needed
  asyncToast(msg: string): Promise<any | null> {
    if (!this.isBrowser) return Promise.resolve(null);
    return this.loadNotifier().then((n) => (n ? n.async(Promise.resolve(msg)) : null));
  }

  asyncBlock(msg: string): Promise<any | null> {
    if (!this.isBrowser) return Promise.resolve(null);
    return this.loadNotifier().then((n) => (n ? n.asyncBlock(Promise.resolve(msg)) : null));
  }

  modal(msg: string): void {
    if (!this.isBrowser) return;
    this.loadNotifier().then((n) => n?.modal(msg));
  }
}