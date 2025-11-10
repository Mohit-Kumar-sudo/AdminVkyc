import { Injectable } from '@angular/core';
import { MasterReportData, MasterReportDataList, MasterReportDataElement, TocSectionData } from '../models/me-models';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { APIEndPoints, ConstantKeys } from '../constants/mfr.constants';
import { Observable, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import {
  MasterReportSecondarySection,
  MasterReportSecondarySectionWrapper,
  MasterReportSecondarySectionData
} from '../models/secondary-research-models';

@Injectable({
  providedIn: 'root'
})
export class ReportService {

  constructor(private http: HttpClient) {
  }

  public getById(id: string): Observable<MasterReportData> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    return this.http
      .get<MasterReportDataElement>(`${APIEndPoints.REPORT_API}/${id}`, { headers })
      .pipe(
        map(ele => ele.data[0]),
        catchError(this.handleError)
      );
  }

  public getAll(): Observable<MasterReportData[]> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    return this.http
      .get<MasterReportDataList>(APIEndPoints.REPORT_API, { headers })
      .pipe(
        map(ele => ele.data),
        catchError(this.handleError)
      );
  }

  getSearchReportsByName(reportText): Observable<any> {
    return this.http.get<any>(APIEndPoints.REPORT_API + '?select=title&title=' + reportText);
  }
  
  searchReportByName(reportText): Observable<any> {
    return this.http.get<any>(APIEndPoints.REPORT_API + '/search_report_by_name?q=' + reportText);
  }
  
  getReportById(id, keys): Observable<any> {
    return this.http.get<any>(APIEndPoints.REPORT_API + '/get_report_by_id/' + id + '?select=' + keys);
  }

  getReportCompanyDetailsByKeys(reportId, companyId, key): Observable<any> {
    return this.http.get<any>(APIEndPoints.REPORT_API + '/' + reportId + '/report_company_details?cid=' + companyId + '&key=' + key);
  }

  getTocContentByKey(reportId, key): Observable<any[]> {
    return this.http.get<any>(APIEndPoints.ES_API + '/' + reportId + '/toc');
  }

  getTocByMainSectionId(reportId, mainSectionId): Observable<any> {
    return this.http.get<any>(APIEndPoints.ES_API + '/' + reportId + '/toc_by_msid?msid='+mainSectionId);
  }

  getAllTocContentByReportId(reportId): Observable<any[]> {
    return this.http.get<any>(APIEndPoints.ES_API + '/' + reportId + '/toc/all');
  }

  getReportMarketEstimation(report): Observable<any[]> {
    return this.http.get<any>(APIEndPoints.REPORT_API + '/' + report._id + '?select=me.geo_segment');
  }

  getReportCompanyProfiles(report): Observable<any> {
    return this.http.get<any>(APIEndPoints.REPORT_API + '/' + report._id + '?select=cp');
  }

  getExecutiveSummaryDetail(reportId, sectionId, mainSectionId): Observable<any[]> {
    const url = APIEndPoints.ES_API + '/' + reportId + '/toc?msid=' + mainSectionId + '&sid=' + sectionId;
    return this.http.get<any>(url);
  }

  getReportDetails(reportId): Observable<any[]> {
    return this.http.get<any>(APIEndPoints.REPORT_API + '/' + reportId + '?select=me.segment');
  }

  public createBasicReport(data: MasterReportData): Observable<MasterReportData> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    return this.http
      .post<MasterReportDataElement>(APIEndPoints.REPORT_API, data, { headers })
      .pipe(
        map(ele => {
          return ele.data;
        }),
        catchError(this.handleError)
      );
  }

  getFullReviewDetails(reportId): Observable<any[]> {
    return this.http.get<any>(`${APIEndPoints.ES_API}/${reportId}/toc`);
  }

  public saveTocInfoByReportSection(report: MasterReportData, tocModuleData: MasterReportSecondarySection): Observable<Boolean> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    let currentSection = window.localStorage.getItem(ConstantKeys.CURRENT_SECTION) || "{}";
    currentSection = JSON.parse(currentSection) || {};

    return this.http
      .post(`${APIEndPoints.ES_API}/${report._id}/toc?msid=${currentSection['main_section_id']}&sid=${currentSection['section_id']}&spid=${currentSection['section_pid']}&sectionKey=${currentSection['section_key']}`, [tocModuleData], { headers: headers })
      .pipe(
        map(response => response ? true : false),
        catchError(this.handleError)
      );
  }

  public saveReportModuleSequence(reportId, data): Observable<Boolean> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });
    return this.http
      .post (`${APIEndPoints.REPORT_API}/${reportId}/module_sequence`, data, { headers: headers })
      .pipe(
        map(response => response ? true : false),
        catchError(this.handleError)
      );
  }

  public saveTocCustomInfoByReportSection(report, tocModuleData, currentSection): Observable<Boolean> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    return this.http
      .post(`${APIEndPoints.ES_API}/${report._id}/toc?msid=${currentSection['main_section_id']}&sid=${currentSection['section_id']}&spid=${currentSection['section_pid']}&sectionKey=${currentSection['section_key']}`, [tocModuleData], { headers: headers })
      .pipe(
        map(response => !!response),
        catchError(this.handleError)
      );
  }



  public saveTocInfoByReportSectionArr(report: MasterReportData, tocModuleData: MasterReportSecondarySection[]): Observable<Boolean> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    let currentSection = window.localStorage.getItem(ConstantKeys.CURRENT_SECTION) || "{}";
    currentSection = JSON.parse(currentSection) || {};

    return this.http
      .post(`${APIEndPoints.ES_API}/${report._id}/toc?msid=${currentSection['main_section_id']}&sid=${currentSection['section_id']}&spid=${currentSection['section_pid']}&sectionKey=${currentSection['section_key']}`, tocModuleData, { headers: headers })
      .pipe(
        map(response => response ? true : false),
        catchError(this.handleError)
      );
  }

  public saveAndReplaceTocInfoByReportSectionArr(report: MasterReportData, tocModuleData: MasterReportSecondarySection[], currentSection): Observable<Boolean> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });
    return this.http
      .post(`${APIEndPoints.ES_API}/${report._id}/toc/replace?msid=${currentSection['main_section_id']}&sid=${currentSection['section_id']}&spid=${currentSection['section_pid']}&sectionKey=${currentSection['section_key']}`, tocModuleData, { headers: headers })
      .pipe(
        map(response => response ? true : false),
        catchError(this.handleError)
      );
  }

  public getTocDetails(reportId, sectionId, mainSectionId): Observable<MasterReportSecondarySectionData> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    // @ts-ignore
    return this.http
      .get<MasterReportSecondarySectionWrapper>(`${APIEndPoints.ES_API}/${reportId}/toc?msid=${mainSectionId}&sid=${sectionId}`, { headers })
      .pipe(
        map(ele => ele.data[0] ? ele.data[0].toc : []),
        catchError(this.handleError)
      );

  }

  public getContentParentDetails(reportId, mainSectionId, parentSectionId): Observable<MasterReportSecondarySectionData[]> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    let apiStr = `${APIEndPoints.ES_API}/${reportId}/content/parent?msid=${mainSectionId}`;
    if (parentSectionId) {
      apiStr = `${apiStr}&spid=${parentSectionId}`;
    }

    // @ts-ignore
    return this.http
      .get<MasterReportSecondarySectionWrapper>(apiStr, { headers })
      .pipe(
        map(ele => ele.data[0] ? ele.data[0].toc : []),
        catchError(this.handleError)
      );

  }

  addReportCompanyDetails(reportId: string, company: any, cId, key) {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    return this.http
      .post<MasterReportDataElement>(`${APIEndPoints.REPORT_API}/${reportId}/company/` + key + `?cid=` + cId, company, { headers })
      .pipe(
        map(ele => {
          return ele.data;
        }),
        catchError(this.handleError)
      );
  }

  addNewCompanyToReport(reportId: string, company: any) {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    return this.http
      .post<any>(`${APIEndPoints.REPORT_API}/${reportId}/new_company`, company, { headers })
      .pipe(
        map(ele => {
          return ele.data;
        }),
        catchError(this.handleError)
      );
  }

  deleteCompanyFromReport(reportId: string, company: any) {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    return this.http
      .post<any>(`${APIEndPoints.REPORT_API}/${reportId}/delete_company`, company, { headers })
      .pipe(
        map(ele => {
          return ele.data;
        }),
        catchError(this.handleError)
      );
  }

  public getFilteredReports(domain) {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    // @ts-ignore
    return this.http
      // .get<any>(`${APIEndPoints.REPORT_API}/vertical/${domain}`, { headers })
      .get<any>(`http://localhost:6969/api/v1/report/vertical/${domain}`, { headers })
      .pipe(
        map(ele => ele.data[0] ? ele.data[0].toc : []),
        catchError(this.handleError)
      );

  }
  handleError(err: HttpErrorResponse) {
    return throwError(err);
  }
}
