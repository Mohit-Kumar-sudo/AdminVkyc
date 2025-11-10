export const TEXT = 'TEXT';
export const TABLE = 'TABLE';
export const IMAGE = 'IMAGE';
export const BAR = 'BAR';
export const PIE = 'PIE';
export const CUSTOM_TABLE = 'CUSTOM_TABLE';
export const ME_TABLE = 'ME_TABLE';
export const MD_IMAGE = 'MD_IMAGE';
export const ME_LIST = 'ME_LIST';
export const CP_LIST = 'CP_LIST';
export const RM_PIE = "RM_PIE";
export const CUSTOM = "CUSTOM";
export const ME_TABLE_HEADING = "ME_TABLE_HEADING";
export const HEADING = "HEADING";
/* Common Interfaces */
export interface ReportDataElement {
    id: number,
    type: string,
    data?: any
}

export interface BarChartData {
    source: string,
    title: string,
    labelX: string,
    labelY: string,
    // Table details from which we can create Bar Chart
    columnMetaData: any,
    dataStore: any,
}

export interface PieChartData {
    source: string,
    title: string,
    calType: string,
    columns: any,
}

export interface ImageData {
    source: string,
    title: string,
    imageUrl: string,
    type: string,
}

export interface TextData {
    content: string,
}

export interface TableData {
    source: string,
    title: string,
    rows: number,
    columns: string,
    dataStore: any,
}

export interface SecondarySectionModel {
    mainSection: string;
    section?: string;
    subSection?: string;
}


// Save
export interface SecondaryDataElement {
    _id?: string;
    order_id: number;
    type: string;
    data: string;
}

export interface MetaInfoSection {
    type: string,
    data: any;
}

export interface MasterReportSecondarySection {
    main_section_id: number;
    main_section_key?: string;
    section_name?: string;
    section_pid?: string;
    section_id: string;
    content: SecondaryDataElement[];
    is_main_section_only: boolean;
    meta?: MetaInfoSection;
}

export interface MasterReportSecondarySectionData {
    _id: string;
    status: string;
    main_section_id: number;
    section_id: string;
    section_pid: string;
    section_name: string;
    content: SecondaryDataElement[];
    meta?: MetaInfoSection
}

export interface MasterReportWrapper {
    toc: MasterReportSecondarySectionData
}

export interface MasterReportSecondarySectionWrapper {
    data: MasterReportWrapper[]
}
export interface CustomTableData {
    title: string,
    data: any
}
export interface CustomData {
    title: string,
    data: any;
}