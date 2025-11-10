import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import * as tableGrid from './table_editor_grid';
import {TabDirective} from 'ngx-bootstrap/tabs';
import {Location} from '@angular/common';
import {Router} from '@angular/router';
import {LocalStorageService} from 'src/app/services/localsotrage.service';
import {ConstantKeys} from 'src/app/constants/mfr.constants';
import {MasterReportData} from 'src/app/models/me-models';
import {MatSnackBar} from '@angular/material';
import {SegmentService} from 'src/app/services/segment.service';
import {NgxSpinnerService} from 'ngx-spinner';
import {ExportToCsv} from 'export-to-csv';
import {PapaParseService} from 'ngx-papaparse';
import * as _ from 'lodash';
import {ToastrService} from 'ngx-toastr';

@Component({
  selector: 'app-tabulator-grid',
  templateUrl: './tabulator-grid.component.html',
  styleUrls: ['./tabulator-grid.component.scss']
})
export class TabulatorGridComponent implements OnInit {
  exportToCsvOptions = {
    fieldSeparator: ',',
    quoteStrings: '"',
    decimalSeparator: '.',
    useTextFile: false,
    useBom: true,
  };
  isCSVUploadValid = false;
  numberOfTableColumns: any;
  numberOfFactorTableColumns: any;
  currentReport: MasterReportData = null;
  @ViewChild('tabSet') tabSet: ElementRef;
  selectedTab;

  tabDataObj: { numberOfTabs: number, tabNames: [] };
  tabSections: { header: string, key: string }[];
  mec;
  finalSegData;
  tableDataMap;
  meData;
  regionData;
  metricsSelector = 'Mn';
  metrics = ['K', 'Mn', 'Bn'];
  tableTypeOption = 'VOL';
  finalAPICSVData: any;

  constructor(private localStorageService: LocalStorageService,
              private segmentService: SegmentService,
              private spinner: NgxSpinnerService,
              private papa: PapaParseService,
              private router: Router,
              private toastr: ToastrService,
              private _location: Location,
              private _snackBar: MatSnackBar) {
    this.spinner.show();
  }

  onSelect(data: TabDirective): void {
    this.selectedTab = {title: data.heading, field: data.id};
  }

  onRadioSelect() {
    try {
      if (this.tableTypeOption == 'WOVOL') {
        const tableKeys = Object.keys(this.tableDataMap);
        const removedKeys = [];

        tableKeys.forEach((tabKey) => {
          tabKey = tabKey.toLowerCase();
          if (tabKey.endsWith('volume')) {
            document.getElementById(tabKey).remove();

            // remove avgp tables from DOM
            const tmpStr = tabKey.replace('volume', 'avgp');
            document.getElementById(tmpStr).remove();

            removedKeys.push(tabKey);
            removedKeys.push(tmpStr);

            const tmpValStr = tabKey.replace('volume', 'value');
            const valObj = document.getElementById(tmpValStr);

            if (valObj.parentElement) {
              valObj.parentElement.classList.add('col-md-12');
            }

          }
        });

        removedKeys.forEach((key) => {
          delete this.tableDataMap[key];
        });

        document.getElementById('VOL').remove();
        document.getElementById('AVG').remove();
      }
    } catch (ex) {
      console.error('Exception in removing Volume and AvgPrice tables from DOM. Exp: ' + ex);
    }
  }

