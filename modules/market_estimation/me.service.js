import meModel from './me.model';
import utilities from '../../utilities/utils';
import to from '../../utilities/to';    // for better error handling of async/await with promises
import reportModel from '../reports/report.model';
import textConstants from '../../config/text.template';
import dataConstants from '../../config/dataConstants';
import * as _ from 'lodash'

// ADD ME segments data
async function addSegments(segmentData, reportId) {
    let segData = {};
    try {
        segData = await to(meModel.addSegments(segmentData, reportId));
        if (!segData.errors)
            segData = utilities.formUpdateQueryResults(segData);
        return segData;
    } catch (er) {
        console.error(`Add segment error (${er.message})`);
        return (segData.errors = er.message);
    }
}

// ADD ME 'grid' data
async function addMEData(meGridData, reportId) {
    let meData = {};
    try {
        meData = await to(meModel.addMEData(meGridData, reportId));
        if (!meData.errors)
            meData = utilities.formUpdateQueryResults(meData);
        return meData;
    } catch (er) {
        return (meData.errors = er.message);
    }
}

// ADD ME Geo (regions and countries) data
async function addMEGeoData(reportId, geoData) {
    let meData = {};
    try {
        meData = await to(meModel.addMEGeoData(reportId, geoData));
        if (!meData.errors)
            meData = utilities.formUpdateQueryResults(meData);
        return meData;
    } catch (er) {
        return (meData.errors = er.message);
    }
}

// // MARKET VIEWS MAIN
const getMEViewsData = async function (reportId, viewKey, value, mainSectionId, sectionPid) {
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
}

