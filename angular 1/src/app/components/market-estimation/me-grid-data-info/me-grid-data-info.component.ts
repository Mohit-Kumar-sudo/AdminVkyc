import {Component, OnInit} from '@angular/core';
import {LocalStorageService} from 'src/app/services/localsotrage.service';
import {SegmentService} from 'src/app/services/segment.service';
import {ConstantKeys, textConstants} from 'src/app/constants/mfr.constants';
import {MasterReportData} from 'src/app/models/me-models';
import {MatSnackBar} from '@angular/material';
import {Location} from '@angular/common';
import {Router} from '@angular/router';
import {TextTableData} from '../../core/text-table-data/text-table-data.component';
import {NgxSpinnerService} from 'ngx-spinner';
import * as _ from 'lodash';

@Component({
  selector: 'app-me-grid-data-info',
  templateUrl: './me-grid-data-info.component.html',
  styleUrls: ['./me-grid-data-info.component.scss']
})
export class MeGridDataInfoComponent implements OnInit {

  dataList: any = [];
  reportData: any;
  currentGridBy: any;

  currentReport: MasterReportData = null;
  currentSegment: any;
  geo_tables: any = [];
  dummyData: any = [];
  changeKey: any = [];
  meData: any = [];

  constructor(private localStorageService: LocalStorageService,
              private segmentService: SegmentService,
              private spinner: NgxSpinnerService,
              private _location: Location,
              private _snackBar: MatSnackBar,
              private router: Router) {
  }

