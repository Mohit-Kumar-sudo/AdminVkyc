import { SecondaryDataElement, ReportDataElement } from './secondary-research-models';

export interface Swot {
    index_id: Number,
    name: string
}

export interface SWOTAnalysisData {
    key: string;
    value: Swot[];
}

export interface ProductOfferingNode {
    _id?: string,
    id: string,
    pid: string,
    name: string,
}

export interface FinancialOverview {
    key: string;
    name: string;
    brkup_no: number;
    from_year: Date;
    to_year: Date;
    currency: string;
    metric: string;
    content?: any;
}

export interface FinancialOverviewSave {
    key: string;
    name: string;
    brkup_no: number;
    from_year: number;
    to_year: number;
    currency: string;
    metric: string;
    content?: any;
}


export interface CompanyProfile {
    _id?: string;
    vertical: string;
    company_name: string;
    company_overview?: SecondaryDataElement[];
    key_development?: SecondaryDataElement[];
    strategy?: SecondaryDataElement[];
    swot_analysis?: SWOTAnalysisData[];
    product_offering?: ProductOfferingNode[];
    financial_overview?: FinancialOverview[];
}

export interface CompanyProfileWrapper {
    data: CompanyProfile;
}

export interface CompanyProfileGetWrapper {
    data: CompanyProfile[];
}


export interface GetCompanyProfileDetails {
    _id?: string;
    name: string;
}

export interface GetCompanyProfileDetailsWrapper {
    data: GetCompanyProfileDetails[];
}
