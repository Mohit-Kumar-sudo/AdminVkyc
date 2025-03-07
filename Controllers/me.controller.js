const dataConstants = require('../config/dataConstants');
const textConstants = require('../config/text.template');
const utilities = require('../utilities/utils');
const to = require('../utilities/to');
const reportController = require('../Controllers/Reports.Controller');
const meModel = require('../Models/me.modal');
const _ = require("lodash");
const HTTPStatus = require('http-status');

const getMEViewsDataService = async(reportId, viewKey, value, mainSectionId, sectionPid) =>{
  let viewData = null;

  try {
    switch (viewKey) {
      case dataConstants.ME_VIEWS.MARKET_BY_REGION:
        viewData = await getMEViewsMKTRegionData(reportId, viewKey, value, mainSectionId, sectionPid);
        break;
      case dataConstants.ME_VIEWS.MARKET_BY_SEGMENT:
        viewData = await getMEViewsMKTSegmentData(reportId, value, viewKey, mainSectionId, sectionPid);
        let dataRes = await getMEViewsSegmentRegionData(reportId, value, dataConstants.ME_VIEWS.SEGMENT_BY_REGIONS) || {};
        if (!dataRes.hasOwnProperty("errors") && utilities.isEmpty(dataRes.errors))
          viewData = [...viewData, ...dataRes];
        break;
      case dataConstants.ME_VIEWS.SEGMENT_BY_REGIONS:
        viewData = await getMEViewsSegmentRegionData(reportId, value, viewKey);
        break;
      case dataConstants.ME_VIEWS.REGION:
        viewData = await getMERegionViewData(reportId, value, viewKey);
        break;
      case dataConstants.ME_VIEWS.SEGMENT:
        viewData = await getMESegmentViewData(reportId, value, viewKey);
        break;
      default:
        console.error("View name is invalid or missing!");
        break;
    }
  } catch (er) {
    console.error("Error: Market By views: " + er);
    return (viewData.errors = er.message);
  }

  return viewData;
};

const getMEViewsMKTRegionData = async (reportId, viewKey, regionId) => {
  let viewRecords = [];
  let geoDetails = [];
  const gridKeys = [];
  let meViewSegData = [];

  try {
    meViewSegData = (await to(meModel.getMEViewsSegmentData(reportId, "1"))) || [];
    if (
      utilities.isEmpty(meViewSegData) ||
      utilities.isEmpty(meViewSegData[0]?.viewRecords)
    ) {
      let err = { errors: new Error("ME Segment not found!") };
      return err;
    }
    
    const segRecords = meViewSegData[0].viewRecords || [];
    
    geoDetails = (await to(meModel.getMEViewsRegionData(reportId, regionId))) || [];
    if (geoDetails.length) {
      geoDetails = geoDetails[0];
      if (geoDetails.regions) {
        geoDetails.regions.forEach(ele => {
          const regName = ele.name.toLowerCase().replace(/ /gi, "_");
          ele.region_name = ele.name.toLowerCase();
          ele.grid_key = `${regName}_value`;
          ele.title = "";
          viewRecords.push(ele);
          gridKeys.push(ele.grid_key);
          segRecords.forEach(segEle => {
            if (segEle.pid === "1") {
              const segData = { ...segEle };
              segData.seg_name = segData.name.toLowerCase();
              segData.region_name = ele.name.toLowerCase();
              segData.grid_key = `${segmentNameSymbolReplacement(segData.name)}_${regName}_value`
                .toLowerCase()
                .replace(/ /gi, "_");
              viewRecords.push(segData);
              gridKeys.push(segData.grid_key);
            }
          });
        });
      }

      if (geoDetails.countries) {
        geoDetails.countries.forEach(ele => {
          const countName = ele.country.toLowerCase().replace(/ /gi, "_");
          ele.country_name = ele.country.toLowerCase();
          segRecords.forEach(segEle => {
            if (segEle.pid === "1") {
              const segData = { ...segEle };
              segData.seg_name = segData.name.toLowerCase();
              segData.country_name = ele.country.toLowerCase();
              segData.grid_key = `${segmentNameSymbolReplacement(segData.name)}_${countName}_value`
                .toLowerCase()
                .replace(/ /gi, "_");
              viewRecords.push(segData);
              gridKeys.push(segData.grid_key);
            }
          });
        });
      }
    } else {
      geoDetails = (await to(meModel.getMEViewsWithoutRegionData(reportId))) || [];
      // Similar processing as above for regions and countries
    }

    const meCompViewData = (await to(meModel.getMEGridDataForViews(reportId, gridKeys))) || [];
    if (
      utilities.isEmpty(meCompViewData) ||
      utilities.isEmpty(meCompViewData[0]?.gridData)
    ) {
      let err = { errors: new Error("Grid Data not found!") };
      return err;
    }

    viewRecords = viewRecords.map(itm => ({
      ...meCompViewData[0].gridData.find(
        item => item.key === itm.grid_key
      ),
      ...itm
    }));

    await getTextForViews(reportId, viewRecords, viewKey);

  } catch (er) {
    console.error(er);
    return { errors: er.message };
  }

  return viewRecords;
};