  ngOnInit() {
    this.spinner.show();
    this.currentReport = this.localStorageService.get(ConstantKeys.CURRENT_REPORT);
    const currentGridBy = this.localStorageService.get(ConstantKeys.CURRENT_GRID_LOAD_KEY);
    this.currentGridBy = currentGridBy
    this.currentSegment = this.localStorageService.get(ConstantKeys.CURRENT_SEGMENT_SELECTED)
    if (currentGridBy == ConstantKeys.MARKET_BY_SEGMENT){
      this.segmentService.getDataBySegment(this.currentReport._id,this.currentSegment.id).subscribe(data=>{
        if(data && data.data){
          this.spinner.hide();
          this.dataList = this.toTextTableData(data.data);
        }
      },error=>{
        this.spinner.hide();
        console.log(error);        
      })
    }
    // if (currentGridBy == ConstantKeys.MARKET_BY_SEGMENT) {
    //   this.currentSegment = this.localStorageService.get(ConstantKeys.CURRENT_SEGMENT_SELECTED);
    //   this.segmentService.getSegmentDataInfoByKey(this.currentReport._id, this.currentSegment.id, currentGridBy)
    //     .subscribe(
    //       data => {

    //         this.segmentService.getReportInfoByKey(this.currentReport._id, 'me.segment,me.data,me.bifurcationLevel,me.geo_segment')
    //           .subscribe(
    //             segData => {
    //               data.forEach((d, i) => {
    //                 let keys = _.toLower(d.grid_key).split(' ').join('_').split('(').join('')
    //                   .split(')').join('').split('&').join('and').split('-').join('_');
    //                 // console.log(result);
    //                 if (keys) {
    //                   const result = _.find(segData.me.data, ['key', keys]);
    //                   // if (!result.text) {
    //                   this.getTextForViews(result, currentGridBy, segData.me);
    //                   // }
    //                   d.key = result.key,
    //                     d.value = result.value,
    //                     d.rowHeaders = result.rowHeaders,
    //                     d.metric = result.metric
    //                   d.custom_text = result.custom_text
    //                   d.text = result.text
    //                 }
    //               })
    //               const segs = _.filter(segData.me.segment, ['pid', this.currentSegment.id]);
    //               segs.forEach(item => {
    //                 const lv2segs = _.filter(segData.me.segment, ['pid', item.id]);
    //                 const parentApiKey = (this.currentSegment.name.toLowerCase() + '_' + _.toLower(item.name)).split(' ').join('_') + '_value';
    //                 let result = _.find(segData.me.data, ['key', parentApiKey]);
    //                 if (result) {
    //                   result.title = item.name.toUpperCase() + ' BY SUB-SEGMENTS';
    //                   this.getTextForViews(result, currentGridBy, segData.me);
    //                   data.push(result);
    //                 }
    //                 const apiKey = (this.currentSegment.name + '_' + _.toLower(item.name)).split(' ').join('_') + '_value';
    //                 result = _.find(segData.me.data, ['key', apiKey]);
    //                 if (result) {
    //                   result.title = item.name.toUpperCase() + ' BY SUB-SEGMENTS';
    //                   this.getTextForViews(result, currentGridBy, segData.me);
    //                   data.push(result);
    //                 }
    //                 lv2segs.forEach(lv2segsItem => {
    //                   const name = lv2segsItem.name.split('.').join('_');
    //                   const apiRegionKey = 'geography' + '_' + _.toLower(name).split(' ').join('_').split('-').join('_').split('(').join('').split(')').join('') + '_parent_value';
    //                   result = _.find(segData.me.data, ['key', apiRegionKey]);
    //                   if (result) {
    //                     result.title = lv2segsItem.name.toUpperCase() + ' BY REGIONS';
    //                     this.getTextForViews(result, currentGridBy, segData.me);
    //                     data.push(result);
    //                   }
    //                 });
    //                 // console.log("level2", lv2segs);
    //                 // console.log("data", data);

    //                 this.dataList = this.toTextTableData(data);
    //               });
    //             }
    //           );
    //         this._snackBar.open('Market Estimation data for segments fetched successfully.', 'Close', {
    //           duration: 5000,
    //         });
    //         this.spinner.hide();
    //       }, err => {
    //         console.log(err);
    //         this.spinner.hide();
    //         this._snackBar.open(err.message, 'Close', {
    //           duration: 5000,
    //         });
    //       }
    //     );
    // } 
    else {
      const currentRegion = this.localStorageService.get(ConstantKeys.CURRENT_REGIONS_SELECTED);
      this.segmentService.getDataByRegion(this.currentReport._id, currentRegion._id).subscribe(data => {
        console.log('data', data);
        this.dataList = this.toTextTableData(data.data);
        this.spinner.hide();
      }, error => {
        this.spinner.hide();
      });
      // this.segmentService.getReportInfoByKey(this.currentReport._id, 'me.segment,me.data,me.bifurcationLevel,me.geo_segment')
      //   .subscribe(data => {
      //     const regionData = _.find(data.me.geo_segment, ['_id', currentRegion._id]);
      //     let key = _.toLower(regionData.region).split(' ').join('_') + '_value';
      //     this.reportData = data;
      //     this.meData = data.me.data;
      //     const result = _.find(this.meData, ['key', key]);
      //     if (result) {
      //       result.title = regionData.region.toUpperCase() + ' BY COUNTRIES';
      //       this.getTextForViews(result, currentGridBy, data.me);
      //       this.dataList.push(result);
      //     }
      //     // Level 1 segments Bifurcation
      //     const segments = _.filter(data.me.segment, ['pid', '1']);
      //     segments.forEach(item => {
      //       this.addSegmentData(item, regionData);
      //       if (data.me.bifurcationLevel >= 2) {
      //         // Level 2 segments Bifurcation
      //         const level2Segments = _.filter(data.me.segment, ['pid', item.id]);
      //         level2Segments.forEach(level2SegmentItem => {
      //           this.addSegmentData(level2SegmentItem, regionData);
      //         });
      //       }
      //     });
      //     this.dataList = this.toTextTableData(this.dataList);
      //     this.spinner.hide();
      //   });
      // this.segmentService.getSegmentDataInfoByKey(this.currentReport._id, currentRegion._id, currentGridBy).subscribe(
      //   data => {
      //     console.log('this.dataList', this.dataList);
      //     this.dataList = [];
      //     if (!data.hasOwnProperty('errors')) {
      //       this.dataList = this.toTextTableData(data);
      //       console.log('this.data api', this.dataList);
      //     } else {
      //       this.dataList = [];
      //       this._snackBar.open('Market Estimation data for regions not found.', 'Close', {
      //         duration: 5000,
      //       });
      //     }
      //     this.spinner.hide();
      //   }, err => {
      //     console.log(err);
      //     this._snackBar.open(err.message, 'Close', {
      //       duration: 5000,
      //     });
      //     this.spinner.hide();
      //   }
      // );
    }
  }

