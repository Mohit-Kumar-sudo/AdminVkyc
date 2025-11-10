import {Observable} from 'rxjs';
import {tap} from 'rxjs/operators';
import {Injectable} from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse
} from '@angular/common/http';
import {Router} from '@angular/router';
import {AuthService} from '../auth.service';

@Injectable()
export class TokenInterceptorService implements HttpInterceptor {
  constructor(public router: Router,
              private authService: AuthService) {
  }

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Checking whether user has logged in or not
    const loggedInToken = this.authService.getToken();
    // if (loggedInToken == null) {
    //   return next.handle(request.clone());
    // }
    request = request.clone({
      setHeaders: {
        Authorization: `JWT ` + loggedInToken
      }
    });
    return next.handle(request).pipe(
      tap((event: HttpEvent<any>) => {
        },
        (err: any) => {
          if (err instanceof HttpErrorResponse) {
            if (err.status === 401) {
              this.authService.logout();
            }
          }
        }
      )
    );
  }
}
