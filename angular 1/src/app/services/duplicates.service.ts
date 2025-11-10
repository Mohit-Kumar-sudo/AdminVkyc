import { HttpClient, HttpHeaders } from '@angular/common/http';
import { HttpErrorResponse } from '@angular/common/http/src/response';
import { Injectable } from '@angular/core';
import { throwError } from 'rxjs/internal/observable/throwError';
import { catchError } from 'rxjs/internal/operators/catchError';
import { map } from 'rxjs/internal/operators/map';
import { APIEndPoints } from '../constants/mfr.constants';

@Injectable({
  providedIn: 'root'
})
export class DuplicatesService {

  constructor(private http: HttpClient) { }

  getAllDuplicateCompanies() {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    return this.http
      .get<any>(APIEndPoints.ES_API + "/duplicate_cp", { headers })
      .pipe(
        map(ele => ele.data),
        catchError(this.handleError)
      );
  }

  updateDuplicateCp(object,id){
    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    return this.http
      .post<any>(APIEndPoints.ES_API + "/duplicate_cp/"+id, object,{ headers })
      .pipe(
        map(ele => ele.data),
        catchError(this.handleError)
      );
  }
  handleError(err: HttpErrorResponse) {
    return throwError(err);
  }
}