  // addSegmentData(segment, regionData) {
  //   const regionKey = _.toLower(regionData.region).split(' ').join('_') + '_value';
  //   let key = _.toLower(segment.name).split(' ').join('_') + '_' + regionKey;
  //   const title = (regionData.region + ' BY ' + segment.name).toUpperCase();
  //   this.checkAndAddData(key, title);
  //   regionData.countries.forEach(country => {
  //     key = ((segment.name + ' ' + country.name + '_value').split(' ').join('_')).toLowerCase();
  //     const title = (country.name + ' BY ' + segment.name).toUpperCase();
  //     this.checkAndAddData(key, title);
  //   });
  // }
  //
  // checkAndAddData(key, title) {
  //   const data = _.find(this.meData, ['key', key]);
  //   if (data) {
  //     data.title = title;
  //     this.getTextForViews(data, this.currentGridBy, this.reportData.me);
  //     this.dataList.push(data);
  //   }
  // }

  toTextTableData(dataList: any[]) {
    return dataList.map(ele => {
      if (ele) {
        const value = ele.value;
        let rowHeader = [];
        if (value && value.length > 0) {
          const rowEle = value[0];
          rowHeader = ele.rowHeaders; // Object.keys(rowEle);
        }
        const formattedData = {
          title: ele.title,
          text: ele.text ? ele.text : '',
          custom_text: ele.custom_text ? ele.custom_text : '',
          key: ele.key,
          value,
          rowHeader
        };
        return formattedData;
      }
    });
  }

  onSave() {
    this.spinner.show();
    const reqObj = [];
    this.dataList.forEach((ele) => {
      reqObj.push({
        key: ele.key,
        text: ele.text,
        custom_text: ele.custom_text,
        title: ele.title
      });
    });

    this.segmentService.saveGridTextInfo(this.currentReport._id, this.dataList).subscribe(
      resp => {
        this.spinner.hide();
        this._snackBar.open('Data Saved successfully', 'Close', {
          duration: 2000,
        });
        this.router.navigateByUrl(`/me-report/${this.currentReport._id}/global-info/market-estimation/me-grid-data-info`);
      },
      err => {
        this._snackBar.open('Error occured while saving data', 'Close', {
          duration: 2000,
        });
      }
    );

  }

  toPreviousPage() {
    this._location.back();
  }

