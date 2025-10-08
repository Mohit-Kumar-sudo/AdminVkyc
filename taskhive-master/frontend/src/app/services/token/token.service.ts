// token.service.ts
import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';
import {jwtDecode} from 'jwt-decode';

@Injectable({
  providedIn: 'root'
})
export class TokenService {
  private decodedToken: any = null;
  private token: string | null = null;

  // Keys used in localStorage
  private TOKEN_KEY = 'Token';
  private REFRESH_KEY = 'refreshToken';
  private USER_KEY = 'user';

  constructor(
    private route: Router,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  private isBrowser(): boolean {
    return isPlatformBrowser(this.platformId);
  }

  setToken(token: string | null, refreshToken?: string | null) {
    if (!this.isBrowser()) return;
    try {
      if (token === null) {
        localStorage.removeItem(this.TOKEN_KEY);
      } else {
        localStorage.setItem(this.TOKEN_KEY, token);
      }

      if (refreshToken == null) {
        localStorage.removeItem(this.REFRESH_KEY);
      } else {
        localStorage.setItem(this.REFRESH_KEY, refreshToken);
      }

      // update in-memory
      this.token = token;
      this.decodedToken = null;
    } catch {}
  }

  getToken(): string | null {
    if (!this.isBrowser()) {
      return this.token; // might be null on server
    }
    try {
      const token = localStorage.getItem(this.TOKEN_KEY);
      this.token = token;
      return token;
    } catch {
      return null;
    }
  }

  getRefreshToken(): string | null {
    if (!this.isBrowser()) {
      return null;
    }
    try {
      return localStorage.getItem(this.REFRESH_KEY);
    } catch {
      return null;
    }
  }

  deleteToken() {
    if (this.isBrowser()) {
      try {
        localStorage.removeItem(this.TOKEN_KEY);
        localStorage.removeItem(this.REFRESH_KEY);
        localStorage.removeItem(this.USER_KEY);
      } catch {}
    }
    this.token = null;
    this.decodedToken = null;

    // Navigation should only run in browser
    if (this.isBrowser()) {
      this.route.navigate(['/login']);
    }
  }

  setUser(user: any) {
    if (!this.isBrowser()) return;
    try {
      localStorage.setItem(this.USER_KEY, JSON.stringify(user));
    } catch {}
  }

  getUser(): any | null {
    if (!this.isBrowser()) return null;
    try {
      const raw = localStorage.getItem(this.USER_KEY);
      if (!raw) return null;
      return JSON.parse(raw);
    } catch {
      return null;
    }
  }

  // decode the currently stored token and cache it
  decodeToken(): void {
    const token = this.getToken();
    if (!token) {
      this.token = null;
      this.decodedToken = null;
      return;
    }
    try {
      this.token = token;
      this.decodedToken = jwtDecode(token);
    } catch {
      this.decodedToken = null;
    }
  }

  getDecodeToken(): any | null {
    if (!this.decodedToken) {
      this.decodeToken();
    }
    return this.decodedToken;
  }

  /**
   * Returns expiry (in seconds) or null
   */
  getExpiryTime(): number | null {
    const decoded = this.getDecodeToken();
    return decoded && decoded.exp ? decoded.exp : null;
  }

  /**
   * Returns true if token is expired or will expire within `leewayMs` milliseconds.
   * Default leeway: 5 seconds.
   */
  isTokenExpired(leewayMs = 5000): boolean {
    const expiryTime = this.getExpiryTime();
    if (!expiryTime) return true; // no expiry => treat as expired (safer)
    // expiryTime is in seconds since epoch (JWT standard)
    const expiryMs = expiryTime * 1000;
    return expiryMs - Date.now() < leewayMs;
  }
}