// MARKET VIEWS BY REGIONS
async function getMEViewsMKTRegionData(
  reportId,
  viewKey,
  regionId /* region Id */,
  mainSectionId,
  sectionPid
) {
  let viewRecords = [];
  let geoDetails = [];
  const gridKeys = [];
  let meViewSegData = [];

  try {
    // retrieve segment data for cross join with regions and countries to get top level of segments
    meViewSegData =
      (await to(meModel.getMEViewsSegmentData(reportId, "1"))) || [];
    // if no records found or present as per conditions
    if (
      utilities.isEmpty(meViewSegData) ||
      utilities.isEmpty(meViewSegData[0].viewRecords)
    ) {
      let err = { errors: new Error("ME Segment not found!") };
      return err;
    }

    // prepare grid data lookup keys
    const segRecords = meViewSegData[0].viewRecords;
    // fetch region and countries list
    geoDetails =
      (await to(meModel.getMEViewsRegionData(reportId, regionId))) || [];
    if (geoDetails.length) {
      geoDetails = geoDetails[0];

      // region data
      geoDetails.regions.forEach(ele => {
        // region data by countries
        const regName = ele.name.toLowerCase().replace(/ /gi, "_");
        ele.region_name = ele.name.toLowerCase();
        ele.grid_key = `${regName}_value`;

        let tempStr = textConstants.MARKET_BY_REGION_TITLE;
        tempStr = tempStr.replace("<geo_name>", regName);
        /*  tempStr = tempStr.replace('<report_name>', );
            tempStr = tempStr.replace();
            tempStr = tempStr.replace();
            tempStr = tempStr.replace(); */
        ele.title = "";
        viewRecords.push(ele);
        gridKeys.push(ele.grid_key);
        // region by segments data
        for (let i = 0; i < segRecords.length; i++) {
          const segEle = Object.assign({}, segRecords[i]);
          if (segEle.pid === "1") {
            // top level segments
            segEle.seg_name = segEle.name.toLowerCase();
            segEle.region_name = ele.name.toLowerCase();
            segEle.grid_key = `${segmentNameSymbolReplacement(
              segEle.name
            )}_${regName}_value`
              .toLowerCase()
              .replace(/ /gi, "_");
            viewRecords.push(segEle);
            gridKeys.push(segEle.grid_key);
          }
        }
      });
        // countries data
        geoDetails.countries.forEach(ele => {
          // region data by countries
          const countName = ele.country.toLowerCase().replace(/ /gi, "_");
          ele.country_name = ele.country.toLowerCase();
          /* ele.grid_key = `${countName}_volume`;
            viewRecords.push(ele);
            gridKeys.push(ele.grid_key); */
          // countries by segments data
          for (let i = 0; i < segRecords.length; i++) {
            const segEle = Object.assign({}, segRecords[i]);
            if (segEle.pid === "1") {
              // top level segments
              segEle.seg_name = segEle.name.toLowerCase();
              segEle.country_name = ele.country.toLowerCase();
              segEle.grid_key = `${segmentNameSymbolReplacement(
                segEle.name
              )}_${countName}_value`
                .toLowerCase()
                .replace(/ /gi, "_");
              viewRecords.push(segEle);
              gridKeys.push(segEle.grid_key);
            }
          }
        });
    } else {
      geoDetails =
        (await to(meModel.getMEViewsWithoutRegionData(reportId))) || [];
      if (geoDetails.length) {
        geoDetails = geoDetails[0];

      // region data
      geoDetails.regions.forEach(ele => {
        // region data by countries
        const regName = ele.name.toLowerCase().replace(/ /gi, "_");
        ele.region_name = ele.name.toLowerCase();
        ele.grid_key = `${regName}_value`;

        let tempStr = textConstants.MARKET_BY_REGION_TITLE;
        tempStr = tempStr.replace("<geo_name>", regName);
        /*  tempStr = tempStr.replace('<report_name>', );
            tempStr = tempStr.replace();
            tempStr = tempStr.replace();
            tempStr = tempStr.replace(); */
        ele.title = "";
        viewRecords.push(ele);
        gridKeys.push(ele.grid_key);
        // region by segments data
        for (let i = 0; i < segRecords.length; i++) {
          const segEle = Object.assign({}, segRecords[i]);
          if (segEle.pid === "1") {
            // top level segments
            segEle.seg_name = segEle.name.toLowerCase();
            segEle.region_name = ele.name.toLowerCase();
            segEle.grid_key = `${segmentNameSymbolReplacement(
              segEle.name
            )}_${regName}_value`
              .toLowerCase()
              .replace(/ /gi, "_");
            viewRecords.push(segEle);
            gridKeys.push(segEle.grid_key);
          }
        }
      });
        // countries data
        geoDetails.countries.forEach(ele => {
          // region data by countries
          const countName = ele.country.toLowerCase().replace(/ /gi, "_");
          ele.country_name = ele.country.toLowerCase();
          /* ele.grid_key = `${countName}_volume`;
            viewRecords.push(ele);
            gridKeys.push(ele.grid_key); */
          // countries by segments data
          for (let i = 0; i < segRecords.length; i++) {
            const segEle = Object.assign({}, segRecords[i]);
            if (segEle.pid === "1") {
              // top level segments
              segEle.seg_name = segEle.name.toLowerCase();
              segEle.country_name = ele.country.toLowerCase();
              segEle.grid_key = `${segmentNameSymbolReplacement(
                segEle.name
              )}_${countName}_value`
                .toLowerCase()
                .replace(/ /gi, "_");
              viewRecords.push(segEle);
              gridKeys.push(segEle.grid_key);
            }
          }
        });
      }
    }
    const meCompViewData =
      (await to(meModel.getMEGridDataForViews(reportId, gridKeys))) || [];
    // if no records found or present as per conditions
    if (
      utilities.isEmpty(meCompViewData) ||
      utilities.isEmpty(meCompViewData[0].gridData)
    ) {
      let err = { errors: new Error("Grid Data not found!") };
      return err;
    }

    // merge segment and gridData records
    viewRecords = viewRecords.map(itm => ({
      ...meCompViewData[0].gridData.find(
        item => item.key === itm.grid_key && item
      ),
      ...itm
    }));

    await getTextForViews(reportId, viewRecords, viewKey);
  } catch (er) {
    console.error(er);
    return { errors: er.message };
  }

  return viewRecords;
}



/* async function getMEViewsRegionData (reportId, viewKey, value , mainSectionId, sectionPid) {
    let viewRecords = [];
    const gridKeys = ['geography_parent_volume'];

    const reportDetails = await to(reportModel.fetchReport(reportId, null, null, "me.geo_segment")) || [];
    if (utilities.isEmpty(reportDetails)) {
        let err = {"errors" : new Error("Grid Data not found!")};
        return err;
    }

    // default used for displayiong introduction with geo parent volume data
    viewRecords.push({
        'grid_key': 'geography_parent_volume',
        'region': 'Introduction'
    });

    reportDetails[0].me.geo_segment.forEach((ele) => {
        const region = ele.region;
        ele.grid_key = `${region.toLowerCase().replace(/ /ig, "_")}_volume`;
        gridKeys.push(ele.grid_key);
        viewRecords.push(ele);
    });

    const meCompViewData = await to(meModel.getMEGridDataForViews(reportId, gridKeys)) || [] ;

    // if no records found or present as per conditions
    if (utilities.isEmpty(meCompViewData) || utilities.isEmpty(meCompViewData[0].gridData)) {
        let err = {"errors" : new Error("Grid Data not found!")};
        return err;
    }

    // merge segment and gridData records
    viewRecords = viewRecords.map(itm => ({
        ...meCompViewData[0].gridData.find((item) => (item.key === itm.grid_key) && item),
        ...itm
    }));

    await to(getTextForViews(reportId, viewRecords, viewKey, mainSectionId, sectionPid));

    return viewRecords;
} */