  ngOnInit() {
    // this.spinner.show();
    let isError = false;
    this.currentReport = this.localStorageService.get(ConstantKeys.CURRENT_REPORT);
    this.segmentService.getReportInfoByKey(this.currentReport._id, 'me,title')
      .subscribe(data => {
        data.me.segment.forEach(item => {
          item.name = item.name.split(' ').join('_').toLowerCase();
          item.name = item.name.split('-').join('_').toLowerCase();
          item.name = item.name.split('&').join('and').toLowerCase();
          item.name = item.name.split('(').join('').toLowerCase();
          item.name = item.name.split(')').join('').toLowerCase();
          item.name = item.name.split(',').join('').toLowerCase();
          item.name = item.name.split('.').join('').toLowerCase();
        });
        // data.me.geo_segment.forEach(item => {
        //   item.countries.forEach(c => {
        //     c.name = c.name.split('-').join('_').toLowerCase();
        //   })
        // });
        this.meData = data;
        console.log("this.meData",this.meData)
        if (this.meData && this.meData.me && this.meData.me.data && this.meData.me.data[0] && this.meData.me.data[0].metric) {
          this.metricsSelector = this.meData.me.data[0].metric;
        }
        // this.meData.me.geo_segment.forEach(item => {
        //   item.countries.forEach(cItem => {
        //     cItem.name = cItem.name.split(' ').join('_').toLowerCase();
        //   });
        // });

        if (!data.me) {
          isError = true;
          this._snackBar.open('Error occured while loading Market Estimation data', 'Close', {
            duration: 2000,
          });
        }

        if (!data.me.geo_segment || data.me.geo_segment.length < 1) {
          isError = true;
          this._snackBar.open('Error occured while loading Market Estimation Regions data', 'Close', {
            duration: 2000,
          });
        }

        if (!data.me.segment || data.me.segment.length < 1) {
          isError = true;
          this._snackBar.open('Error occured while loading Market Estimation segments data', 'Close', {
            duration: 2000,
          });
        }

        if (!isError) {
          this.mec = new tableGrid.MEGrid({
            startYear: this.meData.me.start_year,
            endYear: this.meData.me.end_year,
            baseYear: this.meData.me.base_year,
            bifurcationLevel: this.meData.me.bifurcationLevel
          }, this.meData.me.geo_segment, this.meData.me.segment, this.tableDataMap, this.meData.me.data);

          // segment Data formation fro processing
          this.finalSegData = this.mec.procesSegments(this.mec.segmentData);
          console.log("this.finalSegData", this.finalSegData);
          // Tabs formation
          this.tabDataObj = this.mec.constructTabData(this.finalSegData);
          console.log("this.tabDataObj",this.tabDataObj)
          this.tabSections = this.tabDataObj.tabNames;
          console.log("this.tabSections", this.tabSections);
          this.regionData = this.mec.processRegionData(this.mec.regionData);
          console.log("this.regionData",this.regionData)
          setTimeout(() => {
            this.tableDataMap = this.mec.defineTables(this.mec.dateData, this.regionData, this.finalSegData, this.tabDataObj);

            if (this.meData.me.data && this.meData.me.data.length > 0) {
              let startYear = this.meData.me.start_year;
              let endYear = this.meData.me.end_year;
              let baseYear = this.meData.me.base_year;

              for (let i = 0; i < this.meData.me.data.length; i++) {
                const ele = this.meData.me.data[i];

                if (null !== ele && null !== ele.value) {

                  if (Array.isArray(ele.value) && ele.value.length > 0) {
                    console.log("ele.value",ele.value)
                    console.log("ele.value.length",ele.value.length)
                    if (ele.key.includes('geography_parent_value_factor')) {
                      this.mec.factorYearDataVal = ele.value[0];
                    } else if (ele.key.includes('geography_parent_volume_factor')) {
                      this.mec.factorYearDataVol = ele.value[0];
                      console.log(this.mec.factorYearDataVal,this.mec.factorYearDataVol)
                    }
                  }

                  const tab = this.tableDataMap[ele.key] || null;
                  if (tab) {
                    ele.value.forEach(dd => {
                      dd[`CAGR (%) (${startYear}-${endYear})`] = this.setCAGRValue(dd);
                    })

                    //keep the below code for table key value editing 
                    // let key = _.find(ele.rowHeaders, (d) => {
                    //   return ele.key.includes(d)
                    // })
                    // if (key) {
                      // ele.value.forEach((dd, i) => {
                        // let tempKey = _.find(_.keys(tab.rowManager.activeRows[i].data), (d) => {
                        //   return ele.key.includes(d)
                        // })
                        // if (tempKey) {
                        //   dd[key] = tab.rowManager.activeRows[i].data[tempKey]
                        // }
                        // if(dd[key] == 'Total'){
                        // dd[`CAGR (%) (${startYear}-${endYear})`] = this.setCAGRValue(dd);
                        // }
                      // })
                    // }
                    tab.setData(ele.value);
                    tab.redraw();
                  }
                }
              }
            }
            // this.spinner.hide();
          }, 500);
        }
        if (this.tabSections && this.tabSections[0]) {
          this.selectedTab = {title: this.tabSections[0].header, field: this.tabSections[0].key};
        }
      });
  }

