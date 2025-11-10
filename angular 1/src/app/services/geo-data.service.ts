import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { APIEndPoints } from '../constants/mfr.constants';
import { RegionCountryData, RegionCountry } from '../models/me-models';
import { map, catchError } from 'rxjs/operators';
import { Observable, throwError } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class GeoDataService {

    constructor(private http: HttpClient) { }

    getRegions(): Observable<RegionCountry[]> {
        const headers = new HttpHeaders({
            'Content-Type': 'application/json'
        });

        return this.http
            .get<RegionCountryData>(APIEndPoints.GEO_REGION_API, { headers })
            .pipe(
                map(ele => ele.data),
                catchError(this.handleError)
            );
    }

    handleError(err: HttpErrorResponse) {
        return throwError(err);
    }
}