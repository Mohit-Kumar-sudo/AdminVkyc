import { Injectable, EventEmitter } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { UserToken } from '../models/auth';
import { APIEndPoints, AuthInfoData } from '../constants/mfr.constants';
import { LocalStorageService } from './localsotrage.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  isAdminLogin = new EventEmitter();
  constructor(private http: HttpClient, private router: Router, private localStorageService: LocalStorageService) { }
  isLogin = new EventEmitter()
  login(userCreds: UserToken): Observable<UserToken> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });
    return this.http.post<UserToken>(APIEndPoints.AUTH_TOKEN, userCreds, { headers });
  }

  setSession(userData) {
    this.localStorageService.set(AuthInfoData.TOKEN_NAME, userData.data.token.split(' ')[1]);
    this.localStorageService.set(AuthInfoData.USER, userData.data);
    this.router.navigate(['']);
  }

  logout(): void {
    this.localStorageService.removeAll();
    // this.localStorageService.remove(AuthInfoData.TOKEN_NAME);
    // this.localStorageService.remove(AuthInfoData.USER);
    this.router.navigate(['login']);
  }

  getToken() {
    return this.localStorageService.get(AuthInfoData.TOKEN_NAME);
  }

  isAuthenticated(): boolean {
    const tokenValue = !!this.getToken();
    // if (!token) {
    //   tokenValue = false;
    //   this.isLoggedIn(false)
    //   return false;
    // }
    this.isLoggedIn(tokenValue);
    return tokenValue;
  }

  register(userData) {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });
    return this.http.post(APIEndPoints.REGISTER, userData, { headers });
  }

  sendVerifyEmail(userData) {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });
    return this.http.post(APIEndPoints.USERS + 'verify', userData, { headers });
  }

  getVerifyEmail(id) {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });
    return this.http.get(APIEndPoints.USERS + `verify/${id}`, { headers });
  }

  confrimEmail(id) {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });
    return this.http.post(APIEndPoints.USERS + `verify/${id}`, { headers });
  }
  isLoggedIn(data) {
    this.isLogin.emit(data);
  }

  isAdmin() {
    const user = this.localStorageService.get(AuthInfoData.USER);
    const returnValue = user.email === 'mrfradmin@gmail.com';
    this.isAdminLoggedIn(returnValue);
    return returnValue;
  }

  isAdminLoggedIn(data) {
    this.isAdminLogin.emit(data)
  }
}
