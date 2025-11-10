import { RegionCountry } from './me-models';

// Segment
export interface SegmentNodeRequest {
    _id?: string,
    id: string,
    pid: string,
    name: string,
}

export interface SegmentNodeResponse {
    data: any;
}

// Get segment info
export interface MasterReportDataSegmentMeInfo {
    segment?: SegmentNodeRequest[];
    geo_segment?: RegionCountry[];
}
export interface MasterReportDataSegment {
    _id: string,
    me: MasterReportDataSegmentMeInfo
}
export interface MasterReportDataSegmentWrapper {
    data: MasterReportDataSegment[];
}


// Grid
export interface SegmentGridRequest {
    key: string,
    value: any[],
    requestHeaders: any[],
    metric: string
}

export interface GridTextInfoRequest {
    key: string,
    text: string,
    title: string
}

export interface SegmentGridResponse {
    data: any;
}

export interface SegmentGridResponseWrapper {
    data: any[];
}


export interface SegmentGridForSegmentResponse {

}

export interface SegmentGridForRegionResponse {

}
