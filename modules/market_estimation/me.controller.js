import HTTPStatus from 'http-status';
import utilities from '../../utilities/utils';
import * as _ from 'lodash';
import dataConstants from '../../config/dataConstants';
import textConstants from '../../config/text.template';

const meService = require('./me.service');
const reportModel = require('../reports/report.model')

let dataList = [];

export async function addSegments(req, res) {
    try {
        const reportId = req.params['rid'];
        const segmentData = req.body;

        const meData = await meService.addSegments(segmentData, reportId) || {};
        if (!utilities.isEmpty(meData.errors)) {
            const errObj = meData.errors;
            // const errObj = utilities.getErrorDetails(report.errors);
            utilities.sendErrorResponse(HTTPStatus.BAD_REQUEST, true, errObj, res);
        } else {
            utilities.sendResponse(HTTPStatus.OK, meData, res);
        }

    } catch (er) {
        utilities.sendErrorResponse(HTTPStatus.INTERNAL_SERVER_ERROR, true, er, res);
    }
}

export async function addMEData(req, res) {
    try {
        const reportId = req.params.rid;
        const meGridData = req.body;

        const meUpdatedData = await meService.addMEData(meGridData, reportId) || {};
        if (!utilities.isEmpty(meUpdatedData.errors)) {
            const errObj = meUpdatedData.errors;
            // const errObj = utilities.getErrorDetails(report.errors);
            utilities.sendErrorResponse(HTTPStatus.BAD_REQUEST, true, errObj, res);
        } else {
            utilities.sendResponse(HTTPStatus.OK, meUpdatedData, res);
        }

    } catch (er) {
        utilities.sendErrorResponse(HTTPStatus.INTERNAL_SERVER_ERROR, true, er, res);
    }
}

export async function getMEData(req, res) {
    try {
        const requestDetails = {};

        requestDetails.reportId = req.params.rid;
        // whether to retrieve volume / value / avg price ..
        // If nothing specified, will fallback to report set dataMetric in backend
        requestDetails.metric = req.query.metric || null;

        // keys=segment,region,year&values=app:-1:-1,type:north_america:2018,app:parent
        const keysArr = req.query.keys && req.query.keys.split(',');
        const valsArr = req.query.recs && req.query.recs.split(',');
        requestDetails.kvStore = utilities.formKeyValueMapFromReqKeyVal(keysArr, valsArr);


        const meData = await meService.getMEData(requestDetails) || {};
        if (!utilities.isEmpty(meData.errors)) {
            const errObj = meData.errors;
            // const errObj = utilities.getErrorDetails(report.errors);
            utilities.sendErrorResponse(HTTPStatus.BAD_REQUEST, true, errObj, res);
        } else {
            utilities.sendResponse(HTTPStatus.OK, meData, res);
        }

    } catch (er) {
        utilities.sendErrorResponse(HTTPStatus.INTERNAL_SERVER_ERROR, true, er, res);
    }
}

export async function addMEGeoData(req, res) {
    try {
        const reportId = req.params.rid;
        const geoData = req.body;

        const meUpdatedData = await meService.addMEGeoData(reportId, geoData) || {};
        if (!utilities.isEmpty(meUpdatedData.errors)) {
            const errObj = meUpdatedData.errors;
            // const errObj = utilities.getErrorDetails(report.errors);
            utilities.sendErrorResponse(HTTPStatus.BAD_REQUEST, true, errObj, res);
        } else {
            utilities.sendResponse(HTTPStatus.OK, meUpdatedData, res);
        }

    } catch (er) {
        utilities.sendErrorResponse(HTTPStatus.INTERNAL_SERVER_ERROR, true, er, res);
    }
}

