import { Component, OnInit, QueryList, ElementRef, ViewChildren, Input, Output, EventEmitter } from '@angular/core';
import { SecondarySectionModel, ReportDataElement, TEXT, TABLE, IMAGE, PIE, BAR, SecondaryDataElement, } from 'src/app/models/secondary-research-models';

import { TextInputComponent } from '../../core/text-input/text-input.component';
import { TableInputComponent } from '../../core/table-input/table-input.component';
import { PieChartInputComponent } from '../../core/pie-chart-input/pie-chart-input.component';
import { ImageInputComponent } from '../../core/image-input/image-input.component';
import { BarChartInputComponent } from '../../core/bar-chart-input/bar-chart-input.component';

import * as pieConfig from '../../core/pie-chart-input/pie-chart-configs';
import * as barConfig from '../../core/bar-chart-input/bar-chart-configs';
import { MatDialog } from '@angular/material';
import { ReportSectionService } from 'src/app/services/report-section.service';
import { Location } from '@angular/common';
import { Ng4LoadingSpinnerService } from 'ng4-loading-spinner';
import { LocalStorageService } from 'src/app/services/localsotrage.service';
import { CompanyProfileService } from 'src/app/services/company-profile.service';
import { ConstantKeys } from 'src/app/constants/mfr.constants';
import { CompanyProfile } from 'src/app/models/company-profile-model';
import { ReportService } from 'src/app/services/report.service';
import * as _ from 'lodash';
import { NgxSpinnerService } from 'ngx-spinner';


@Component({
  selector: 'app-cp-secondary-element',
  templateUrl: './cp-secondary-element.component.html',
  styleUrls: ['./cp-secondary-element.component.scss']
})
export class CpSecondaryElementComponent implements OnInit {

  @ViewChildren("commentDiv") commentDivs: QueryList<ElementRef>;

  @Input()
  secondarySectionModel: SecondarySectionModel;

  @Input()
  sectionName: string;

  @Output()
  dataChange = new EventEmitter();

  secondaryInputData: ReportDataElement[] = [];
  selectedEle: ReportDataElement = null;

  pieChartType = pieConfig.pieChartType;
  pieChartOptions = pieConfig.pieChartOptions;
  pieChartPlugins = pieConfig.pieChartPlugins;
  pieChartColors = pieConfig.pieChartColors;
  pieChartLegend = pieConfig.pieChartLegend;

  barChartType = barConfig.barChartType;
  barChartOptions = barConfig.barChartOptions;
  barChartPlugins = barConfig.barChartPlugins;
  barChartLegend = barConfig.barChartLegend;
  currentReport: any;
  currentCompany: any;

  constructor(
    private localStorageService: LocalStorageService,
    private reportService: ReportService,
    private companyProfileService: CompanyProfileService,
    private reportSectionService: ReportSectionService,
    private spinner: NgxSpinnerService,
    private dialog: MatDialog,
    private _location: Location) {
  }

  ngOnInit() {
    this.spinner.show();
    this.getFormDetails();
  }

  getFormDetails() {
    this.currentCompany = this.localStorageService.get(ConstantKeys.CURRENT_SELECTED_COMPANY_PROFILE_INFO);
    this.currentReport = this.localStorageService.get(ConstantKeys.CURRENT_REPORT);
    this.reportService.getReportCompanyDetailsByKeys(this.currentReport._id, this.currentCompany._id, this.sectionName).subscribe(data => {
      this.getFormDetailsSuccess(data);
    }, error => {
      this.spinner.hide();
      console.log('error', error);
    });
  }

  getFormDetailsSuccess(data) {
    if (data && data.data.cp && data.data.cp.length) {
      const secData = _.find(data.data.cp, ['company_id', this.currentCompany._id])
      if(secData) {
        this.secondaryInputData = this.reportSectionService.convertToReportDataElement(secData[this.sectionName]);
      }
    }
    this.spinner.hide();
  }

  onSubmit() {
    this.spinner.show();
    let formattedSecEle = this.reportSectionService.convertToSecondaryDataElement(this.secondaryInputData);
    this.dataChange.emit(formattedSecEle);
  }

  toPreviousPage() {
    this._location.back();
  }

  ngAfterViewInit() {
    this.commentDivs.changes.subscribe(() => {
      if (this.commentDivs && this.commentDivs.last) {
        this.commentDivs.last.nativeElement.focus();
      }
    });
  }