  setCAGRValue(item) {
    const period = this.meData.me.end_year - (this.meData.me.base_year + 1);
    return ((Math.pow((item[this.meData.me.end_year] / item[this.meData.me.base_year + 1]), ((1 / period))) - 1) * 100).toFixed(2);
  }


  ngAfterViewInit() {
    // Tables under each tab
    if (this.mec) {
      this.tableDataMap = this.mec.defineTables(this.mec.dateData, this.mec.regionData, this.finalSegData, this.tabDataObj);
    }
    this.spinner.hide();
  }

  fileChangeListener($event) {
    const file: File = $event.target.files[0];
    let fileType = '';
    if (file && file.name) {
      fileType = file.name.substr((file.name.lastIndexOf('.') + 1));
    }
    if ($event.target.files.length != 0) {
      if (file.type == 'text/csv' || fileType == 'csv') {
        this.papa.parse(file, {
          complete: (results) => {
            this.readCSVData(results.data);
            this.isCSVUploadValid = true;
          }
        });
        this.toastr.success('File attached successfully');
      } else {
        this.toastr.error('Please attach CSV files only');
      }
    }
  }

  readCSVData(data) {
    let sendingTableData = this.mec.getGridData(this.tableDataMap, this.metricsSelector);
    this.derieveCustomGridKeysData(sendingTableData, 'volume');
    this.derieveCustomGridKeysData(sendingTableData, 'value');
    if (this.selectedTab.field == 'geography_parent') {
      const noOfColumns = Object.keys(this.tableDataMap.geography_parent_value.getData()[0]).length;
      sendingTableData = this.setCSVFactorData(sendingTableData, noOfColumns, data);
      sendingTableData = this.setCSVGeographyParentData(sendingTableData, noOfColumns, data);
    } else if (this.selectedTab.field.startsWith('geography')) {
      const noOfColumns = parseInt(String(data[1].length / 2));
      const segName = this.selectedTab.title.replace('Geography', '').trim().toLowerCase();
      const segData = _.find(this.meData.me.segment, ['name', segName]);
      const segmentsArray = _.filter(this.meData.me.segment, ['pid', segData.id]);
      const segmentRows = _.map(segmentsArray, 'name');
      const formattedCSVTables = this.splitAndGetTables(data);
      // const formattedCSVTables = _.chunk(data, (segmentRows.length + 3));
      formattedCSVTables.forEach(table => {
        const tableHeader = table[0][0];
        const valueData = _.find(sendingTableData, ['key', tableHeader + '_value']);
        if (valueData && valueData.value) {
          valueData.value.forEach(valueItem => {
            const csvRow = _.find(table, [[0], valueItem[tableHeader]]);
            if (valueData.rowHeaders && csvRow) {
              for (let j = 0; j < valueData.rowHeaders.length; j++) {
                if (valueData.rowHeaders[j]) {
                  valueItem[valueData.rowHeaders[j]] = csvRow[j].trim().replace(/,/g, '');
                }
              }
            } else {
              this.toastr.error('CSV titles are not matching');
            }
          });
          _.remove(sendingTableData, (d) => d.key === tableHeader + '_value');
          sendingTableData.push(valueData);
        }
      });
    } else if (this.selectedTab.field.endsWith('_parent')) {
      const segName = this.selectedTab.title.replace('Parent', '').trim();
      const segData = _.find(this.meData.me.segment, ['name', segName]);
      const segmentsArray = _.filter(this.meData.me.segment, ['pid', segData.id]);
      const parentFormattedCSVTables = this.splitAndGetTables(data);
      // const parentFormattedCSVTables = _.chunk(data, (segmentsArray.length + 3));
      parentFormattedCSVTables.forEach(table => {
        const tableHeader = table[0][0];
        const valueData = _.find(sendingTableData, ['key', tableHeader + '_value']);
        if (valueData && valueData.value) {
          valueData.value.forEach(valueItem => {
            const csvRow = _.find(table, [[0], valueItem[tableHeader]]);
            if (valueData.rowHeaders) {
              for (let j = 0; j < valueData.rowHeaders.length; j++) {
                if (csvRow) {
                  valueItem[valueData.rowHeaders[j]] = csvRow[j].trim().replace(/,/g, '');
                }
              }
            }
          });
        }
        sendingTableData = _.compact(sendingTableData);
        _.remove(sendingTableData, (d) => d.key === tableHeader + '_value');
        sendingTableData.push(valueData);
      });
    }
    sendingTableData = _.compact(sendingTableData);
    this.finalAPICSVData = sendingTableData;
  }

