// API Constants
const apiBaseUrl = 'http://localhost:6969/';
// const apiBaseUrl = 'https://user.wantstats.com/';
// const apiBaseUrl = 'https://mrfrbackend.herokuapp.com/';
// const apiBaseUrl = 'http://ec2-3-20-213-233.us-east-2.compute.amazonaws.com:6969/';

export class APIEndPoints {
    static readonly AUTH_TOKEN = apiBaseUrl + 'api/v1/users/login';
    static readonly REGISTER = apiBaseUrl + 'api/v1/users/signup';
    static readonly REPORT_API = apiBaseUrl + 'api/v1/report';
    static readonly GEO_REGION_API = apiBaseUrl + 'api/v1/geo';
    static readonly VERTICAL_API = apiBaseUrl + 'api/v1/vertical';
    static readonly COMPANY_API = apiBaseUrl + 'api/v1/company';
    static readonly TOCLIST_SECTION_API = apiBaseUrl + 'api/v1/vertical/defaults';
    static readonly ME_API = apiBaseUrl + 'api/v1/me';
    static readonly ES_API = apiBaseUrl + 'api/v1';
    static readonly USERS = apiBaseUrl + 'api/v1/users/';
    static readonly ALPHA_VANTAGE = 'https://www.alphavantage.co/query?function=';
    static readonly TEMP_LEADS_BASE_URL = 'https://mrfr-leads-api.herokuapp.com/';
    static readonly BASE_URL = apiBaseUrl;
    static readonly WEBSITE_URL = apiBaseUrl + 'api/v1/website';
}

export class AuthInfoData {
    static readonly TOKEN_NAME = 'token';
    static readonly USER = 'user';
}

export class MainSectionConstants {

    static readonly MARKET_ESTIMATION = 'MARKET_ESTIMATION';
    static readonly EXECUTIVE_SUMMARY = 'EXECUTIVE_SUMMARY';
    static readonly MARKET_INTRODUCTION = 'MARKET_INTRODUCTION';
    static readonly MARKET_DYNAMICS = 'MARKET_DYNAMICS';
    static readonly MARKET_FACTOR_ANALYSIS = 'MARKET_FACTOR_ANALYSIS';
    static readonly COMPETITIVE_LANDSCAPE = 'COMPETITIVE_LANDSCAPE';
    static readonly COMPANY_PROFILES = 'COMPANY_PROFILES';
    static readonly PRICING_RAW_MAT_SCENARIO = 'PRICING_RAW_MAT_SCENARIO';
    static readonly TRADE_LANDSCAPE = 'TRADE_LANDSCAPE';
    static readonly PRODUCTION_OUTLOOK = 'PRODUCTION_OUTLOOK';
    static readonly FUTURE_SCENARIO = 'FUTURE_SCENARIO';
    static readonly BRAND_SHARE_ANALYSIS = 'BRAND_SHARE_ANALYSIS';
    static readonly PRICING_ANALYSIS = 'PRICING_ANALYSIS';
    static readonly PIPELINE_ANALYSIS = 'PIPELINE_ANALYSIS';
    static readonly REGULATORY_LANDSCAPE = 'REGULATORY_LANDSCAPE';
    static readonly MARKET_OVERVIEW = 'MARKET_OVERVIEW';
    static readonly PARENT_MARKET_ANALYSIS = 'PARENT_MARKET_ANALYSIS';
    static readonly POWER_SECTOR_OVERVIEW = 'POWER_SECTOR_OVERVIEW';
    static readonly OIL_GAS_SECTOR_OVERVIEW = 'OIL_GAS_SECTOR_OVERVIEW';
    static readonly MARKET_INSIGHTS = 'MARKET_INSIGHTS';
    static readonly MACRO_INDICATORS = 'MACRO_INDICATORS';
    static readonly IMPORT_EXPORT_TRENDS = 'IMPORT_EXPORT_TRENDS';
    static readonly INDUSTRY_INSIGHTS = 'INDUSTRY_INSIGHTS';
}

export class ConstantKeys {

    static readonly SEGMENT_GET_KEY = 'me.segment';
    static readonly GEO_REGION_GET_KEY = 'me.geo_segment';
    static readonly COMPANY_PROFILE_KEY = 'cp';

