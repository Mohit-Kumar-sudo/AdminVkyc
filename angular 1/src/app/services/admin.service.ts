import { Injectable } from '@angular/core';
import {HttpHeaders, HttpClient, HttpErrorResponse} from '@angular/common/http';
import { APIEndPoints } from '../constants/mfr.constants';
import {Observable, throwError} from "rxjs";
import {catchError, map} from "rxjs/operators";

@Injectable({
  providedIn: 'root'
})
export class AdminService {

  constructor(private http: HttpClient) { }

  getAllUsers(key) {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });
    return this.http.get<any>(APIEndPoints.USERS + `all_users/${key}`, { headers });
  }

  getAllUsersByKeys(keys): Observable<any> {
    return this.http.get<any>(APIEndPoints.USERS + 'get_all_users?keys=' + keys);
  }

  getAllReportsByKeys(keys): Observable<any> {
    return this.http.get<any>(APIEndPoints.REPORT_API  + '/get_reports?keys=' + keys);
  }

  getFeaturedReports(): Observable<any> {
    return this.http.get<any>(APIEndPoints.WEBSITE_URL + '/get_featured_reports');
  }

  getAssignedReports(keys): Observable<any> {
    return this.http.get<any>(APIEndPoints.USERS + '/get_assigned_reports');
  }
  update_featured_reports(body: any) {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    return this.http
      .post<any>(`${APIEndPoints.WEBSITE_URL}/update_featured_reports`, body, { headers })
      .pipe(
        map(ele => {
          return ele.data;
        }),
        catchError(this.handleError)
      );
  }
  assignUserReports(userId, body: any) {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    return this.http
      .post<any>(`${APIEndPoints.USERS}/assign_reports/${userId}`, body, { headers })
      .pipe(
        map(ele => {
          return ele.data;
        }),
        catchError(this.handleError)
      );
  }

  userAccess(data) {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });
    return this.http.post<any>(APIEndPoints.USERS + `access`, data, { headers });
  }

  handleError(err: HttpErrorResponse) {
    return throwError(err);
  }
}