  splitAndGetTables(data) {
    let res = [];
    const indexes = [0];
    data.forEach((rowItem, index) => {
      if (rowItem && rowItem[0] === ' ') {
        indexes.push(index);
      }
    });
    for (let i = 0; i <= indexes.length; i++) {
      if (indexes[i] == 0) {
        res.push(data.slice(indexes[i], indexes[i + 1]));
      } else {
        res.push(data.slice(indexes[i] + 1, indexes[i + 1]));
      }
    }
    return res;
  }

  setCSVGeographyParentData(sendingTableData, noOfColumns, data) {
    const regions = _.map(this.meData.me.geo_segment, 'region');
    regions.forEach(region => {
      sendingTableData = this.setRegionRowData(sendingTableData, noOfColumns, data, region);
    });
    return sendingTableData;
  }

  setRegionRowData(sendingTableData, noOfColumns, data, region) {
    const geoData = _.find(sendingTableData, ['key', 'geography_parent_value']);
    // For getting the geography parent row
    const geoDataTotalRow = _.find(data, [[0], 'Total']);
    geoData.value.forEach(item => {
      if (item.geography_parent == region) {
        const csvRegionRow = _.find(data, [[0], region]);
        for (let i = 1; i <= geoData.rowHeaders.length; i++) {
          if (geoData.rowHeaders[i]) {
            if (csvRegionRow[i]) {
              item[geoData.rowHeaders[i]] = csvRegionRow[i].trim().replace(/,/g, '');
            }
          }
        }
      } else if (item.geography_parent == 'Total') {
        for (let i = 1; i <= geoData.rowHeaders.length; i++) {
          if (geoDataTotalRow[i]) {
            item[geoData.rowHeaders[i]] = geoDataTotalRow[i].trim().replace(/,/g, '');
          }
        }
      }
    });
    const regionValueKey = _.toLower(region).split(' ').join('_');
    const valueKey = _.toLower(region).split(' ').join('_') + '_value';
    const volumeKey = _.toLower(region).split(' ').join('_') + '_volume';
    const valueData = _.find(sendingTableData, ['key', valueKey]);
    const volumeData = _.find(sendingTableData, ['key', volumeKey]);
    // Reading Factor volumes
    valueData.value.forEach(valueItem => {
      let csvRow = [];
      const searchStr = valueItem[regionValueKey] == 'Total' ? region : valueItem[regionValueKey];
      csvRow = _.find(data, [[0], searchStr]);
      for (let i = 1; i <= valueData.rowHeaders.length; i++) {
        if (valueData.rowHeaders[i]) {
          if (csvRow[i]) {
            valueItem[valueData.rowHeaders[i]] = csvRow[i].trim().replace(/,/g, '');
          }
        }
      }
    });
    _.remove(sendingTableData, (d) => d.key === 'geography_parent_value');
    _.remove(sendingTableData, (d) => d.key === valueKey);
    // _.remove(sendingTableData, (d) => d.key === 'geography_parent_volume_factor');
    sendingTableData.push(valueData);
    sendingTableData.push(geoData);
    return sendingTableData;
  }