const getMEViewsMKTSegmentData = async(reportId, value, viewKey) =>{
  let meViewData = {};
  let meCompViewData = {};
  const gridKeys = [];
  try {
    meViewData = await meModel.getMEViewsSegmentData(reportId, value) || [];
    if (utilities.isEmpty(meViewData) || utilities.isEmpty(meViewData[0].viewRecords)) {
      let err = { "errors": new Error("Grid Data not found!") };
      return err;
    }
    let viewRecords = meViewData[0].viewRecords;
    let tmpArr = [];
    let segName = "";
    for (let i = 0; i < viewRecords.length; i++) {
      const ele = viewRecords[i];
      if (ele.id === value) {
        ele.grid_key = `${ele.name}_parent_value`.toLowerCase().replace(/ /ig, '_').replace(/-/ig, '_').replace(/&/g, 'and');
        segName = ele.name;
        gridKeys.push(ele.grid_key);
        tmpArr.push(ele);
      } else if (ele.pid === value) {
        delete viewRecords[i];;
      }
      ele.seg_name = ele.name;
    }
    viewRecords = tmpArr;
    meCompViewData = await meModel.getMEGridDataForViews(reportId, gridKeys) || [];
    if (utilities.isEmpty(meCompViewData) || utilities.isEmpty(meCompViewData[0].gridData)) {
      let err = { "errors": new Error("Grid Data not found!") };
      return err;
    }
    viewRecords = viewRecords.map(itm => ({
      ...meCompViewData[0].gridData.find((item) => (item.key === itm.grid_key) && item),
      ...itm
    }));
    await getTextForViews(reportId, viewRecords, viewKey);
    return viewRecords;
  } catch (er) {
    console.error(er);
    return (meViewData.errors = er.message);
  }
};

const getMEViewsSegmentRegionData = async(reportId, value, viewKey)=>{
  let segData = null;
  const gridKeys = [];
  let meCompViewData = [];
  let viewRecords = [];
  try {
    segData = await getMESegmentViewData(reportId, value);
    if (utilities.isEmpty(segData)) {
      const errMsg = "No Sergment information found.";
      return ({ "errors": new Error(errMsg) });
    }
    segData = segData[0];
    segData.viewRecords.forEach((ele) => {
      if (ele.pid !== "1") {
        let key = `geography_${segmentNameSymbolReplacement(ele.name)}_parent_value`.toLowerCase().replace(/ /ig, '_');
        gridKeys.push(key);
        viewRecords.push({
          'grid_key': key,
          "subseg_name": ele.name,
          "name": ele.name
        });
      }
    });
    meCompViewData = await meModel.getMEGridDataForViews(reportId, gridKeys) || [];
    if (utilities.isEmpty(meCompViewData) || utilities.isEmpty(meCompViewData[0].gridData)) {
      let err = { "errors": new Error("Grid Data not found!") };
      return err;
    }
    viewRecords = viewRecords.map(itm => ({
      ...meCompViewData[0].gridData.find((item) => (item.key === itm.grid_key) && item),
      ...itm
    }));
    await getTextForViews(reportId, viewRecords, viewKey);
    return viewRecords;
  } catch (ex) {
    console.log(`Eception in getMEViewsSegmentRegionData(): ${ex} `);
    return { "errors": ex.message };
  }
};

