import { Injectable } from '@angular/core';
import { TocSectionData, TocSectionDataWrapper, VerticalWrapper, VerticalData, MasterReportDataList } from '../models/me-models';
import { MenuMetaData } from '../models/section-metadata';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { APIEndPoints } from '../constants/mfr.constants';
import { map, catchError } from 'rxjs/operators';
import { Observable, throwError } from 'rxjs';
import { AddNewModule } from '../components/master-report/report-global-info/report-global-info.component';

@Injectable({
  providedIn: 'root'
})
export class ReportMetadataService {

  constructor(private http: HttpClient) { }

  reportSectionList: TocSectionData[] = [
    /* {
      section_id: 1,
      section_name: 'Market Estimation',
      section_key: 'MARKET_ESTIMATION',
      urlpattern: 'market-estimation',
      is_main_section_only: false,
    },
    {
      section_id: 2,
      section_name: 'Executive summary',
      section_key: 'EXECUTIVE_SUMMARY',
      urlpattern: 'executive-summary',
      is_main_section_only: true,
    },
    {
      section_id: 3,
      section_name: 'Market introduction',
      section_key: 'MARKET_INTRODUCTION',
      urlpattern: 'market-introduction',
      is_main_section_only: false,
    },
    {
      section_id: 4,
      section_name: 'Market dynamics',
      section_key: 'MARKET_DYNAMICS',
      urlpattern: 'market-dynamics',
      is_main_section_only: false,
    },
    {
      section_id: 5,
      section_name: 'Market factor analysis',
      section_key: 'MARKET_FACTOR_ANALYSIS',
      urlpattern: 'market-factor-analysis',
      is_main_section_only: false,
    },
    {
      section_id: 6,
      section_name: 'Competitive landscape',
      section_key: 'COMPETITIVE_LANDSCAPE',
      urlpattern: 'competitive-landscape',
      is_main_section_only: false,
    },
    {
      section_id: 7,
      section_name: 'Company profiles',
      section_key: 'COMPANY_PROFILES',
      urlpattern: 'company-profile',
      is_main_section_only: false,
    },
    {
      section_id: 8,
      section_name: 'Pricing and Raw material scenario',
      section_key: 'PRICING_RAW_MAT_SCENARIO',
      urlpattern: 'pricing-raw-material',
      is_main_section_only: false,
    },
    {
      section_id: 9,
      section_name: 'Trade Landscape',
      section_key: 'TRADE_LANDSCAPE',
      urlpattern: 'trade-landscape',
      is_main_section_only: true
    },
    {
      section_id: 10,
      section_name: 'Production Outlook',
      section_key: 'PRODUCTION_OUTLOOK',
      urlpattern: 'production-outlook',
      is_main_section_only: false,
    },
    {
      section_id: 11,
      section_name: 'Future Scenario',
      section_key: 'FUTURE_SCENARIO',
      urlpattern: 'future-scenario',
      is_main_section_only: false,
    },
    {
      section_id: 12,
      section_name: 'Brand Share Analysis',
      section_key: 'BRAND_SHARE_ANALYSIS',
      urlpattern: 'brand-share-analysis',
      is_main_section_only: false,
    },
    {
      section_id: 13,
      section_name: 'Pricing Scenario',
      section_key: 'PRICING_ANALYSIS',
      urlpattern: 'pricing-analysis',
      is_main_section_only: false,
    },
    {
      section_id: 14,
      section_name: 'Pipe line analysis',
      section_key: 'PIPELINE_ANALYSIS',
      urlpattern: 'pipeline-analysis',
      is_main_section_only: false,
    },
    {
      section_id: 15,
      section_name: 'Regulatory Landscape',
      section_key: 'REGULATORY_LANDSCAPE',
      urlpattern: 'regulatory-landscape',
      is_main_section_only: true
    },
    {
      section_id: 16,
      section_name: 'Market Overview',
      section_key: 'MARKET_OVERVIEW',
      urlpattern: 'market-overview',
      is_main_section_only: false,
    },
    {
      section_id: 17,
      section_name: 'Parent Market Analysis',
      section_key: 'PARENT_MARKET_ANALYSIS',
      urlpattern: 'parent-market-analysis',
      is_main_section_only: false,
    },
    {
      section_id: 18,
      section_name: 'Power Sector Overview',
      section_key: 'POWER_SECTOR_OVERVIEW',
      urlpattern: 'power-sector-overview',
      is_main_section_only: false,
    },
    {
      section_id: 19,
      section_name: 'Oil & Gas sector Overview ',
      section_key: 'OIL_GAS_SECTOR_OVERVIEW',
      urlpattern: 'oil-gas-overview',
      is_main_section_only: false,
    },
    {
      section_id: 20,
      section_name: 'Market Insights',
      section_key: 'MARKET_INSIGHTS',
      urlpattern: 'market-insights',
      is_main_section_only: false,
    },
    {
      section_id: 21,
      section_name: 'Macro Indicators',
      section_key: 'MACRO_INDICATORS',
      urlpattern: 'macro-indicators',
      is_main_section_only: true
    },
    {
      section_id: 22,
      section_name: 'Import/Export trends',
      section_key: 'IMPORT_EXPORT_TRENDS',
      urlpattern: 'import-export-trends',
      is_main_section_only: true
    },
    {
      section_id: 23,
      section_name: 'Industry Insights',
      section_key: 'INDUSTRY_INSIGHTS',
      urlpattern: 'industry-insights',
      is_main_section_only: false,
    }, */
  ]


  getTocSectionListByReportId(reportId: string) {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    return this.http
      .get<MasterReportDataList>(`${APIEndPoints.REPORT_API}/${reportId}?select=tocList`, { headers })
      .pipe(
        map(ele => ele.data[0].tocList),
        catchError(this.handleError)
      );
  }

  addNewCustomModule(reportId: string, newSection: AddNewModule) {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });
    return this.http
      .post<any>(`${APIEndPoints.REPORT_API}/${reportId}/module`, newSection, { headers })
      .pipe(
        catchError(this.handleError)
      );
  }


  getTocSectionList(): Observable<TocSectionDataWrapper[]> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    return this.http
      .get<any>(APIEndPoints.TOCLIST_SECTION_API, { headers })
      .pipe(map(ele => ele.data));
  }

  getVerticalList(): Observable<VerticalData[]> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    return this.http
      .get<VerticalWrapper>(APIEndPoints.VERTICAL_API, { headers })
      .pipe(map(ele => ele.data));
  }

  getMainSectionByKey(key: string): TocSectionData {
    // call by api
    return this.reportSectionList.filter(ele => ele.section_key === key)[0];
  }

  getMainSectionById(id: number): TocSectionData {
    // call by api
    return this.reportSectionList.filter(ele => ele.main_section_id === id)[0];
  }

  setReportSectionList(tocList: TocSectionData[]): void {
    tocList.map((ele) => { 
      ele.main_section_id = parseInt(ele.section_id);
      ele.section_id = ele.section_id;
    })
    this.reportSectionList = tocList;
  }

  handleError(err: HttpErrorResponse) {
    return throwError(err);
  }
}