  setCSVFactorData(sendingTableData, noOfColumns, data) {
    // Reading Factor Values
    const valueData = _.find(sendingTableData, ['key', 'geography_parent_value_factor']);
    // Reading Factor volumes
    const volumeData = _.find(sendingTableData, ['key', 'geography_parent_volume_factor']);
    data[1].forEach((item, index) => {
      if (index < noOfColumns) {
        // For value factor
        if (data[0][index]) {
          valueData.value[0][[data[0][index]]] = item.trim().replace(/,/g, '');
        }
      } else if (index > (noOfColumns + 1)) {
        // For volume factor
        if (data[0][index]) {
          volumeData.value[0][[data[0][index]]] = item.trim().replace(/,/g, '');
        }
      }
    });
    _.remove(sendingTableData, (d) => d.key === 'geography_parent_value_factor');
    _.remove(sendingTableData, (d) => d.key === 'geography_parent_volume_factor');
    sendingTableData.push(valueData);
    sendingTableData.push(volumeData);
    return sendingTableData;
  }

  generateWithoutVolumeCSVFile(tab) {
    const tabTablesData = [];
    tabTablesData.push(this.tableDataMap[tab.key + '_value']);
    if (tab.key == 'geography_parent') {    // geo parent tab
      const regions = _.map(this.meData.me.geo_segment, 'region');
      regions.forEach(item => {
        const key = _.toLower(item).split(' ').join('_') + '_value';
        if (this.tableDataMap[key]) {
          tabTablesData.push(this.tableDataMap[key]);
        }
      });
    } else if (tab.key.startsWith('geography')) {    // for Geography_<seg_name> tabs
      const segName = tab.header.replace('Geography', '').trim().toLowerCase();
      this.meData.me.geo_segment.forEach(gitem => {
        const tableKey = (segName + ' ' + gitem.region.toLowerCase() + '_value').split(' ').join('_');
        if (this.tableDataMap[tableKey]) {
          tabTablesData.push(this.tableDataMap[tableKey]);
        }
        if (gitem.countries) {
          gitem.countries.forEach(c => {
            const countryKey = (segName + ' ' + c.name.toLowerCase() + '_value').split(' ').join('_');
            if (this.tableDataMap[countryKey]) {
              tabTablesData.push(this.tableDataMap[countryKey]);
            }
          });
        }
      });
    } else if (tab.key.endsWith('_parent')) {  // for <seg_name>_Parent tabs
      const segName = tab.header.replace('Parent', '').trim();
      const segData = _.find(this.meData.me.segment, ['name', segName]);
      const segmentsArray = _.filter(this.meData.me.segment, ['pid', segData.id]);
      segmentsArray.forEach(sA => {
        const segmentKey = (segName + ' ' + sA.name.toLowerCase() + '_value').split(' ').join('_');
        if (this.tableDataMap[segmentKey]) {
          tabTablesData.push(this.tableDataMap[segmentKey]);
        }
      });
    }

    let table1Data = [];
    const numberOfColumns = Object.keys(tabTablesData[0].getData()[0]).length;
    const blankRow = [];
    for (let i = 0; i < (2 * numberOfColumns + 1); i++) {
      blankRow.push(' ');
    }


    const csvRowsData = [];
    tabTablesData.forEach((table) => {
      const header = this.shiftArrayElements(Object.keys(table.getData()[0]));
      csvRowsData.push(header);
      table1Data = this.shiftArrayElements(Object.values(table.getData()));
      table1Data.forEach((td1) => {
        csvRowsData.push(this.shiftArrayElements(Object.values(td1)));
      });
      csvRowsData.push(blankRow);
    });

    if (tab.key == 'geography_parent') {    // geo parent tab
      const valueFactorData = this.tableDataMap[tab.key + '_value_factor'].getData();
      const valueFactorDataArray = this.filterFactorArray(Object.keys(valueFactorData[0]), numberOfColumns);
      const valueFactorValuesArray = this.filterFactorValuesArray(Object.values(valueFactorData[0]), numberOfColumns);
      csvRowsData.unshift(blankRow);
      csvRowsData.unshift(valueFactorValuesArray);
      csvRowsData.unshift(valueFactorDataArray);
    }

    this.generateCSVFile(csvRowsData);
  }