export async function getBySegment(req, res) {
  try {
    dataList = [];
    const reportId = req.params.rid;
    const segmentId = req.params.segment_id;
    const currentGridBy = 'MARKET_BY_SEGMENT';
    const reportData = await reportModel.getReportByKeys(reportId, 'title me.geo_segment me.start_year me.end_year me.base_year me.bifurcationLevel me.segment me.data');
    let data = getAndUpdateSegmentNames(reportData[0]);
    const segment = _.find(data.me.segment, ['id', segmentId]);
    let apiKey = `${(`${_.toLower(segment.name)}`).split(' ').join('_')  }_parent_value`;
    let result = _.find(data.me.data, ['key', apiKey]);
    if (result) {
      result.title = `${segment.name.toUpperCase()} BY SUB-SEGMENTS`;
      getTextForViews(result, currentGridBy, data.me, data.title)
      dataList.push(result);
    }
    const segs = _.filter(data.me.segment, ['pid', segmentId]);
    segs.forEach(item => {
      const name = item.name.split('.').join('_');
      const apiRegionKey = `geography_${_.toLower(name).split(' ').join('_').split('-').join('_').split('(').join('').split(')').join('')  }_parent_value`;
      console.log('apiRegionKey', apiRegionKey)
      result = _.find(data.me.data, ['key', apiRegionKey]);
      if (result) {
        result.title = `${item.name.toUpperCase()  } BY REGIONS`;
        getTextForViews(result, currentGridBy, data.me, data.title);
        dataList.push(result);
      }
    });
    segs.forEach(item => {
      const lv2segs = _.filter(data.me.segment, ['pid', item.id]);
      // const parentApiKey = `${(`${segment.name.toLowerCase()  }_${  _.toLower(item.name)}`).split(' ').join('_')  }_value`;
      // result = _.find(data.me.data, ['key', parentApiKey]);
      // if (result) {
      //   result.title = `${item.name.toUpperCase()  } BY SUB-SEGMENTS`;
      //   getTextForViews(result, currentGridBy, data.me, data.title)
      //   dataList.push(result);
      // }
      apiKey = `${(`${segment.name  }_${  _.toLower(item.name)}`).split(' ').join('_')  }_value`;
      result = _.find(data.me.data, ['key', apiKey]);
      if (result) {
        result.title = `${item.name.toUpperCase()  } BY SUB-SEGMENTS`;
        getTextForViews(result, currentGridBy, data.me, data.title)
        dataList.push(result);
      }
      lv2segs.forEach(lv2segsItem => {
        const name = lv2segsItem.name.split('.').join('_');
        const apiRegionKey = `geography_${_.toLower(name).split(' ').join('_').split('-').join('_').split('(').join('').split(')').join('')  }_parent_value`;
        result = _.find(data.me.data, ['key', apiRegionKey]);
        if (result) {
          result.title = `${lv2segsItem.name.toUpperCase()  } BY REGIONS`;
          getTextForViews(result, currentGridBy, data.me, data.title)
          dataList.push(result);
        }
      });
    });
    utilities.sendResponse(HTTPStatus.OK, dataList, res);
  } catch (er) {
    console.log(er)
    utilities.sendErrorResponse(HTTPStatus.INTERNAL_SERVER_ERROR, true, er, res);
  }
}

function getAndUpdateSegmentNames(data) {
  data.me.segment.forEach(item => {
    item.name = item.name.split(' ').join('_').toLowerCase();
    item.name = item.name.split('-').join('_').toLowerCase();
    item.name = item.name.split('&').join('and').toLowerCase();
    item.name = item.name.split('(').join('').toLowerCase();
    item.name = item.name.split(')').join('').toLowerCase();
    item.name = item.name.split(',').join('').toLowerCase();
    item.name = item.name.split('.').join('').toLowerCase();
  });
  return data;
}

