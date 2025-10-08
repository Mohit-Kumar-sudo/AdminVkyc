// token-interceptor.service.ts
import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpResponse,
  HttpErrorResponse,
  HTTP_INTERCEPTORS
} from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Router } from '@angular/router';
import { AlertService } from '../alert/alert.service';
import { TokenService } from '../token/token.service';
import { AuthService } from '../auth/auth.service';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class TokenInterceptorService implements HttpInterceptor {

  private isBrowser: boolean;

  constructor(
    public tokenService: TokenService,
    public router: Router,
    private as: AlertService,
    private auth: AuthService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  intercept(
    request: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    // Always read token at request time (TokenService.getToken is platform-safe)
    const token = this.tokenService.getToken();

    if (token) {
      if (!this.tokenService.isTokenExpired()) {
        // Attach token only if not expired
        request = request.clone({
          setHeaders: {
            Authorization: `Bearer ${token}`,
          },
        });
      } else {
        // Token expired:
        // - Browser: inform user, logout and navigate
        // - Server: do nothing (can't navigate or show toast)
        if (this.isBrowser) {
          try {
            this.as.warningToast('Session Expired! Please Login');
          } catch {}
          try {
            this.auth.logout();
          } catch {}
          try {
            this.router.navigate(['/login']);
          } catch {}
        }
        // continue the request without token (or you could short-circuit and throw)
        return next.handle(request);
      }
    }

    return next.handle(request).pipe(
      tap(
        (event: HttpEvent<any>) => {
          if (event instanceof HttpResponse) {
            // success response - no action required here
          }
        },
        (err: any) => {
          if (err instanceof HttpErrorResponse) {
            if (err.status === 401) {
              const msg = 'You are not authorized to perform this action';
              if (this.isBrowser) {
                try {
                  this.as.errorToast(msg);
                } catch {}
                try { this.router.navigate(['/login']); } catch {}
              }
            } else {
              if (this.isBrowser) {
                try {
                  this.as.errorToast(err.error?.error?.message || 'An error occurred');
                } catch {}
              }
            }
          }
        }
      )
    );
  }
}