  downloadTabCSV(tab) {
    if (this.tableTypeOption == 'WOVOL') {
      this.generateWithoutVolumeCSVFile(tab);
    } else {
      const tabTablesData = [];
      tabTablesData.push(this.tableDataMap[tab.key + '_value']);
      tabTablesData.push(this.tableDataMap[tab.key + '_volume']);
      if (tab.key == 'geography_parent') {    // geo parent tab
        const regions = _.map(this.meData.me.geo_segment, 'region');
        regions.forEach(item => {
          let key = _.toLower(item).split(' ').join('_') + '_value';
          if (this.tableDataMap[key]) {
            tabTablesData.push(this.tableDataMap[key]);
          }
          key = _.toLower(item).split(' ').join('_') + '_volume';
          if (this.tableDataMap[key]) {
            tabTablesData.push(this.tableDataMap[key]);
          }
        });
      } else if (tab.key.startsWith('geography')) {    // for Geography_<seg_name> tabs
        const segName = tab.header.replace('Geography', '').trim();
        const furtherBifurcationTableNames = [segName];
        if (this.meData.me.bifurcationLevel && this.meData.me.bifurcationLevel > 1) {
          const segData = _.find(this.meData.me.segment, ['name', segName]);
          const segmentsArray = _.filter(this.meData.me.segment, ['pid', segData.id]);
          segmentsArray.forEach(segmentsArrayItem => {
            const childData = _.filter(this.meData.me.segment, ['pid', segmentsArrayItem.id]);
            console.log('childData', childData);
            if (childData && childData.length) {
              furtherBifurcationTableNames.push(segmentsArrayItem.name);
            }
          });
        }
        furtherBifurcationTableNames.forEach(fBTNameItem => {
          this.meData.me.geo_segment.forEach(gitem => {
            let tableKey = (fBTNameItem.toLowerCase() + ' ' + gitem.region.toLowerCase() + '_value').split(' ').join('_');
            if (this.tableDataMap[tableKey]) {
              tabTablesData.push(this.tableDataMap[tableKey]);
            }
            tableKey = (fBTNameItem.toLowerCase() + ' ' + gitem.region.toLowerCase() + '_volume').split(' ').join('_');
            if (this.tableDataMap[tableKey]) {
              tabTablesData.push(this.tableDataMap[tableKey]);
            }
            if (gitem.countries) {
              gitem.countries.forEach(c => {
                let countryKey = (fBTNameItem.toLowerCase() + ' ' + c.name.toLowerCase() + '_value').split(' ').join('_');
                if (this.tableDataMap[countryKey]) {
                  tabTablesData.push(this.tableDataMap[countryKey]);
                }
                countryKey = (fBTNameItem.toLowerCase() + ' ' + c.name.toLowerCase() + '_volume').split(' ').join('_');
                if (this.tableDataMap[countryKey]) {
                  tabTablesData.push(this.tableDataMap[countryKey]);
                }
              });
            }
          });
        });
      } else if (tab.key.endsWith('_parent')) {  // for <seg_name>_Parent tabs
        const segName = tab.header.replace('Parent', '').trim();
        const segData = _.find(this.meData.me.segment, ['name', segName]);
        const segmentsArray = _.filter(this.meData.me.segment, ['pid', segData.id]);
        segmentsArray.forEach(sA => {
          let segmentKey = (segName.toLowerCase() + ' ' + sA.name.toLowerCase() + '_value').split(' ').join('_');
          if (this.tableDataMap[segmentKey]) {
            tabTablesData.push(this.tableDataMap[segmentKey]);
          }
          segmentKey = (segName.toLowerCase() + ' ' + sA.name.toLowerCase() + '_volume').split(' ').join('_');
          if (this.tableDataMap[segmentKey]) {
            tabTablesData.push(this.tableDataMap[segmentKey]);
          }
        });
      }
      const csvRowsData = [];
      const numberOfColumns = Object.keys(tabTablesData[0].getData()[0]).length;
      const blankRow = [];
      for (let i = 0; i < (2 * numberOfColumns + 1); i++) {
        blankRow.push(' ');
      }

      let table1Data = [];
      let pushRow;
      tabTablesData.forEach((table, tableIndex) => {
        if (tableIndex % 2 == 0) {
          const headerRow1 = this.shiftArrayElements(Object.keys(table.getData()[0]));
          const header = headerRow1.concat([' ']).concat(headerRow1);
          csvRowsData.push(header);
          table1Data = this.shiftArrayElements(Object.values(table.getData()));
          table1Data.forEach((td1, table1DataIndex) => {
            const ro1 = this.shiftArrayElements(Object.values(td1));
            const ro2 = this.shiftArrayElements(Object.values(tabTablesData[tableIndex + 1].getData()[table1DataIndex]));
            pushRow = ro1.concat([' ']).concat(ro2);
            csvRowsData.push(pushRow);
          });
        } else {
          csvRowsData.push(blankRow);
        }
      });
      if (tab.key == 'geography_parent') {    // geo parent tab
        const valueFactorData = this.tableDataMap[tab.key + '_value_factor'].getData();
        const valueFactorDataArray = this.filterFactorArray(Object.keys(valueFactorData[0]), numberOfColumns);
        const volumeFactorData = this.tableDataMap[tab.key + '_volume_factor'].getData();
        const volumeFactorDataArray = this.filterFactorArray(Object.keys(volumeFactorData[0]), numberOfColumns);
        const valueFactorValuesArray = this.filterFactorValuesArray(Object.values(valueFactorData[0]), numberOfColumns);
        const volumeFactorValuesArray = this.filterFactorValuesArray(Object.values(volumeFactorData[0]), numberOfColumns);
        csvRowsData.unshift(blankRow);
        csvRowsData.unshift((valueFactorValuesArray.concat([' ']).concat(volumeFactorValuesArray)));
        csvRowsData.unshift((valueFactorDataArray.concat([' ']).concat(volumeFactorDataArray)));
      }
      this.generateCSVFile(csvRowsData);
    }
  }