export async function getByRegion(req, res) {
  try {
    dataList = [];
    const reportId = req.params.rid;
    const regionId = req.params.region_id;
    const currentGridBy = 'MARKET_BY_REGION';
    const reportData = await reportModel.getReportByKeys(reportId, 'title me.geo_segment me.start_year me.end_year me.base_year me.bifurcationLevel me.segment me.data');
    const regionData = _.find(reportData[0].me.geo_segment, ['id', regionId])
    let data = getAndUpdateSegmentNames(reportData[0]);
    const key = `${_.toLower(regionData.region).split(' ').join('_')  }_value`;
    const result = _.find(data.me.data, ['key', key]);
    if (result) {
      result.title = `${regionData.region.toUpperCase()} BY COUNTRIES`;
      getTextForViews(result, currentGridBy, data.me, data.title);
      dataList.push(result);
    }
    // Level 1 segments Bifurcation
    const segments = _.filter(data.me.segment, ['pid', '1']);
    segments.forEach(item => {
      addSegmentData(item, regionData, currentGridBy, data, data.title);
      if (data.me.bifurcationLevel >= 2) {
        // Level 2 segments Bifurcation
        const level2Segments = _.filter(data.me.segment, ['pid', item.id]);
        level2Segments.forEach(level2SegmentItem => {
          addSegmentData(level2SegmentItem, regionData, currentGridBy, data, data.title);
        });
      }
    });
    utilities.sendResponse(HTTPStatus.OK, dataList, res);
  } catch (er) {
    utilities.sendErrorResponse(HTTPStatus.INTERNAL_SERVER_ERROR, true, er, res);
  }
}

export async function getMEViewsData(req, res) {
    try {
        const reportId = req.params.rid;
        // whether to retrieve volume / value / avg price ..

        // keys=segment,region,year&values=app:-1:-1,type:north_america:2018,app:parent
        const viewKey = req.query.key && req.query.key;
        const value = req.query.value && req.query.value;

        const mainSectionId = req.query.mainSectionId;
        const sectionPid = req.query.sectionPid;
        console.log("reportId", reportId);
        console.log("viewKey", viewKey);
        console.log("value", value)

        const meData = await meService.getMEViewsData(reportId, viewKey, value, mainSectionId, sectionPid) || {};
        if (!utilities.isEmpty(meData.errors)) {
            const errObj = meData.errors;
            // const errObj = utilities.getErrorDetails(report.errors);
            utilities.sendErrorResponse(HTTPStatus.BAD_REQUEST, true, errObj, res);
        } else {
            utilities.sendResponse(HTTPStatus.OK, meData, res);
        }

    } catch (er) {
        utilities.sendErrorResponse(HTTPStatus.INTERNAL_SERVER_ERROR, true, er, res);
    }
}

export async function saveDataForGridTables(req, res) {
    try {
        const reportId = req.params.rid;
        const gridTextDetails = req.body;

        const data = await meService.saveDataForGridTables(reportId, gridTextDetails) || {};
        if (!utilities.isEmpty(data.errors)) {
            const errObj = data.errors;
            // const errObj = utilities.getErrorDetails(report.errors);
            utilities.sendErrorResponse(HTTPStatus.INTERNAL_SERVER_ERROR, true, errObj, res);
        } else {
            utilities.sendResponse(HTTPStatus.OK, data, res);
        }

    } catch (er) {
        utilities.sendErrorResponse(HTTPStatus.INTERNAL_SERVER_ERROR, true, er, res);
    }
}

function addSegmentData(segment, regionData, currentGridBy, meData, reportTitle) {
  const regionKey = `${_.toLower(regionData.region).split(' ').join('_')  }_value`;
  let key = `${_.toLower(segment.name).split(' ').join('_')}_${regionKey}`;
  const title = (`${regionData.region  } BY ${  segment.name}`).toUpperCase();
  checkAndAddData(key, title, currentGridBy, meData, reportTitle);
  regionData.countries.forEach(country => {
    key = ((`${segment.name  } ${  country.name  }_value`).split(' ').join('_')).toLowerCase();
    const title = (`${country.name} BY ${segment.name}`).toUpperCase();
    checkAndAddData(key, title, currentGridBy, meData, reportTitle);
  });
}

