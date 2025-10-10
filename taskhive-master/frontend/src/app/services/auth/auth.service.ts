import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { AlertService } from '../alert/alert.service';
import { environment } from '../../../environments/environment';
import { TokenService } from '../token/token.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(
    private http: HttpClient,
    private router: Router,
    private as: AlertService,
    private ts: TokenService
  ) { }

  // register(data:any) {
  //   return this.http.post(`${environment.url}/auth/register`, data);
  // }

  login(data: any) {
    console.log('Backend URL:', environment.url);  // Add this line
    return this.http.post(`${environment.url}/auth/login`, data);
  }

  // Password reset method - resets password with new password
  resetPassword(data: { newPassword: string; confirmPassword: string; token?: string }) {
    console.log('Reset Password URL:', `${environment.url}/auth/reset-password`);
    return this.http.post(`${environment.url}/auth/reset-password`, data);
  }

  // Optional: Method to request password reset (sends email with reset link)
  requestPasswordReset(email: string) {
    console.log('Request Reset URL:', `${environment.url}/auth/forgot-password`);
    return this.http.post(`${environment.url}/auth/forgot-password`, { email });
  }

  // Optional: Method to change password for logged-in users
  changePassword(data: { currentPassword: string; newPassword: string; confirmPassword: string }) {
    console.log('Change Password URL:', `${environment.url}/auth/change-password`);
    return this.http.post(`${environment.url}/auth/change-password`, data);
  }

  isLoggedIn(): boolean {
    if (this.ts.getToken()) {
      return true;
    } else {
      return false;
    }
  }

  getCurrentUser() {
    return JSON.parse(localStorage.getItem('user') || '{}');
  }

  logout() {
    this.as.infoToast('You are logged out.');
    this.cleanUserData();
    this.router.navigate(['/login'])
    // }
    // );
  }

  cleanUserData() {
    localStorage.removeItem('user');
    localStorage.removeItem('Token');
    localStorage.removeItem('refreshToken');
    this.router.navigate(['/']);
  }
}