  filterFactorArray(array: any, numberOfColumns: any) {
    let removeIndex = array.indexOf('title');
    if (removeIndex > -1) {
      array.splice(removeIndex, 1);
    }
    removeIndex = array.indexOf('headerSort');
    if (removeIndex > -1) {
      array.splice(removeIndex, 1);
    }
    array.unshift('Factor');
    const len = array.length;
    for (let i = 0; i < (numberOfColumns - len); i++) {
      array.push(' ');
    }
    // array.unshift(' ');
    return array;
  }

  filterFactorValuesArray(array: any, numberOfColumns: any) {
    let replaceIndex = array.indexOf('Factor');
    if (replaceIndex > -1) {
      array.splice(replaceIndex, 1);
    }
    replaceIndex = array.indexOf(false);
    if (replaceIndex > -1) {
      array[replaceIndex] = '';
    }
    replaceIndex = array.indexOf('factor');
    if (replaceIndex > -1) {
      array.splice(replaceIndex, 1);
    }

    array.unshift(' ');
    const len = array.length;
    for (let i = 0; i < (numberOfColumns - len); i++) {
      array.push(' ');
    }
    // array.unshift(' ');
    return array;
  }

  generateCSVFile(data: any) {
    const csvExporter = new ExportToCsv(this.exportToCsvOptions);
    csvExporter.generateCsv(data);
  }

  shiftArrayElements(array) {
    let indexShift = array.length - 3;
    array.unshift(array.splice(indexShift, 1)[0]);
    indexShift = array.length - 3;
    array.unshift(array.splice(indexShift, 1)[0]);
    return array;
  }

  onSubmit() {
    this.spinner.show();
    const tableData = this.mec.getGridData(this.tableDataMap, this.metricsSelector);
    console.log('tableDataa', tableData);
    this.derieveCustomGridKeysData(tableData, 'volume');
    this.derieveCustomGridKeysData(tableData, 'value');
    this.saveDataToAPI(tableData);
  }

  saveDataToAPI(tableData) {
    this.spinner.show();
    // console.log('tableData', tableData);
    tableData.forEach(item => {
      if (item && item.value) {
        item.value.forEach(dd => {
          dd[`CAGR (%) (${this.meData.me.start_year}-${this.meData.me.end_year})`] = this.setCAGRValue(dd);
        });
      }
    });
    this.segmentService.saveSegmentGridInfo(this.currentReport._id, tableData).subscribe(
      resp => {
        this._snackBar.open('Market Estimation sheet data Saved successfully', 'Close', {
          duration: 2000,
        });
        this.spinner.hide();
        this.router.navigateByUrl(`/me-report/${this.currentReport._id}/global-info/market-estimation/me-grid-section`);
      },
      err => {
        this.spinner.hide();
        // ENHANCE: Read ERR & show data
        this._snackBar.open('Error occured while saving Market Estimation sheet data', 'Close', {
          duration: 2000,
        });
      }
    );
  }