function checkAndAddData(key, title, currentGridBy, meData, reportTitle) {
  const data = _.find(meData.me.data, ['key', key]);
  if (data) {
    data.title = title;
    getTextForViews(data, currentGridBy, meData.me, reportTitle);
    dataList.push(data);
  }
}

function getTextForViews(viewRecords, viewKey, meData, reportTitle) {
  let reportDetails = null;
  let templateStr = null;
  let compareArr = null;
  let currency = 'USD';

  if (meData && meData.data && meData.data.length) {
    reportDetails = meData.data[0];
    templateStr = textConstants[viewKey];
    compareArr = (_.flatMap(_.flatMap(meData.geo_segment,'countries'),'name'));
  } else {
    console.error(`Report Details not found`);
    return {};
  }

  [viewRecords].forEach((ele) => {
    if (ele) {

      let parentSectName = ele?ele.name : null;
      const rowHeaderCol = (ele.rowHeaders && ele.rowHeaders.length > 0) ? ele.rowHeaders[0] : null;

      if (ele.seg_name) {
        templateStr = textConstants[viewKey]
      }

      if (ele.seg_name && ele.region_name) {
        templateStr = textConstants[viewKey];
      }

      if (ele.value) {
        console.log(ele.value);
        let metric = ele.metric || 'Mn';
        const tableData = ele.value;
        let maxCAGRValue = -1;
        let maxCAGRRowHeader = '';
        let cagrRowHeader = '';
        let cagr_value = -1;
        let baseYearVal = -1;
        let maxValueEndYear = '-1';
        let maxValueRowHeader = '';
        let degree_of_comparision = tableData.length > 3 ? 'largest' : 'larger';

        const CAGRColName = `CAGR (%) (${meData.start_year}-${meData.end_year})`;

        if (ele.metric) {
          switch (ele.metric) {
            case 'Mn':
              metric = 'Mn';
              break;
            case 'Kilo Tons':
              metric = 'Kilo Tons';
              currency = ''
              break;
            case 'Bn':
              metric = 'Bn';
              break;
            case 'Tn':
              metric = 'Tn';
              break;
          }
        }

        for (let i = 0; i < tableData.length; i++) {
          const rowRec = tableData[i];
          if (!rowRec[rowHeaderCol].includes('Total')) {
            if (parseFloat(rowRec[meData.base_year]) > parseFloat(baseYearVal.toString())) {
              maxValueEndYear = rowRec[meData.end_year];
              baseYearVal = rowRec[meData.base_year];
              maxValueRowHeader = rowRec[rowHeaderCol];
              cagr_value = rowRec[CAGRColName];
              cagrRowHeader = rowRec[rowHeaderCol];
            }

            if (parseFloat(rowRec[CAGRColName]) > parseFloat(maxCAGRValue.toString())) {
              maxCAGRValue = rowRec[CAGRColName];
              maxCAGRRowHeader = rowRec[rowHeaderCol];
            }
          }
        }

        try {
          maxCAGRRowHeader = maxCAGRRowHeader ? maxCAGRRowHeader.replace(/_/ig, ' ') : '';
          reportDetails.title = reportDetails.title ? reportDetails.title.replace(/_/ig, ' ') : '';
          parentSectName = parentSectName ? parentSectName.replace(/_/ig, ' ') : '';
          maxValueEndYear = maxValueEndYear ? maxValueEndYear.toString().replace(/_/ig, ' ') : '';
          baseYearVal = baseYearVal || 0;
          maxValueRowHeader = maxValueRowHeader ? maxValueRowHeader.replace(/_/ig, ' ') : '';
          maxCAGRValue = maxCAGRValue || 0;
        } catch (ex) {
          console.error(`Error in replacing constants with spaces. Error: ${ex}`);
        }

        // eslint-disable-next-line eqeqeq
        if (cagrRowHeader === maxCAGRRowHeader) {
          templateStr = textConstants['COMMON_TEMPLATE'];
        } else {
          templateStr = templateStr.replace('<mark>', '');
        }
        console.log('Template String', templateStr)

        if(viewKey === dataConstants.ME_VIEWS.MARKET_BY_REGION){
          maxValueRowHeader = _.find(compareArr,d=>{if(d && d.toLowerCase() === maxValueRowHeader.toLowerCase()){return d}})?maxValueRowHeader:`${maxValueRowHeader} segment`;
          maxCAGRRowHeader = _.find(compareArr,d=>{if(d && d.toLowerCase() == maxCAGRRowHeader.toLowerCase()){return d}})?maxCAGRRowHeader:`${maxCAGRRowHeader} segment`;
        }else{
          maxValueRowHeader = _.find(meData.geo_segment,['region',maxValueRowHeader])?maxValueRowHeader:`${maxValueRowHeader} segment`;
          maxCAGRRowHeader = _.find(meData.geo_segment,['region',maxCAGRRowHeader])?maxCAGRRowHeader:`${maxCAGRRowHeader} segment`;
        }
        let replacedStr = templateStr.replace(/<subseg_name_largest>/ig, maxValueRowHeader.replace(/_/ig, ' '));
        replacedStr = replacedStr.replace(/<report_name>/ig, reportTitle);
        replacedStr = replacedStr.replace(/<seg_name>/ig, parentSectName);
        replacedStr = replacedStr.replace(/<end_year_value>/ig, maxValueEndYear);
        replacedStr = replacedStr.replace(/<end_year>/ig, meData.end_year);
        replacedStr = replacedStr.replace(/<base_year_value>/ig, baseYearVal);
        replacedStr = replacedStr.replace(/<base_year>/ig, meData.base_year);
        replacedStr = replacedStr.replace(/<cagr_value>/ig, cagr_value);
        replacedStr = replacedStr.replace(/<subseg_name_fastest>/ig, maxCAGRRowHeader);
        replacedStr = replacedStr.replace(/<CAGR_MAX_VALUE>/ig, maxCAGRValue);
        replacedStr = replacedStr.replace(/<year_range>/ig, `${meData.base_year + 1} - ${meData.end_year}`);
        replacedStr = replacedStr.replace(/<metric>/ig, metric);
        replacedStr = replacedStr.replace(/<degree_of_comparision>/ig, degree_of_comparision);
        replacedStr = replacedStr.replace(/<currency_unit>/ig, currency);
        ele.text = replacedStr;
        console.log(viewRecords.key, replacedStr);
      } else {
        ele.text = "";
      }

      if (ele.seg_name
        && ele.region_name) {   // region by segments
        ele.title = `${ele.region_name} By ${ele.seg_name}`.toUpperCase();
      } else if (!ele.seg_name
        && ele.region_name
        && !(ele.country_name)) {   // region by countries
        ele.title = `${ele.region_name} By Countries`.toUpperCase();
      } else if ((ele.seg_name)
        && !(ele.region_name)
        && !(ele.country_name)) {    // segments by sub-segments
        ele.title = `${ele.seg_name} By Sub-Segments`.toUpperCase();
      } else if ((ele.seg_name)
        && (ele.country_name)) {    // country by segments
        ele.title = `${ele.country_name} By ${ele.seg_name}`.toUpperCase();
      } else if ((ele.subseg_name)) {   // subsegments by regions
        ele.title = `${ele.subseg_name} By Regions`.toUpperCase();
      }
      // title for Market by segment records
      if ((ele.seg_name)
        && !(ele.region_name)
        && !(ele.country_name)) {
        // console.log('segmentName', ele.seg_name)
        ele.title = (ele.grid_key.indexOf('parent') !== -1) ? `${ele.seg_name} By Sub-Segments`.toUpperCase() : `${ele.seg_name} By Regions`.toUpperCase();
      }
    }
  });
}
