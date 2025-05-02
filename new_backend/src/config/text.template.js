const textConstants = {
    MARKET_BY_SEGMENT: `<subseg_name_largest> accounted for the <degree_of_comparision> market share in the <report_name> market, and is expected to reach <currency_unit> <end_year_value> <metric> in <end_year> from <currency_unit> <base_year_value> <metric> in <base_year>. <mark>However, <subseg_name_fastest> is the fastest growing market, which is expected to grow at a CAGR of <CAGR_MAX_VALUE>% during the forecast period <year_range>.`,
    MARKET_BY_REGION: "<subseg_name_largest> accounted for the <degree_of_comparision> market share in <base_year> in the <seg_name> <report_name> market, and is expected to reach <currency_unit> <end_year_value> <metric> in <end_year> from <currency_unit> <base_year_value> <metric> in <base_year>. <mark>However, <subseg_name_fastest> is the fastest growing market, which is expected to grow at a CAGR of <CAGR_MAX_VALUE>% during the forecast period <year_range>.",
    SEGMENT_BY_REGIONS: `<subseg_name_largest> accounted for the <degree_of_comparision> market share in <base_year>, this market is expected to reach <currency_unit> <end_year_value> <metric> in <end_year> from <currency_unit> <base_year_value> <metric> in <base_year>. This market is projected to grow at a CAGR of <cagr_value>% during the forecast period from <year_range>. <mark>However, <subseg_name_fastest> is the fastest growing market, which is expected to grow at a CAGR of <CAGR_MAX_VALUE>% during the forecast period <year_range>.`,
    MARKET_BY_REGION_TITLE : "<geo_name> <report_name> market by <country_seg_name> US$ <metric> (<year_range>)",
    MARKET_BY_SEGMENT_TITLE : "Global <report_name> market by <seg_name> US$ <metric> (<year_range>)",
    COMMON_TEMPLATE:"<subseg_name_largest> accounted for the <degree_of_comparision> market share in the <report_name> market, and is expected to reach <currency_unit> <end_year_value> <metric> in <end_year> from <currency_unit> <base_year_value> <metric> in <base_year>. This market is projected to grow at a CAGR of <cagr_value>% during the forecast period from <year_range>."
}

// export a clone copy
export default {
    ...textConstants
}