  derieveCustomGridKeysData = function (tableData, suffix) {
    const subSegRegArr = [];

    for (let i = 0; i < this.mec.segmentData.length; i++) {
      const segEle = this.mec.segmentData[i];
      const childs = _.filter(this.mec.segmentData, ['pid', segEle.id])
      if (segEle.pid === '1' || (childs && childs.length)) {
        for (let j = 0; j < this.mec.regionData.length; j++) {
          const ele = this.mec.regionData[j].region;
          const regName = ele.replace(/ /ig, '_');
          const gridKey = `${segEle.name}_${regName}_${suffix}`.toLowerCase();

          const rowHeaders = [];
          if (this.tableDataMap[gridKey]) {
            this.tableDataMap[gridKey].getColumns().forEach((ele) => {
              rowHeaders.push(ele.getField());
            });
            subSegRegArr.push({
              regName,
              segName: segEle.name,
              value: this.tableDataMap[gridKey].getData(),
              rowHeaders
            });
          }
        }
      }
    }

    const res = {};

    for (let i = 0; i < subSegRegArr.length; i++) {
      const ele = subSegRegArr[i];
      let resRec = {};

      // column name to be looked up for in table
      // let colName = ele.key.replace(/_volume/ig, '');
      // colName = colName.replace(/_value/ig, '');
      const regKey = ele.regName.replace(/ /ig, '_');
      let colName = `${ele.segName.toLowerCase()}_${regKey}`;
      colName = colName.toLowerCase();

      // for each table records fetch make trasnpose and put in diff map (res)
      for (let j = 0; j < ele.value.length; j++) {
        resRec = {};
        const tabEle = ele.value[j];
        resRec = tabEle;
        const val = tabEle[colName];
        resRec['' + val] = ele.regName;
        delete resRec['' + colName];

        if (res['' + val]) {
          res['' + val].push(resRec);
        } else {
          res['' + val] = [resRec];
        }
      }
    }

    // 'Total' column is not required in new table
    delete res['Total'];
    let rh = [];
    let CAGR_header;

    // for computing total of newly added records
    for (const key in res) {
      const totRec = {};
      for (let i = 0; i < res[key].length; i++) {
        const rec = res[key][i];
        for (const col in rec) {
          totRec['' + col] = parseFloat(rec[col]) + parseFloat(totRec[col] ? totRec[col] : 0);
        }
        totRec['' + key] = 'Total';

        // for forming rowheader below
        rh = Object.keys(rec);
        CAGR_header = rh.filter((e) => {
          return (e.startsWith('CAGR (%)'));
        }) || [];
        CAGR_header = CAGR_header.length > 0 ? CAGR_header[0] : '';
        rh = rh.filter((e) => {
          return (parseInt(e));
        });
      }
      res['' + key].push(totRec);
    }

    for (const subSeg in res) {
      if (res.hasOwnProperty(subSeg)) {
        const rowHeaders = [subSeg, '% Split'].concat(rh).concat(['Assumed CAGR (%)', CAGR_header]);
        const apiKey = `geography_${this.segmentService.replacedSegmentSymbols(subSeg.toLowerCase())}_parent_${suffix}`;
        const meKeyData = _.find(this.meData.me.data, ['key', apiKey])
        tableData.push({
          key: apiKey,
          value: res[subSeg],
          rowHeaders,
          metric: this.metricsSelector,
          custom_text: (meKeyData && meKeyData.custom_text) ? meKeyData.custom_text : '',
        });
      }
    }
  };

  toPreviousPage() {
    this._location.back();
  }

  toNextPage() {
    if (!(this.meData && this.meData.me && this.meData.me.data && this.meData.me.data.length)) {
      console.log('saving blank data');
      this.onSubmit();
    } else {
      this.router.navigateByUrl('/me-report/' + this.currentReport._id + '/global-info/market-estimation/me-grid-section');
    }
  }


}
