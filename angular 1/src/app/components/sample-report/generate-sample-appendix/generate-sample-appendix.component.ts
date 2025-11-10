import {Component, OnInit} from '@angular/core'
import {MasterReportData, RegionCountry, TocSectionData} from 'src/app/models/me-models';
import * as _ from 'lodash';
import {SegmentService} from 'src/app/services/segment.service';
import {SegmentNodeRequest} from 'src/app/models/segment-models';
import {ReportService} from 'src/app/services/report.service';
import {LocalStorageService} from 'src/app/services/localsotrage.service';
import {ConstantKeys} from 'src/app/constants/mfr.constants';
import {MatSnackBar} from '@angular/material';
import {NgxSpinnerService} from 'ngx-spinner';
import {
  ReportDataElement,
  TEXT
} from 'src/app/models/secondary-research-models';
import {ReportSectionService} from 'src/app/services/report-section.service';
import * as pieConfig from '../../core/pie-chart-input/pie-chart-sample-configs';
import * as barConfig from '../../core/bar-chart-input/bar-chart-sample-configs';
import {Router} from '@angular/router';
import {Location} from '@angular/common';
import {
  appendixSections
} from "../../../models/section-metadata";
import {ToastrService} from "ngx-toastr";
import {HttpClient} from "@angular/common/http";

@Component({
  selector: 'app-generate-sample-appendix',
  templateUrl: './generate-sample-appendix.component.html',
  styleUrls: ['./generate-sample-appendix.component.scss']
})
export class GenerateSampleAppendixComponent implements OnInit {
  currentReport: MasterReportData = null;
  menuInputList: TocSectionData[] = [];
  selectedModule = "";
  tocModules = [];
  reportId = "";
  reportName = "";
  startYear = "";
  endYear = "";
  baseYear = "";
  meRegionsList: RegionCountry[] = [];
  meSegmentsList: SegmentNodeRequest[] = [];
  segments = [];
  allContents = [];
  secondaryInputData: ReportDataElement[] = [];
  pieChartType = pieConfig.pieChartSampleType;
  pieChartOptions = pieConfig.pieChartSampleOptions;
  pieChartPlugins = pieConfig.pieChartSamplePlugins;
  pieChartColors = pieConfig.pieChartSampleColors;
  pieChartLegend = pieConfig.pieChartSampleLegend;

  barChartType = barConfig.barChartType;
  barChartOptions = barConfig.barChartOptions;
  barChartPlugins = barConfig.barChartPlugins;
  barChartLegend = barConfig.barChartLegend;
  barData: any;
  chartOptions: any;
  currentSection: any;
  data: any;
  secondaryArray = ['regStandards', 'introduction', 'patentTrends', 'techTrends'];
  apiData: any = [];
  commonMenuList: any[] = [...appendixSections];

  constructor(
    private reportService: ReportService,
    private localStorageService: LocalStorageService,
    private snackBar: MatSnackBar,
    private spinner: NgxSpinnerService,
    private reportSectionService: ReportSectionService,
    private router: Router,
    private toastr: ToastrService,
    private _location: Location
  ) {
    this.spinner.show();
  }

  deleteElement(element) {
    _.remove(this.commonMenuList, (d) => d.key === element.key);
  }

  ngOnInit() {
    this.spinner.show();
    this.currentReport = this.localStorageService.get(ConstantKeys.CURRENT_REPORT);
    this.currentSection = this.localStorageService.get(ConstantKeys.CURRENT_SECTION);
    this.reportService.getTocByMainSectionId(this.currentReport._id, this.currentSection.main_section_id).subscribe(data => {
      if (data && data.data && data.data.length) {
        this.commonMenuList.forEach(item => {
          let temp = _.find(data.data, ['toc.meta_info.section_key', item.key])
          if (temp && temp.toc && temp.toc.content) {
            item.data = this.reportSectionService.convertToReportDataElement(temp.toc.content);
          }
        })
      }
      this.spinner.hide();
    });
  }

  generateData() {
    this.commonMenuList.forEach(item => {
      if (item.key == "generalSourcesAndReferences") {
        item.data = [{
          "id": 1,
          "type": "TEXT",
          "data": `<ul><li>XXX</li></ul>`
        }];
      } else if (item.key == 'listOfAbbreviations') {
        item.data = [{
          "id": 2,
          "type": "TABLE",
          "data": {
            "cols": [
              "Abbreviations",
              "Full Form"
            ],
            "metaDataValue": {
              "source": "MRFR Analysis",
              "title": "LIST OF ABBREVIATIONS",
              "rows": 4,
              "columns": [
                {
                  "header": "Abbreviations"
                },
                {
                  "header": "Full Form"
                }
              ]
            },
            "dataStore": [
              {
                "Abbreviations": "US",
                "Full Form": "United States"
              },
              {
                "Abbreviations": "UK",
                "Full Form": "United Kingdom"
              },
              {
                "Abbreviations": "XX",
                "Full Form": "XX"
              },
              {
                "Abbreviations": "XX",
                "Full Form": "XX"
              }
            ]
          }
        }];
      } else if (item.key == 'relatedReports') {
        item.data = [{
          "id": 3,
          "type": "TABLE",
          "data": {
            "cols": [
              "SR. NO.",
              "REPORT TITLE",
              "PUBLISH MONTH"
            ],
            "metaDataValue": {
              "source": "MRFR Analysis",
              "title": "Related Reports",
              "rows": 2,
              "columns": [
                {
                  "header": "SR. NO."
                },
                {
                  "header": "REPORT TITLE"
                },
                {
                  "header": "PUBLISH MONTH"
                }
              ]
            },
            "dataStore": [
              {
                "SR. NO.": "1.",
                "REPORT TITLE": "XXXX",
                "PUBLISH MONTH": "XXXX"
              }
            ]
          }
        }];
      }

    });
    this.toastr.success('Market Dynamics data generated successfully', 'Message');
  }

  getSectionData(menu) {
    let currentSection = this.localStorageService.get(ConstantKeys.CURRENT_SECTION)
    currentSection.actual_section_id = menu.id;
    currentSection.section_id = `${currentSection.main_section_id}.${menu.id}`;
    currentSection.section_pid = `${currentSection.main_section_id}.${menu.id}`;
    currentSection.sub_section_name = menu.value;
    currentSection.section_name = menu.value;
    currentSection.meta_info = {
      section_key: menu.key,
      section_value: menu.value
    };
    return currentSection;
  }

  saveAndContinue() {
    this.commonMenuList.forEach((item) => {
      if (item.data) {
        const sectionData = this.getSectionData(item);
        sectionData.content = this.reportSectionService.convertToSecondaryDataElement(item.data);
        this.reportService.saveTocCustomInfoByReportSection(this.currentReport, sectionData, sectionData)
          .subscribe(data => {
            this.snackBar.open('TOC section for request section saved successfully', 'Close', {
              duration: 4000,
            });
          }, (err) => {
            this.snackBar.open('Error occured while saving TOC section', 'Close', {
              duration: 4000,
            });
            this.spinner.hide();
          });
      }
    });
    this.router.navigateByUrl(`/me-report/${this.currentReport._id}/global-info/appendix`);
  }

  onEdit() {
    this.router.navigateByUrl(`/me-report/${this.currentReport._id}/global-info/appendix`);
  }

  toPreviousPage() {
    this._location.back();
  }
}