  editDataElement(element) {
    switch (element.type) {
      case TEXT:
        this.onTextOption(element, element.data, true);
        break;
      case TABLE:
        this.onTableOption(element, element.data, true);
        break;
      case IMAGE:
        this.onImageOption(element, element.data, true);
        break;
      case PIE:
        this.onPieOption(element, element.data, true);
        break;
      case BAR:
        this.onBarOption(element, element.data, true);
        break;
    }
  }

  onTextOption(selectedEle: ReportDataElement = null, dataValue = null, isEdit = null) {
    const dialogRef = this.dialog.open(TextInputComponent, {
      width: '97%',
      maxWidth: '97vw',
      data: dataValue,
      disableClose: true,
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        if (isEdit) {
          const index = this.secondaryInputData.indexOf(selectedEle);
          this.secondaryInputData[index].data = result;
        } else {
          const dataNode = this.createReportDataElement(TEXT, result);
          this.addElememt(selectedEle, dataNode);
        }
      }
    });
  }

  onTableOption(selectedEle: ReportDataElement = null, dataValue = null, isEdit = null) {
    const dialogRef = this.dialog.open(TableInputComponent, {
      width: '97%',
      maxWidth: '97vw',
      height: '80%',
      disableClose: true,
      data: dataValue
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        const cols = result.metaDataValue.columns.map(ele => ele.header);
        const data = {
          cols: cols,
          metaDataValue: result.metaDataValue,
          dataStore: result.dataStore
        };
        if (isEdit) {
          const index = this.secondaryInputData.indexOf(selectedEle);
          this.secondaryInputData[index].data = data;
        } else {
          const dataNode = this.createReportDataElement(TABLE, data);
          this.addElememt(selectedEle, dataNode);
        }
      }
    });
  }

  onImageOption(selectedEle: ReportDataElement = null, dataValue = null, isEdit = null) {
    const dialogRef = this.dialog.open(ImageInputComponent, {
      width: '97%',
      maxWidth: '97vw',
      height: '70%',
      disableClose: true,
      data: dataValue
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        if (isEdit) {
          const index = this.secondaryInputData.indexOf(selectedEle);
          this.secondaryInputData[index].data = result;
        } else {
          const data = {
            metaDataValue: result.metaDataValue,
            imageUrl: result.imageUrl
          };
          const dataNode = this.createReportDataElement(IMAGE, data);
          this.addElememt(selectedEle, dataNode);
        }
      }
    });
  }

  onPieOption(selectedEle: ReportDataElement = null, dataValue = null, isEdit = null) {
    const dialogRef = this.dialog.open(PieChartInputComponent, {
      width: '97%',
      maxWidth: '97vw',
      height: '80%',
      disableClose: true,
      data: dataValue
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        if (isEdit) {
          const index = this.secondaryInputData.indexOf(selectedEle);
          this.secondaryInputData[index].data = result;
        } else {
          const data = {
            metaDataValue: result.metaDataValue,
            chartLabels: result.chartLabels,
            chartData: result.chartData
          };
          const dataNode = this.createReportDataElement(PIE, data);
          this.addElememt(selectedEle, dataNode);
        }
      }
    });
  }


  onBarOption(selectedEle: ReportDataElement = null, dataValue = null, isEdit = null) {
    const dialogRef = this.dialog.open(BarChartInputComponent, {
      width: '97%',
      maxWidth: '97vw',
      height: '90%',
      disableClose: true,
      data: dataValue
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        if (isEdit) {
          const index = this.secondaryInputData.indexOf(selectedEle);
          this.secondaryInputData[index].data = result;
        } else {
          const data = {
            metaDataValue: result.metaDataValue,
            chartLabels: result.chartLabels,
            chartData: result.chartData,
            colMetaData: result.colMetaData,
            dataStore: result.dataStore,
          };
          this.barChartOptions = barConfig.getChartOptions(data.metaDataValue.labelX, data.metaDataValue.labelY);
          const dataNode = this.createReportDataElement(BAR, data);
          this.addElememt(selectedEle, dataNode);
        }
      }
    });
  }

  removeElement(data: ReportDataElement) {
    this.secondaryInputData = this.secondaryInputData.filter(ele => ele.id !== data.id);
  }

  createReportDataElement(type: string, data: any): ReportDataElement {
    return {
      id: this.secondaryInputData.length + 1,
      type: type,
      data: data
    };
  }

  addElememt(selectedEle: ReportDataElement, newElement: ReportDataElement) {
    if (selectedEle) {
      let selectedEleIndex = this.secondaryInputData.indexOf(selectedEle);
      this.secondaryInputData.splice(selectedEleIndex, 0, newElement);
    } else {
      this.secondaryInputData.push(newElement);
    }
  }
}
