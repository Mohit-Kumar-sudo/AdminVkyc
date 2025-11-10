import { Injectable } from '@angular/core';
import { SegmentNodeResponse, SegmentGridRequest, SegmentGridResponse, SegmentGridResponseWrapper, GridTextInfoRequest } from '../models/segment-models';
import { HttpHeaders, HttpClient, HttpErrorResponse } from '@angular/common/http';
import { APIEndPoints } from '../constants/mfr.constants';
import { map, catchError } from 'rxjs/operators';
import {Observable, throwError} from 'rxjs';
import { RegionCountry } from '../models/me-models';

@Injectable({
  providedIn: 'root'
})
export class SegmentService {

  constructor(private http: HttpClient) { }

  getDataByRegion(reportId, regionId): Observable<any> {
    return this.http.get<any>(APIEndPoints.ME_API + '/' + reportId + '/by_region/' + regionId);
  }

  getDataBySegment(reportId, segmentId): Observable<any> {
    return this.http.get<any>(APIEndPoints.ME_API + '/' + reportId + '/by_segment/' + segmentId);
  }

  saveSegmentInfo(reportId: string, data: any) {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    return this.http
      .post<SegmentNodeResponse>(`${APIEndPoints.ME_API}/${reportId}/segment`, data, { headers })
      .pipe(
        map(ele => {
          return ele.data;
        }),
        catchError(this.handleError)
      );
  }

  saveGeoInfo(reportId: string, data: RegionCountry[]) {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    return this.http
      .post<SegmentNodeResponse>(`${APIEndPoints.ME_API}/${reportId}/geo`, data, { headers })
      .pipe(
        map(ele => {
          return ele.data;
        }),
        catchError(this.handleError)
      );
  }

  saveSegmentGridInfo(reportId: string, data: SegmentGridRequest[]) {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    return this.http
      .post<SegmentGridResponse>(`${APIEndPoints.ME_API}/${reportId}/grid/data`, data, { headers })
      .pipe(
        map(ele => {
          return ele.data;
        }),
        catchError(this.handleError)
      );
  }

  getSegmentGridInfo(reportId: string, key: string) {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    return this.http
      .get<SegmentGridRequest[]>(`${APIEndPoints.ME_API}/${reportId}/grid/data`, { headers })
      .pipe(
        map(ele => ele),
        catchError(this.handleError)
      );
  }

  saveGridTextInfo(reportId: string, data: GridTextInfoRequest[]) {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    return this.http
      .post<SegmentGridResponse>(`${APIEndPoints.ME_API}/${reportId}/grid/data/text`, data, { headers })
      .pipe(
        map(ele => {
          return ele.data;
        }),
        catchError(this.handleError)
      );
  }

  getReportInfoByKey(reportId: string, key: string) {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    return this.http
      .get<any>(`${APIEndPoints.REPORT_API}/${reportId}?select=${key}`, { headers })
      .pipe(
        map(ele => ele.data[0]),
        catchError(this.handleError)
      );
  }

  getSegmentDataInfoByKey(reportId: string, id: string, key: string) {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    return this.http
      .get<SegmentGridResponseWrapper>(`${APIEndPoints.ME_API}/${reportId}/views?key=${key}&value=${id}`, { headers })
      .pipe(
        map(ele => ele.data),
        catchError(this.handleError)
      );
  }

  handleError(err: HttpErrorResponse) {
    return throwError(err);
  }

  replacedSegmentSymbols(segment){
    return segment.replace(/ /ig,'_')
    .replace(/-/ig,'_')
    .replace(/&/ig,'and')
    .split('(').join('')
    .split(')').join('')
    .split('.').join('')
    .split(',').join('')
  }
}
