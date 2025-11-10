import { Injectable } from '@angular/core';
import { HttpErrorResponse, HttpHeaders, HttpClient } from '@angular/common/http';
import { APIEndPoints, ConstantKeys } from '../constants/mfr.constants';
import { map, catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LsfServiceService {

  constructor(
    private http: HttpClient
  ) { }

  stockSearchService(searchText) {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });
    return this.http
      .get<any>(`${APIEndPoints.ALPHA_VANTAGE}SYMBOL_SEARCH&keywords=${searchText}&apikey=${ConstantKeys.ALPHA_VANTAGE_KEY}`, { headers })
      .pipe(
        map(ele => ele),
        catchError(this.handleError)
      );
  }
  handleError(err: HttpErrorResponse) {
    return throwError(err);
  }

  //Leads
  async searchCompanyName(searchText) {
    return await <any>fetch(`${APIEndPoints.TEMP_LEADS_BASE_URL}search/${searchText}`, {
      method: 'get',
      headers: { 'content-type': 'application/json' }
    }).then(response => response.json())
  }

  //Filings
  searchFilings(data):any{
    return this.http
        .post(APIEndPoints.BASE_URL+'sec-search-new', data)
        .pipe(
            map(ele => {
                return ele;
            }),
            catchError(this.handleError)
        );
  }
}
