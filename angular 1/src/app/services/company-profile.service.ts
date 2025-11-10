import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { CompanyProfile, CompanyProfileWrapper, SWOTAnalysisData, ProductOfferingNode, CompanyProfileGetWrapper, FinancialOverviewSave, GetCompanyProfileDetailsWrapper } from '../models/company-profile-model';
import { APIEndPoints, ConstantKeys } from '../constants/mfr.constants';
import { throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { SecondaryDataElement } from '../models/secondary-research-models';

@Injectable({
    providedIn: 'root'
})
export class CompanyProfileService {

    constructor(private http: HttpClient) { }

    getAllCompanies() {
        const headers = new HttpHeaders({
            'Content-Type': 'application/json'
        });

        return this.http
            .get<GetCompanyProfileDetailsWrapper>(APIEndPoints.COMPANY_API, { headers })
            .pipe(
                map(ele => ele.data),
                catchError(this.handleError)
            );
    }

    addNewCompany(company: CompanyProfile) {
        const headers = new HttpHeaders({
            'Content-Type': 'application/json'
        });

        return this.http
            .post<CompanyProfileWrapper>(APIEndPoints.COMPANY_API, company, { headers })
            .pipe(
                map(ele => {
                    return ele.data;
                }),
                catchError(this.handleError)
            );
    }


    getSecondaryDetailsByKey(companyId: string, sectionKey: string) {
        const headers = new HttpHeaders({
            'Content-Type': 'application/json'
        });

        let selectKey = this.getSelectKey(sectionKey);
        return this.http
            .get<CompanyProfileGetWrapper>(`${APIEndPoints.COMPANY_API}/${companyId}?select=${selectKey}`, { headers })
            .pipe(
                map(ele => {
                    let companyProfile = ele.data[0];
                    if (companyProfile) {
                        return companyProfile[selectKey];
                    } else {
                        return [];
                    }
                }),
                catchError(this.handleError)
            );
    }

    getSelectKey(sectionKey) {
        switch (sectionKey) {
            case ConstantKeys.COMPANY_OVERVIEW_SECTION_KEY: return 'company_overview';
            case ConstantKeys.COMPANY_OVERVIEW_SECTION_KEY: return 'company_overview';
            case ConstantKeys.STRATEGY_SECTION_KEY: return 'strategy';
            case ConstantKeys.KEY_DEVELOPMENT_SECTION_KEY: return 'key_development';
            case ConstantKeys.PRODUCT_OFFERING_SECTION_KEY: return 'product_offering';
            case ConstantKeys.SWOT_ANALYSIS_SECTION_KEY: return 'swot_analysis';
            case ConstantKeys.FINANCIAL_OVERVIEW_SECTION_KEY: return 'financial_overview';
        }
    }

    saveCompanyOverview(companyId: string, data: SecondaryDataElement[]) {
        return this.saveCompanyBasicSection(companyId, ConstantKeys.COMPANY_OVERVIEW_SECTION_KEY, data);
    }
    saveCompanyStrategy(companyId: string, data: SecondaryDataElement[]) {
        return this.saveCompanyBasicSection(companyId, ConstantKeys.STRATEGY_SECTION_KEY, data);
    }
    saveCompanyKeyDevelopments(companyId: string, data: SecondaryDataElement[]) {
        return this.saveCompanyBasicSection(companyId, ConstantKeys.KEY_DEVELOPMENT_SECTION_KEY, data);
    }
    saveCompanySWOT(companyId: string, data: SWOTAnalysisData[]) {
        return this.saveCompanyBasicSection(companyId, ConstantKeys.SWOT_ANALYSIS_SECTION_KEY, data);
    }
    saveCompanyProductOffering(companyId: string, data: any) {
        return this.saveCompanyBasicSection(companyId, ConstantKeys.PRODUCT_OFFERING_SECTION_KEY, data);
    }
    saveCompanyFoSections(companyId: string, data: FinancialOverviewSave[]) {
        return this.saveCompanyBasicSection(companyId, ConstantKeys.FINANCIAL_OVERVIEW_SECTION_KEY, data);
    }

    saveCompanyBasicSection(companyId: string, sectionKey: string, data: any) {
        const headers = new HttpHeaders({
            'Content-Type': 'application/json'
        });
        return this.http
            .post<CompanyProfileWrapper>(`${APIEndPoints.COMPANY_API}/${companyId}/${sectionKey}`, data, { headers })
            .pipe(
                map(ele => {
                    return ele.data;
                }),
                catchError(this.handleError)
            );
    }



    handleError(err: HttpErrorResponse) {
        return throwError(err);
    }

    uploadCSVFile(formData){
        return this.http.post<any>(`${APIEndPoints.COMPANY_API}/csvimport`,formData)
    }

    saveSuggestedLeads(data) {
        const headers = new HttpHeaders({
            'Content-Type': 'application/json'
        });
        return this.http
            .post<CompanyProfileWrapper>(`${APIEndPoints.COMPANY_API}/lead_suggest`, data, { headers })
            .pipe(
                map(ele => {
                    return ele.data;
                }),
                catchError(this.handleError)
            );
    }

    saveSuggestedFilings(data) {
        const headers = new HttpHeaders({
            'Content-Type': 'application/json'
        });
        return this.http
            .post<CompanyProfileWrapper>(`${APIEndPoints.COMPANY_API}/filing_suggest`, data, { headers })
            .pipe(
                map(ele => {
                    return ele.data;
                }),
                catchError(this.handleError)
            );
    }

    saveSuggestedStocks(data) {
        const headers = new HttpHeaders({
            'Content-Type': 'application/json'
        });
        return this.http
            .post<CompanyProfileWrapper>(`${APIEndPoints.COMPANY_API}/interconnect`, data, { headers })
            .pipe(
                map(ele => {
                    return ele.data;
                }),
                catchError(this.handleError)
            );
    }

    getInterconnects(id, key) {
        const headers = new HttpHeaders({
            'Content-Type': 'application/json'
        });
        return this.http
            .get<any>(`${APIEndPoints.COMPANY_API}/${id}?select=${key}`, { headers })
            .pipe(
                map(ele => {
                    return ele.data
                }),
                catchError(this.handleError)
            );
    }
}