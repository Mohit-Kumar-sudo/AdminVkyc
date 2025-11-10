import {Component, ElementRef, Input, OnInit, QueryList, ViewChildren} from '@angular/core';
import {MatDialog, MatSnackBar} from '@angular/material';
import {Location} from '@angular/common';
import {TextInputComponent} from '../../core/text-input/text-input.component';
import {TableInputComponent} from '../../core/table-input/table-input.component';
import {PieChartInputComponent} from '../../core/pie-chart-input/pie-chart-input.component';
import {ImageInputComponent} from '../../core/image-input/image-input.component';
import * as pieConfig from '../../core/pie-chart-input/pie-chart-configs';
import * as barConfig from '../../core/bar-chart-input/bar-chart-configs';
import {BarChartInputComponent} from '../../core/bar-chart-input/bar-chart-input.component';
import {
  BAR,
  CUSTOM_TABLE,
  IMAGE,
  MasterReportSecondarySectionData,
  PIE,
  ReportDataElement,
  SecondarySectionModel,
  TABLE,
  TEXT,
  CUSTOM,
  HEADING
} from 'src/app/models/secondary-research-models';
import {ReportSectionService} from 'src/app/services/report-section.service';
import {LocalStorageService} from 'src/app/services/localsotrage.service';
import {ConstantKeys} from 'src/app/constants/mfr.constants';
import {ReportService} from 'src/app/services/report.service';
import {ActivatedRoute} from '@angular/router';
import {NgxSpinnerService} from 'ngx-spinner';
import { CustomTableInputComponent } from '../../core/custom-table-input/custom-table-input.component';
import { CustomInputComponent } from '../../core/custom-input/custom-input.component';
import { HeadingInputComponent } from '../../core/heading-input/heading-input.component';

@Component({
  selector: 'app-secondary-research-input-element',
  templateUrl: './secondary-research-input-element.component.html',
  styleUrls: ['./secondary-research-input-element.component.scss']
})
export class SecondaryResearchInputElementComponent implements OnInit {

  @ViewChildren('commentDiv') commentDivs: QueryList<ElementRef>;

  @Input()
  secondarySectionModel: SecondarySectionModel;

  secondaryInputData: ReportDataElement[] = [];

  pieChartType = pieConfig.pieChartType;
  pieChartOptions = pieConfig.pieChartOptions;
  pieChartPlugins = pieConfig.pieChartPlugins;
  pieChartColors = pieConfig.pieChartColors;
  pieChartLegend = pieConfig.pieChartLegend;

  barChartType = barConfig.barChartType;
  barChartOptions = barConfig.barChartOptions;
  barChartColors = barConfig.barChartColors;
  barChartPlugins = barConfig.barChartPlugins;
  barChartLegend = barConfig.barChartLegend;

  routerData = null;

  constructor(private localStorageService: LocalStorageService,
              private reportService: ReportService,
              private spinner: NgxSpinnerService,
              private routes: ActivatedRoute,
              private reportSectionService: ReportSectionService,
              private location: Location,
              private dialog: MatDialog,
              private snackBar: MatSnackBar) {
  }

  ngOnInit() {
    this.spinner.show();
    this.routerData = history.state.data;
    this.getFormDetails();
  }

  getFormDetails() {
    const currentReport = this.localStorageService.get(ConstantKeys.CURRENT_REPORT);
    const sectionData = this.localStorageService.get(ConstantKeys.CURRENT_SECTION);
    this.reportService.getTocDetails(currentReport._id, sectionData.section_id, sectionData.main_section_id).subscribe(data => {
      this.getFormDetailsSuccess(data);
    }, error => {
      console.log('error', error);
    });
  }

  getFormDetailsSuccess(data: MasterReportSecondarySectionData) {
    if (data && data.content) {
      this.secondaryInputData = this.reportSectionService.convertToReportDataElement(data.content);      
      this.secondaryInputData.forEach(data=>{
        if(data.type == 'CUSTOM_TABLE'){
          if(data.data && data.data.data && data.data.data.length){
            data.data.data.forEach(element=>{
              if(typeof element.title == 'string'){
                element.title = [{title:element.title}]
              }
            })
          }
        }
      })
    }
    this.spinner.hide();
  }

  toPreviousPage() {
    this.location.back();
  }

  onSubmit() {
    this.spinner.show();
    const currentReport = this.localStorageService.get(ConstantKeys.CURRENT_REPORT);
    const currentSectionInfo = this.localStorageService.get(ConstantKeys.CURRENT_SECTION);
    currentSectionInfo.content = this.reportSectionService.convertToSecondaryDataElement(this.secondaryInputData);
    if (this.localStorageService.get(ConstantKeys.STORE_IN_LOCALSTORAGE)) {
      let currentTocData = this.localStorageService.get(ConstantKeys.CURRENT_SELECTED_TOC_SECTION) || [];
      currentTocData.push(currentSectionInfo);
      this.localStorageService.set(ConstantKeys.CURRENT_SELECTED_TOC_SECTION, currentTocData);
      this.snackBar.open('TOC section for request section saved successfully', 'Close', {
        duration: 4000,
      });
      this.spinner.hide();
    } else {
      this.reportService.saveTocInfoByReportSection(currentReport, currentSectionInfo)
        .subscribe(data => {
          this.snackBar.open('TOC section for request section saved successfully', 'Close', {
            duration: 4000,
          });
          this.spinner.hide();
        }, (err) => {
          this.snackBar.open('Error occured while saving TOC section', 'Close', {
            duration: 4000,
          });
          this.spinner.hide();
        });
    }
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
      case CUSTOM_TABLE:
        this.onCustomTableOption(element, element.data, true);
        break;
      case CUSTOM:
        this.onCustomOption(element, element.data, true);
        break;
      case HEADING:
        this.onHeadingOption(element, element.data, true);
    }
  }

  onTextOption(selectedEle: ReportDataElement = null, dataValue = null, isEdit = null) {
    const dialogRef = this.dialog.open(TextInputComponent, {
      width: '80%',
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

  onHeadingOption(selectedEle: ReportDataElement = null, dataValue = null, isEdit = null) {
    const dialogRef = this.dialog.open(HeadingInputComponent, {
      width: '80%',
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
          const dataNode = this.createReportDataElement(HEADING, result);
          this.addElememt(selectedEle, dataNode);
        }
      }
    });
  }

  onTableOption(selectedEle: ReportDataElement = null, dataValue = null, isEdit = null) {
    const dialogRef = this.dialog.open(TableInputComponent, {
      width: '97%',
      maxWidth: '97vw',
      height: '90%',
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
      height: '95%',
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

  onCustomTableOption(selectedEle: ReportDataElement = null, dataValue = null, isEdit = null) {
    const dialogRef = this.dialog.open(CustomTableInputComponent, {
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
          const dataNode = this.createReportDataElement(CUSTOM_TABLE, result);
          this.addElememt(selectedEle, dataNode);
        }
      }
    });
  }

  onCustomOption(selectedEle: ReportDataElement = null, dataValue = null, isEdit = null) {
    const dialogRef = this.dialog.open(CustomInputComponent, {
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
          const dataNode = this.createReportDataElement(CUSTOM, result);
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
      const selectedEleIndex = this.secondaryInputData.indexOf(selectedEle);
      this.secondaryInputData.splice(selectedEleIndex, 0, newElement);
    } else {
      this.secondaryInputData.push(newElement);
    }
  }
}