// MARKET VIEWS BY SEGMENTS
async function getMEViewsMKTSegmentData(reportId, value, viewKey) {
    let meViewData = {};
    let meCompViewData = {};
    const gridKeys = [];

    try {
        meViewData = await meModel.getMEViewsSegmentData(reportId, value) || [];

        // if no records found or present as per conditions
        if (utilities.isEmpty(meViewData) || utilities.isEmpty(meViewData[0].viewRecords)) {
            let err = { "errors": new Error("Grid Data not found!") };
            return err;
        }

        // prepare grid data lookup keys
        let viewRecords = meViewData[0].viewRecords;
        let tmpArr = [];

        let segName = "";
        for (let i = 0; i < viewRecords.length; i++) {
            const ele = viewRecords[i];
            if (ele.id === value) {   // parent segment
                ele.grid_key = `${ele.name}_parent_value`.toLowerCase().replace(/ /ig, '_').replace(/-/ig,'_').replace(/&/g,'and');
                segName = ele.name;
                gridKeys.push(ele.grid_key);
                tmpArr.push(ele);
            } else if (ele.pid === value) {                // child segments
                delete viewRecords[i];;
            }
            ele.seg_name = ele.name;
        }
        viewRecords = tmpArr;

        // look in db for grid data based upon above keys
        meCompViewData = await meModel.getMEGridDataForViews(reportId, gridKeys) || [];
        // if no records found or present as per conditions
        if (utilities.isEmpty(meCompViewData) || utilities.isEmpty(meCompViewData[0].gridData)) {
            let err = { "errors": new Error("Grid Data not found!") };
            return err;
        }

        // merge segment and gridData records
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

}

// AUTO GENERATE TEXT FOR VIEWS
const getTextForViews = async function (reportId, viewRecords, viewKey) {
    let reportDetails = null;
    let templateStr = null;
    let compareArr = null;
    reportDetails = await to(reportModel.fetchReport(reportId, null, null, "me.start_year,me.end_year,me.base_year,me.geo_segment")) || [];
    if (!utilities.isEmpty(reportDetails)) {
        reportDetails = reportDetails[0];
        templateStr = textConstants[viewKey];
        compareArr = (_.flatMap(_.flatMap(reportDetails.me.geo_segment,'countries'),'name'));
    } else {
        console.error(`Report Details not found for ${reportId}`);
        return {};
    }

    viewRecords.forEach((ele) => {
        // if (utilities.isEmpty(ele.text)) {

            let parentSectName = ele.name || null;
            let rowHeaderCol = (ele.rowHeaders && ele.rowHeaders.length > 0) ? ele.rowHeaders[0] : null;

            // if the seg name is not empty means its market distributed by segment
            if (!utilities.isEmpty(ele.seg_name)) {
                templateStr = textConstants.MARKET_BY_SEGMENT;
            }

            if (!utilities.isEmpty(ele.seg_name) && !utilities.isEmpty(ele.region_name)) {
                templateStr = textConstants.SEGMENT_BY_REGIONS;
            }

            /* const eleKeyPart = ele.grid_key && ele.grid_key.split('_') || [];
            if (eleKeyPart.length > 0 && !parentSectName) {
                parentSectName = eleKeyPart[0];
            }

            if (eleKeyPart.length > 1 && !rowHeaderCol) {
                rowHeaderCol = `${eleKeyPart[0]}_${eleKeyPart[1]}`;
            } */

            if (!utilities.isEmpty(ele.value)) {
                let metric = ele.metric?ele.metric:dataConstants.METRIC.MN;
                const tableData = ele.value;
                let maxCAGRValue = -1;
                let maxCAGRRowHeader = '';
                let cagrRowHeader = '';
                let cagr_value = -1;
                let baseYearVal = -1;
                let maxValueEndYear = -1;
                let maxValueRowHeader = '';
                let currencyUnit = 'USD';
                let degree_of_comparision = tableData.length > 3 ? 'largest' : 'larger';
                const CAGRColName = `CAGR (%) (${reportDetails.me.start_year}-${reportDetails.me.end_year})`;

                if (!utilities.isEmpty(ele.metric)) {
                    switch(ele.metric) {
                        case dataConstants.CURRENCY_UNIT.MN:
                            metric = dataConstants.METRIC.MN;
                            break;
                        case dataConstants.CURRENCY_UNIT.KILO:
                                metric = dataConstants.METRIC.KILO;
                                break;
                        case dataConstants.CURRENCY_UNIT.BN:
                            metric = dataConstants.METRIC.BN;
                            break;
                        case dataConstants.CURRENCY_UNIT.TN:
                            metric = dataConstants.METRIC.TN;
                            break;
                    }
                }

                for (let i = 0; i < tableData.length; i++) {
                    const rowRec = tableData[i];
                    if (!rowRec[rowHeaderCol].includes(dataConstants.TABLE_CONSTANTS.TOTAL)) {
                        if (parseFloat(rowRec[reportDetails.me.base_year]) > parseFloat(baseYearVal)) {
                            maxValueEndYear = rowRec[reportDetails.me.end_year];
                            baseYearVal = rowRec[reportDetails.me.base_year];
                            maxValueRowHeader = rowRec[rowHeaderCol];
                            cagr_value = rowRec[CAGRColName];
                            cagrRowHeader = rowRec[rowHeaderCol];
                        }


                        if (parseFloat(rowRec[CAGRColName]) > parseFloat(maxCAGRValue)) {
                            maxCAGRValue = rowRec[CAGRColName];
                            maxCAGRRowHeader = rowRec[rowHeaderCol];
                        }
                    }
                }

                try {
                    maxCAGRRowHeader = !utilities.isEmpty(maxCAGRRowHeader) ? maxCAGRRowHeader.replace(/_/ig, ' ') : '';
                    reportDetails.title = !utilities.isEmpty(reportDetails.title) ? reportDetails.title.replace(/_/ig, ' '): '';
                    parentSectName = !utilities.isEmpty(parentSectName) ? parentSectName.replace(/_/ig, ' ') : '';
                    maxValueEndYear = !utilities.isEmpty(maxValueEndYear) ? maxValueEndYear.replace(/_/ig, ' ') : '';
                    // reportDetails.me.end_year = !utilities.isEmpty(reportDetails.me.end_year) ? reportDetails.me.end_year.replace(/_/ig, ' '): '';
                    baseYearVal = !utilities.isEmpty(baseYearVal) ? baseYearVal.replace(/_/ig, ' ') : '';
                    // reportDetails.me.base_year = !utilities.isEmpty(reportDetails.me.base_year) ? reportDetails.me.base_year.replace(/_/ig, ' ') : '';
                    maxValueRowHeader = !utilities.isEmpty(maxValueRowHeader) ? maxValueRowHeader.replace(/_/ig, ' ') : '';
                    maxCAGRValue = !utilities.isEmpty(maxCAGRValue) ? maxCAGRValue.replace(/_/ig, ' ') : '';
                    // reportDetails.me.start_year = !utilities.isEmpty(reportDetails.me.start_year) ? reportDetails.me.start_year.replace(/_/ig, ' ') : '';
                    // reportDetails.me.end_year = !utilities.isEmpty(reportDetails.me.end_year) ? reportDetails.me.end_year.replace(/_/ig, ' ') : '';
                } catch (ex) {
                    console.error(`Error in replacing constants with spaces. Error: ${ex}`);
                }

                if (cagrRowHeader == maxCAGRRowHeader) {
                    let idx = templateStr.indexOf(' <mark>');
                    //  templateStr = templateStr.substr(0,idx);
                    let check = templateStr.includes('This market is projected to grow at a CAGR of <cagr_value>% during the forecast period from <year_range>.')
                    if((viewKey == dataConstants.ME_VIEWS.MARKET_BY_REGION && !check) || (viewKey == dataConstants.ME_VIEWS.MARKET_BY_SEGMENT && !check)){
                         templateStr = templateStr + `This market is projected to grow at a CAGR of ${Number(cagr_value).toFixed(2)}% during the forecast period from ${Number(reportDetails.me.base_year)+1} - ${reportDetails.me.end_year}.`
                      }
                } else {
                    templateStr = templateStr.replace('<mark>', '');
                }

                if(viewKey == dataConstants.ME_VIEWS.MARKET_BY_REGION){
                    maxValueRowHeader = _.find(compareArr,d=>{if(d && d.toLowerCase() == maxValueRowHeader.toLowerCase()){return d}})?maxValueRowHeader:maxValueRowHeader+' segment';
                    maxCAGRRowHeader = _.find(compareArr,d=>{if(d && d.toLowerCase() == maxCAGRRowHeader.toLowerCase()){return d}})?maxCAGRRowHeader:maxCAGRRowHeader+' segment';
                }else{
                    maxValueRowHeader = _.find(reportDetails.me.geo_segment,['region',maxValueRowHeader])?maxValueRowHeader:maxValueRowHeader+' segment';
                    maxCAGRRowHeader = _.find(reportDetails.me.geo_segment,['region',maxCAGRRowHeader])?maxCAGRRowHeader:maxCAGRRowHeader+' segment';
                }

                let replacedStr = templateStr.replace(/<subseg_name_largest>/ig, maxValueRowHeader.replace(/_/ig, ' '));
                replacedStr = replacedStr.replace(/<report_name>/ig, reportDetails.title.toLowerCase());
                replacedStr = replacedStr.replace(/<seg_name>/ig, parentSectName);
                replacedStr = replacedStr.replace(/<end_year_value>/ig, Number(maxValueEndYear).toFixed(2));
                replacedStr = replacedStr.replace(/<end_year>/ig, reportDetails.me.end_year);
                replacedStr = replacedStr.replace(/<base_year_value>/ig, Number(baseYearVal).toFixed(2));
                replacedStr = replacedStr.replace(/<base_year>/ig, reportDetails.me.base_year);
                replacedStr = replacedStr.replace(/<cagr_value>/ig, Number(cagr_value).toFixed(2));
                replacedStr = replacedStr.replace(/<subseg_name_fastest>/ig, maxCAGRRowHeader);
                replacedStr = replacedStr.replace(/<CAGR_MAX_VALUE>/ig, Number(maxCAGRValue).toFixed(2));
                replacedStr = replacedStr.replace(/<year_range>/ig, `${Number(reportDetails.me.base_year)+1} - ${reportDetails.me.end_year}`);
                replacedStr = replacedStr.replace(/<metric>/ig, metric);
                replacedStr = replacedStr.replace(/<degree_of_comparision>/ig, degree_of_comparision);
                replacedStr = replacedStr.replace(/<currency_unit>/ig, currencyUnit);

                ele.text = replacedStr;
                // ele.title = ele.key;
            } else {
                ele.text = "";
            }

            if (!utilities.isEmpty(ele.seg_name)
                && !utilities.isEmpty(ele.region_name)) {   // region by segments
                ele.title = `${ele.region_name} By ${ele.seg_name}`.toUpperCase();
            } else if (utilities.isEmpty(ele.seg_name)
                && !utilities.isEmpty(ele.region_name)
                && utilities.isEmpty(ele.country_name)) {   // region by countries
                ele.title = `${ele.region_name} By Countries`.toUpperCase();
            } else if (!utilities.isEmpty(ele.seg_name)
                && utilities.isEmpty(ele.region_name)
                && utilities.isEmpty(ele.country_name)) {    // segments by sub-segments
                ele.title = `${ele.seg_name} By Sub-Segments`.toUpperCase();
            } else if (!utilities.isEmpty(ele.seg_name)
                && !utilities.isEmpty(ele.country_name)) {    // country by segments
                ele.title = `${ele.country_name} By ${ele.seg_name}`.toUpperCase();
            } else if (!utilities.isEmpty(ele.subseg_name)) {   // subsegments by regions
                ele.title = `${ele.subseg_name} By Regions`.toUpperCase();
            }

            // title for Market by segment records
            if (!utilities.isEmpty(ele.seg_name)
                && utilities.isEmpty(ele.region_name)
                && utilities.isEmpty(ele.country_name)) {
                ele.title = (ele.grid_key.indexOf('parent') !== -1) ? `${ele.seg_name} By Sub-Segments`.toUpperCase() : `${ele.seg_name} By Regions`.toUpperCase();
            }
        // }
    });
}

// GET ME segments view based upon values
async function getMESegmentViewData(reportId, value = "1", viewKey) {
    let segRes = null;

    segRes = await meModel.getMEViewsSegmentData(reportId, value);

    return (segRes);
}


// GET ME region view based upon values
async function getMERegionViewData(reportId, value = "", viewKey) {
    let regRes = null;

    regRes = await meModel.getMEViewsRegionData(reportId, value);

    return (regRes);
}

// GET ME View for SEGMENT_BY_REGIONS
async function getMEViewsSegmentRegionData(reportId, value, viewKey) {

    let segData = null;
    let regData = null;
    const gridKeys = [];
    let meCompViewData = [];
    let viewRecords = [];
    let segName = "";

    try {
        // Get segment data
        segData = await getMESegmentViewData(reportId, value);
        if (utilities.isEmpty(segData)) {
            const errMsg = "No Sergment information found.";
            return ({ "errors": new Error(errMsg) });
        }
        segData = segData[0];

        /* segData.viewRecords.forEach((ele) => {
            if (ele.id === "1")
                segName = ele.name;
        }) */

        segData.viewRecords.forEach((ele) => {
            if (ele.pid !== "1") {
                let key = `geography_${segmentNameSymbolReplacement(ele.name)}_parent_value`.toLowerCase().replace(/ /ig,'_');
                gridKeys.push(key);
                viewRecords.push({
                    'grid_key': key,
                    "subseg_name": ele.name,
                    "name": ele.name
                });
            }
        });

        /* // Get regions data
        regData = await getMERegionViewData(reportId, "-1");
        if (utilities.isEmpty(regData)) {
                const errMsg = "No Region information found.";
                return ({"errors": new Error(errMsg)});
        }
        regData = regData[0];

        for (let i=0;i<segData.viewRecords.length;i++) {
            const segEle = segData.viewRecords[i];
            if (segEle.pid === "1") {
                for(let j=0;j<regData.regions.length;j++) {
                    const ele = regData.regions[j];
                    const regName = ele.name.replace(" ", "_");
                    const gridKey = `${segEle.name}_${regName}_volume`.toLowerCase();

                    viewRecords.push({
                        grid_key: gridKey,
                        segName: segEle.name,
                        regName: ele.name
                    });

                    gridKeys.push(gridKey);
                }
            }
        }*/

        // look in db for grid data based upon above keys
        meCompViewData = await meModel.getMEGridDataForViews(reportId, gridKeys) || [];
        // if no records found or present as per conditions
        if (utilities.isEmpty(meCompViewData) || utilities.isEmpty(meCompViewData[0].gridData)) {
            let err = { "errors": new Error("Grid Data not found!") };
            return err;
        }


        // merge segment and gridData records
        viewRecords = viewRecords.map(itm => ({
            ...meCompViewData[0].gridData.find((item) => (item.key === itm.grid_key) && item),
            ...itm
        }));

        // console.log(viewRecords);
        /*
        const subsegObj = utilities.getTableTransposeForFirstCol(viewRecords);
        const resRecords = [];

        for (let subSeg in subsegObj){
            if (subsegObj.hasOwnProperty(subSeg)) {
                resRecords.push({
                    "name": subSeg,
                    "subseg_name": subSeg,
                    "value": subsegObj[subSeg],
                    "key": `${subSeg} BY Regions`
                });
            }
        } */

        await getTextForViews(reportId, viewRecords, viewKey);


        return viewRecords;
    } catch (ex) {
        console.log(`Eception in getMEViewsSegmentRegionData(): ${ex} `);
        return { "errors": ex.message };
    }
}

const saveDataForGridTables = async function (reportId, gridTextDetails) {
    try {
        let promiseArr = [];

        for (let i = 0; i < gridTextDetails.length; i++) {
            let ele = gridTextDetails[i];
            promiseArr.push(meModel.saveDataForGridTables(reportId, ele));
        }

        let res = await Promise.all(promiseArr);
        /* if (!res.errors)
            res = utilities.formUpdateQueryResults(res); */
        return res;
    } catch (er) {
        return (errors = er.message);
    }
}

const segmentNameSymbolReplacement=(val)=>{
       return val.replace(/ /g,'_')
        .replace(/-/g,'_')
        .replace('(','')
        .replace(')','')
        .replace(/&/,'and')
        .split(',').join('')
        .split('.').join('')
}
module.exports = {
    addSegments,
    addMEData,
    addMEGeoData,
    getTextForViews,
    getMEViewsData,
    saveDataForGridTables
};