    static readonly MARKET_BY_SEGMENT = 'MARKET_BY_SEGMENT';
    static readonly MARKET_BY_REGION = 'MARKET_BY_REGION';
    static readonly CURRENT_GRID_LOAD_KEY = 'CURRENT_GRID_LOAD_KEY';
    static readonly CURRENT_SEGMENT_SELECTED = 'CURRENT_SEGMENT_SELECTED';
    static readonly CURRENT_REGIONS_SELECTED = 'CURRENT_REGIONS_SELECTED';

    static readonly REPORT_NAME = 'report_name';

    static readonly CURRENT_REPORT = 'CURRENT_REPORT';
    static readonly CURRENT_SECTION = 'CURRENT_SECTION';

    static readonly REG_CTRY_SECTION_REG_LANDSCPE_INFO = 'REG_CTRY_SECTION_REG_LANDSCPE_INFO';
    static readonly MARKET_DYN_SECTION_INFO = 'MARKET_DYN_SECTION_INFO';

    static readonly CURRENT_COMPANY_FO_SECTION_LIST = 'CURRENT_COMPANY_FO_SECTION_LIST';
    static readonly CURRENT_COMPANY_FO_SECTION = 'CURRENT_COMPANY_FO_SECTION';
    static readonly COMPANY_PROFILE_INFO = 'COMPANY_PROFILE_INFO';
    static readonly CURRENT_SELECTED_COMPANY_PROFILE_INFO = 'CURRENT_SELECTED_COMPANY_PROFILE_INFO';

    static readonly CURRENT_SELECTED_TOC_SECTION = 'CURRENT_SELECTED_TOC_SECTION';

    static readonly COMPANY_OVERVIEW_SECTION_KEY = 'co';
    static readonly KEY_DEVELOPMENT_SECTION_KEY = 'kd';
    static readonly STRATEGY_SECTION_KEY = 'strategy';
    static readonly PRODUCT_OFFERING_SECTION_KEY = 'po';
    static readonly SWOT_ANALYSIS_SECTION_KEY = 'sa';
    static readonly FINANCIAL_OVERVIEW_SECTION_KEY = 'fo';

    static readonly STORE_IN_LOCALSTORAGE = "STORE_IN_LOCAL_STORAGE";
    static readonly ALPHA_VANTAGE_KEY = 'MTR5TAL34JWY9WKL'; //premium 120 per minute
}

export class textConstants {
    static readonly MARKET_BY_SEGMENT = `<subseg_name_largest> accounted for the the largest market share in the <report_name> market, and is expected to reach USD <end_year_value> <metric> in <end_year> from USD <base_year_value> <metric> in <base_year>. <mark>However, <subseg_name_fastest> is the fastest growing market, which is expected to grow at a CAGR of <CAGR_MAX_VALUE>% during the forecast period <year_range>.`;
    static readonly MARKET_BY_REGION = "<subseg_name_largest> accounted for the largest market share in <base_year> in the <seg_name> <report_name> market, and is expected to reach USD <end_year_value> <metric> in <end_year> from USD <base_year_value> <metric> in <base_year>. <mark>However, <subseg_name_fastest> is the fastest growing market, which is expected to grow at a CAGR of <CAGR_MAX_VALUE>% during the forecast period <year_range>.";
    static readonly SEGMENT_BY_REGIONS = `<subseg_name_largest> accounted for the largest market share in <base_year>, this market is expected to reach USD <end_year_value> <metric> in <end_year> from USD <base_year_value> <metric> in <base_year>. This market is projected to grow at a CAGR of <cagr_value>% during the forecast period from <year_range>. <mark>However, <subseg_name_fastest> is the fastest growing market, which is expected to grow at a CAGR of <CAGR_MAX_VALUE>% during the forecast period <year_range>.`;
    static readonly MARKET_BY_REGION_TITLE = "<geo_name> <report_name> market by <country_seg_name> US$ <metric> (<year_range>)";
    static readonly MARKET_BY_SEGMENT_TITLE = "Global <report_name> market by <seg_name> US$ <metric> (<year_range>)";
}