const getTextForViews = (viewRecords, viewKey, meData, reportTitle)=>{
  let reportDetails = null;
  let templateStr = null;
  let compareArr = null;
  let currency = 'USD';
  if (meData && meData.data && meData.data.length) {
    reportDetails = meData.data[0];
    templateStr = textConstants[viewKey];
    compareArr = (_.flatMap(_.flatMap(meData.geo_segment, 'countries'), 'name'));
  } else {
    console.error(`Report Details not found`);
    return {};
  }
  [viewRecords].forEach((ele) => {
    if (ele) {
      let parentSectName = ele ? ele.name : null;
      const rowHeaderCol = (ele.rowHeaders && ele.rowHeaders.length > 0) ? ele.rowHeaders[0] : null;
      if (ele.seg_name) {
        templateStr = textConstants[viewKey]
      }
      if (ele.seg_name && ele.region_name) {
        templateStr = textConstants[viewKey];
      }
      if (ele.value) {
        // console.log(ele.value);
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
        if (cagrRowHeader === maxCAGRRowHeader) {
          templateStr = textConstants['COMMON_TEMPLATE'];
        } else {
          templateStr = templateStr.replace('<mark>', '');
        }
        // console.log('Template String', templateStr)
        if (viewKey === dataConstants.ME_VIEWS.MARKET_BY_REGION) {
          maxValueRowHeader = _.find(compareArr, d => { if (d && d.toLowerCase() === maxValueRowHeader.toLowerCase()) { return d } }) ? maxValueRowHeader : `${maxValueRowHeader} segment`;
          maxCAGRRowHeader = _.find(compareArr, d => { if (d && d.toLowerCase() == maxCAGRRowHeader.toLowerCase()) { return d } }) ? maxCAGRRowHeader : `${maxCAGRRowHeader} segment`;
        } else {
          maxValueRowHeader = _.find(meData.geo_segment, ['region', maxValueRowHeader]) ? maxValueRowHeader : `${maxValueRowHeader} segment`;
          maxCAGRRowHeader = _.find(meData.geo_segment, ['region', maxCAGRRowHeader]) ? maxCAGRRowHeader : `${maxCAGRRowHeader} segment`;
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
        // console.log(viewRecords.key, replacedStr);
      } else {
        ele.text = "";
      }
      if (ele.seg_name
        && ele.region_name) {
        ele.title = `${ele.region_name} By ${ele.seg_name}`.toUpperCase();
      } else if (!ele.seg_name
        && ele.region_name
        && !(ele.country_name)) {
        ele.title = `${ele.region_name} By Countries`.toUpperCase();
      } else if ((ele.seg_name)
        && !(ele.region_name)
        && !(ele.country_name)) {
        ele.title = `${ele.seg_name} By Sub-Segments`.toUpperCase();
      } else if ((ele.seg_name)
        && (ele.country_name)) {
        ele.title = `${ele.country_name} By ${ele.seg_name}`.toUpperCase();
      } else if ((ele.subseg_name)) {
        ele.title = `${ele.subseg_name} By Regions`.toUpperCase();
      }
      if ((ele.seg_name)
        && !(ele.region_name)
        && !(ele.country_name)) {
        ele.title = (ele.grid_key.indexOf('parent') !== -1) ? `${ele.seg_name} By Sub-Segments`.toUpperCase() : `${ele.seg_name} By Regions`.toUpperCase();
      }
    }
  });
};

const getMESegmentViewData = async(reportId, value = "1", viewKey)=>{
  let segRes = null;
  segRes = await meModel.getMEViewsSegmentData(reportId, value);
  return (segRes);
};

const getAndUpdateSegmentNames = (data) =>{
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
};

const checkAndAddData = async (key, title, currentGridBy, meData, reportTitle) =>{
  const data = _.find(meData.me.data, ['key', key]);
  if (data) {
    data.title = title;
    getTextForViews(data, currentGridBy, meData.me, reportTitle);
    dataList.push(data);
  }
};

const addSegmentData = async (segment, regionData, currentGridBy, meData, reportTitle) =>{
  const regionKey = `${_.toLower(regionData.region).split(' ').join('_')}_value`;
  let key = `${_.toLower(segment.name).split(' ').join('_')}_${regionKey}`;
  const title = (`${regionData.region} BY ${segment.name}`).toUpperCase();
  checkAndAddData(key, title, currentGridBy, meData, reportTitle);
  regionData.countries.forEach(country => {
    key = ((`${segment.name} ${country.name}_value`).split(' ').join('_')).toLowerCase();
    const title = (`${country.name} BY ${segment.name}`).toUpperCase();
    checkAndAddData(key, title, currentGridBy, meData, reportTitle);
  });
};

const segmentNameSymbolReplacement = (val)=>{
  return val.replace(/ /g, '_')
  .replace(/-/g, '_')
  .replace('(', '')
  .replace(')', '')
  .replace(/&/, 'and')
  .split(',').join('')
  .split('.').join('')
};

const  getMERegionViewData = async(reportId, value = "", viewKey)=>{
  let regRes = null;
  regRes = await meModel.getMEViewsRegionData(reportId, value);
  return (regRes);
};

module.exports = {
  getBySegment: async (req, res) =>{
    try {
      dataList = [];
      const reportId = req.params.rid;
      const segmentId = req.params.segment_id;
      const currentGridBy = 'MARKET_BY_SEGMENT';
      const reportData = await reportController.getReportByKeys(reportId, 'title me.geo_segment me.start_year me.end_year me.base_year me.bifurcationLevel me.segment me.data');
      let data = getAndUpdateSegmentNames(reportData[0]);
      const segment = _.find(data.me.segment, ['id', segmentId]);
      let apiKey = `${(`${_.toLower(segment.name)}`).split(' ').join('_')}_parent_value`;
      let result = _.find(data.me.data, ['key', apiKey]);
      if (result) {
        result.title = `${segment.name.toUpperCase()} BY SUB-SEGMENTS`;
        getTextForViews(result, currentGridBy, data.me, data.title)
        dataList.push(result);
      }
      const segs = _.filter(data.me.segment, ['pid', segmentId]);
      segs.forEach(item => {
        const name = item.name.split('.').join('_');
        const apiRegionKey = `geography_${_.toLower(name).split(' ').join('_').split('-').join('_').split('(').join('').split(')').join('')}_parent_value`;
        // console.log('apiRegionKey', apiRegionKey)
        result = _.find(data.me.data, ['key', apiRegionKey]);
        if (result) {
          result.title = `${item.name.toUpperCase()} BY REGIONS`;
          getTextForViews(result, currentGridBy, data.me, data.title);
          dataList.push(result);
        }
      });
      segs.forEach(item => {
        const lv2segs = _.filter(data.me.segment, ['pid', item.id]);
        apiKey = `${(`${segment.name}_${_.toLower(item.name)}`).split(' ').join('_')}_value`;
        result = _.find(data.me.data, ['key', apiKey]);
        if (result) {
          result.title = `${item.name.toUpperCase()} BY SUB-SEGMENTS`;
          getTextForViews(result, currentGridBy, data.me, data.title)
          dataList.push(result);
        }
        lv2segs.forEach(lv2segsItem => {
          const name = lv2segsItem.name.split('.').join('_');
          const apiRegionKey = `geography_${_.toLower(name).split(' ').join('_').split('-').join('_').split('(').join('').split(')').join('')}_parent_value`;
          result = _.find(data.me.data, ['key', apiRegionKey]);
          if (result) {
            result.title = `${lv2segsItem.name.toUpperCase()} BY REGIONS`;
            getTextForViews(result, currentGridBy, data.me, data.title)
            dataList.push(result);
          }
        });
      });
      utilities.sendResponse(HTTPStatus.OK, dataList, res);
    } catch (er) {
      console.error('Error in getBySegment:', er);
      return utilities.sendErrorResponse(HTTPStatus.INTERNAL_SERVER_ERROR, true, er, res);
    }
  },

  getByRegion: async (req, res) =>{
    try {
      dataList = [];
      const reportId = req.params.rid;
      const regionId = req.params.region_id;
      const currentGridBy = 'MARKET_BY_REGION';
      const reportData = await reportController.getReportByKeys(reportId, 'title me.geo_segment me.start_year me.end_year me.base_year me.bifurcationLevel me.segment me.data');
      const regionData = _.find(reportData[0].me.geo_segment, ['id', regionId])
      let data = getAndUpdateSegmentNames(reportData[0]);
      const key = `${_.toLower(regionData.region).split(' ').join('_')}_value`;
      const result = _.find(data.me.data, ['key', key]);
      if (result) {
        result.title = `${regionData.region.toUpperCase()} BY COUNTRIES`;
        getTextForViews(result, currentGridBy, data.me, data.title);
        dataList.push(result);
      }
      const segments = _.filter(data.me.segment, ['pid', '1']);
      segments.forEach(item => {
        addSegmentData(item, regionData, currentGridBy, data, data.title);
        if (data.me.bifurcationLevel >= 2) {
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
  },
  getMEViewsData: async (req, res) =>{
    // console.log("resss", res)
    try {
      const reportId = req.params.rid;
      const viewKey = req.query.key && req.query.key;
      const value = req.query.value && req.query.value;
      const mainSectionId = req.query.mainSectionId;
      const sectionPid = req.query.sectionPid;
      // console.log("reportId", reportId);
      // console.log("viewKey", viewKey);
      // console.log("value", value)
      const meData = await getMEViewsDataService(reportId, viewKey, value, mainSectionId, sectionPid) || {};
      if (!utilities.isEmpty(meData.errors)) {
        const errObj = meData.errors;
        utilities.sendErrorResponse(HTTPStatus.BAD_REQUEST, true, errObj, res);
      } else {
        utilities.sendResponse(HTTPStatus.OK, meData, res);
      }
    } catch (er) {
      utilities.sendErrorResponse(HTTPStatus.INTERNAL_SERVER_ERROR, true, er, res);
    }
  }
};