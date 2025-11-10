import { OrgGridType } from '../components/core/tree-grid/org-grid-data';

export interface SegmentNode extends OrgGridType {

}

// Region Country 
export interface Country {
    _id: string;
    id: string;
    name: string
}

export interface RegionCountry {
    _id: string;
    id: string;
    region: string;
    countries: Country[];
    countriesValues: any[];
}

export interface RegionCountryData {
    data: RegionCountry[]
}
// Region Country


/** Report Beans */
export interface VerticalData {
    _id?: string;
    name: string;
    category: string;
    toc: TocSectionData[];
}
export interface VerticalWrapper {
    data: VerticalData[]
}


export interface TocSectionData {
    _id?: string;
    section_name: string;
    main_section_id?: number;
    section_id?: string;
    section_key?: string;
    urlpattern?: string;
    is_main_section_only: boolean;
}

export interface TocSectionDataWrapper {
    _id?: string;
    name: string;
    category: string;
    toc: TocSectionData[];
}

export interface MarketEstimationMetaData {
    start_year: number;
    end_year: number;
    base_year: number;
}


export interface MasterReportDataList {
    data: MasterReportData[];
}

export interface MasterReportDataElement {
    data: MasterReportData;
}

export interface MasterReportData {
    _id?: string;
    title: string;
    vertical: string;
    category: string;
    me?: MarketEstimationMetaData;
    tocList?: TocSectionData[];
    title_prefix:string;
}
