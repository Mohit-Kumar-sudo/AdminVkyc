import {Component, OnInit} from '@angular/core';
import {TableInputColumnMetaData} from 'src/app/components/core/table-input/table-input.component';
import {ChartDataSets} from 'chart.js';
import {Label} from 'ng2-charts';
import {LocalStorageService} from 'src/app/services/localsotrage.service';
import {ConstantKeys} from 'src/app/constants/mfr.constants';
import {Location} from '@angular/common';
import {TABLE} from 'src/app/models/secondary-research-models';
import {TextInputComponent} from 'src/app/components/core/text-input/text-input.component';
import {MatDialog} from '@angular/material';
import {FinancialOverview} from 'src/app/models/company-profile-model';

@Component({
  selector: 'app-company-fo-section-new',
  templateUrl: './company-fo-section-new.component.html',
  styleUrls: ['./company-fo-section-new.component.scss']
})
export class CompanyFoSectionNewComponent implements OnInit {

  selectedCurrency = 'USD';
  currencyList = ['USD', 'INR'];
  selectedSuffix = 'Mn';
  suffixList = ['Kilo', 'Mn', 'Bn', 'Tn'];
  selectedFoSection: FinancialOverview = null;

  // table options
  colMetaData: TableInputColumnMetaData[] = [];
  dataStore: any[] = [];
  renderTable = false;

  // chart options
  labelX = '';
  chartLabels: Label[] = [];
  chartData: ChartDataSets[] = [];

  constructor(
    private localStorageService: LocalStorageService,
    private dialog: MatDialog,
    private _location: Location,
  ) {
    this.selectedFoSection = this.localStorageService.get(ConstantKeys.CURRENT_COMPANY_FO_SECTION) as FinancialOverview;
  }

  toPreviousPage() {
    this._location.back();
  }


  ngOnInit() {
    const fromYear = new Date(this.selectedFoSection.from_year);
    const toYear = new Date(this.selectedFoSection.to_year);
    const noOfUnits = this.selectedFoSection.brkup_no;
    const sectionName = this.selectedFoSection.name;
    const content = ((typeof this.selectedFoSection.content === 'string') && this.selectedFoSection.content != '') ? JSON.parse(this.selectedFoSection.content) : this.selectedFoSection.content || {};
    // I. years handling
    const startYear = fromYear.getFullYear();
    const endYear = toYear.getFullYear();
    const yearList = Array();
    for (let i = startYear; i <= endYear; i++) {
      yearList.push(i.toString());
    }
    console.log('yearList', yearList);

    // II. section name handling
    this.labelX = sectionName;
    const mainHeader = this.labelX + '/Years';

    // III. data or content handling
    // a. putting the already availabel content
    if (Object.keys(content).length > 0) {
      const contentData = [];
      if (content.data && content.data.dataStore) {
        content.data.dataStore.forEach(item => {
          const obj = {};
          yearList.forEach(yItem => {
            if (item[yItem]) {
              obj[yItem] = item[yItem];
            }
            obj['rowHeader'] = item.rowHeader;
          });
          contentData.push(obj);
        });
      }
      this.dataStore = contentData || [];
      this.selectedCurrency = this.selectedFoSection.currency;
      this.selectedSuffix = this.selectedFoSection.metric;
    } else {
      this.dataStore = [];
    }
    this.dataStore = this.dataStore.slice(0, this.selectedFoSection.brkup_no);
    // b. prepare columns for table rendering
    this.colMetaData.push({header: mainHeader, name: 'rowHeader', type: 'text'});
    for (const element of yearList) {
      this.colMetaData.push({
        name: element,
        header: element,
        type: 'number'
      });
    }

    // c - prepare empty row object
    const rowObject: { rowHeader?: string } = {};
    for (const element of yearList) {
      rowObject[element] = '';
    }
    console.log('this.dataStore =>', this.dataStore);
    // d. if data store is empty and content not available then create blank records ==  brkup number
    if (this.dataStore.length < 1) {
      // d.1 - push records equal to break numbers
      for (let i = 0; i < noOfUnits; i++) {
        rowObject.rowHeader = sectionName + '-' + i;
        this.dataStore.push(Object.assign({}, rowObject));
      }
    } else {
      const currentLen = this.dataStore.length;
      const extraRequiredRows = noOfUnits - currentLen;
      if (this.dataStore.length < noOfUnits) {
        for (let i = 0; i < extraRequiredRows; i++) {
          rowObject.rowHeader = sectionName + '-' + (currentLen + i);
          this.dataStore.push(Object.assign({}, rowObject));
        }
      }

    }

    this.renderTable = true;
  }

  addText(dataRow) {
    // 'undefined' data handling before opening text-box
    if (!dataRow.hasOwnProperty('content') && !dataRow.content) {
      dataRow.content = '';
    }

    const dialogRef = this.dialog.open(TextInputComponent, {
      width: '60%',
      data: dataRow.content,
      disableClose: true,
    });
    dialogRef.afterClosed().subscribe(result => {
      dataRow.content = result;
    });
  }

  submitFoSectionInput() {
    const tableData = {
      type: TABLE,
      data: {
        dataStore: this.dataStore,
      }
    };
    this.selectedFoSection.content = JSON.stringify(tableData);
    this.selectedFoSection.currency = this.selectedCurrency;
    this.selectedFoSection.metric = this.selectedSuffix;
    this.updateFoList(this.selectedFoSection);
    this.toPreviousPage();
  }

  updateFoList(element: FinancialOverview) {
    const foSectionList: FinancialOverview[] = this.localStorageService.get(ConstantKeys.CURRENT_COMPANY_FO_SECTION_LIST);
    if (foSectionList) {
      for (const ele of foSectionList) {
        if (ele.key === element.key) {
          const indexOf = foSectionList.indexOf(ele);
          foSectionList[indexOf] = element;
        }
      }
      this.localStorageService.set(ConstantKeys.CURRENT_COMPANY_FO_SECTION_LIST, foSectionList);
    }
  }

}