  getTextForViews(viewRecords, viewKey, meData) {
    let reportDetails = null;
    let templateStr = null;
    let compareArr = null;

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
      let rowHeaderCol = (ele.rowHeaders && ele.rowHeaders.length > 0) ? ele.rowHeaders[0] : null;

      if (ele.seg_name) {
        templateStr = textConstants[viewKey]
      }

      if (ele.seg_name && ele.region_name) {
        templateStr = textConstants[viewKey];
      }

      if (ele.value) {
        let metric = ele.metric || 'Mn';
        const tableData = ele.value;
        let maxCAGRValue = -1;
        let maxCAGRRowHeader = '';
        let cagrRowHeader = '';
        let cagr_value = -1;
        let baseYearVal = -1;
        let maxValueEndYear = '-1';
        let maxValueRowHeader = '';

        const CAGRColName = `CAGR (%) (${this.currentReport.me.start_year}-${this.currentReport.me.end_year})`;

        if (ele.metric) {
          switch (ele.metric) {
            case 'Mn':
              metric = 'Mn';
              break;
            case 'Kilo':
              metric = 'Kilo';
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
            if (parseFloat(rowRec[this.currentReport.me.base_year]) > parseFloat(baseYearVal.toString())) {
              maxValueEndYear = rowRec[this.currentReport.me.end_year];
              baseYearVal = rowRec[this.currentReport.me.base_year];
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
          baseYearVal = baseYearVal ? baseYearVal : 0;
          maxValueRowHeader = maxValueRowHeader ? maxValueRowHeader.replace(/_/ig, ' ') : '';
          maxCAGRValue = maxCAGRValue ? maxCAGRValue : 0;
        } catch (ex) {
          console.error(`Error in replacing constants with spaces. Error: ${ex}`);
        }

        if (cagrRowHeader == maxCAGRRowHeader) {
          let idx = templateStr.indexOf(' <mark>');
          templateStr = templateStr.substr(0, idx);
          let check = templateStr.includes('This market is projected to grow at a CAGR of <cagr_value>% during the forecast period from <year_range>.');
          if((viewKey == ConstantKeys.MARKET_BY_REGION && !check) || (viewKey == ConstantKeys.MARKET_BY_SEGMENT && !check)){
            templateStr = templateStr + `This market is projected to grow at a CAGR of ${cagr_value}% during the forecast period from ${this.currentReport.me.base_year+1} - ${this.currentReport.me.end_year}.`;
          }
        } else {
          templateStr = templateStr.replace('<mark>', '');
        }

        if(viewKey == ConstantKeys.MARKET_BY_REGION){
          maxValueRowHeader = _.find(compareArr,d=>{if(d && d.toLowerCase() == maxValueRowHeader.toLowerCase()){return d}})?maxValueRowHeader:maxValueRowHeader+' segment';
          maxCAGRRowHeader = _.find(compareArr,d=>{if(d && d.toLowerCase() == maxCAGRRowHeader.toLowerCase()){return d}})?maxCAGRRowHeader:maxCAGRRowHeader+' segment';
      }else{
          maxValueRowHeader = _.find(meData.geo_segment,['region',maxValueRowHeader])?maxValueRowHeader:maxValueRowHeader+' segment';
          maxCAGRRowHeader = _.find(meData.geo_segment,['region',maxCAGRRowHeader])?maxCAGRRowHeader:maxCAGRRowHeader+' segment';
      }
        let replacedStr = templateStr.replace(/<subseg_name_largest>/ig, maxValueRowHeader.replace(/_/ig, ' '));
        replacedStr = replacedStr.replace(/<report_name>/ig, this.currentReport.title);
        replacedStr = replacedStr.replace(/<seg_name>/ig, parentSectName);
        replacedStr = replacedStr.replace(/<end_year_value>/ig, maxValueEndYear);
        replacedStr = replacedStr.replace(/<end_year>/ig, this.currentReport.me.end_year);
        replacedStr = replacedStr.replace(/<base_year_value>/ig, baseYearVal);
        replacedStr = replacedStr.replace(/<base_year>/ig, this.currentReport.me.base_year);
        replacedStr = replacedStr.replace(/<cagr_value>/ig, cagr_value);
        replacedStr = replacedStr.replace(/<subseg_name_fastest>/ig, maxCAGRRowHeader);
        replacedStr = replacedStr.replace(/<CAGR_MAX_VALUE>/ig, maxCAGRValue);
        replacedStr = replacedStr.replace(/<year_range>/ig, `${this.currentReport.me.base_year + 1} - ${this.currentReport.me.end_year}`);
        replacedStr = replacedStr.replace(/<metric>/ig, metric);

        ele.text = replacedStr;

        // console.log(viewRecords.key, replacedStr);
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
}
