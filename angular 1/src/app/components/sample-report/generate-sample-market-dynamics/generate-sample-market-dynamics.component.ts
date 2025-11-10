import {Component, OnInit} from '@angular/core'
import {MasterReportData, RegionCountry, TocSectionData} from 'src/app/models/me-models';
import * as _ from 'lodash';
import {SegmentNodeRequest} from 'src/app/models/segment-models';
import {ReportService} from 'src/app/services/report.service';
import {LocalStorageService} from 'src/app/services/localsotrage.service';
import {ConstantKeys} from 'src/app/constants/mfr.constants';
import {MatSnackBar} from '@angular/material';
import {NgxSpinnerService} from 'ngx-spinner';
import {
  ReportDataElement
} from 'src/app/models/secondary-research-models';
import {ReportSectionService} from 'src/app/services/report-section.service';
import * as pieConfig from '../../core/pie-chart-input/pie-chart-sample-configs';
import * as barConfig from '../../core/bar-chart-input/bar-chart-sample-configs';
import {ActivatedRoute, Router} from '@angular/router';
import {Location} from '@angular/common';
import {MultiLevelInputInfo} from "../../market-dynamics/multi-level-input/multi-level-input.component";
import {
  marketDynamicsCommonSections,
} from "../../../models/section-metadata";
import {ToastrService} from "ngx-toastr";

@Component({
  selector: 'app-generate-sample-market-introduction',
  templateUrl: './generate-sample-market-dynamics.component.html',
  styleUrls: ['./generate-sample-market-dynamics.component.scss']
})
export class GenerateSampleMarketDynamicsComponent implements OnInit {
  currentReport: MasterReportData = null;
  startYear:number;
  endYear:number;
  baseYear:number;
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
  secondaryArray = ['regStandards', 'introduction', 'patentTrends', 'techTrends'];
  mdMenus: any[] = marketDynamicsCommonSections;
  commonMenuList: any[];
  customModules = []
  subSubSectionList = [];

  constructor(
    private reportService: ReportService,
    private localStorageService: LocalStorageService,
    private snackBar: MatSnackBar,
    private spinner: NgxSpinnerService,
    private activatedRoute: ActivatedRoute,
    private reportSectionService: ReportSectionService,
    private router: Router,
    private toastr: ToastrService,
    private _location: Location
  ) {
    this.commonMenuList = this.mdMenus;
    this.spinner.show();
  }

  deleteElement(element) {
    if (element.key != "introduction") {
      element.data = []
    }
  }

  ngOnInit() {
    this.spinner.show();
    this.currentReport = this.localStorageService.get(ConstantKeys.CURRENT_REPORT);
    this.baseYear = this.currentReport.me.base_year;
    this.startYear = this.currentReport.me.base_year;
    this.endYear = this.currentReport.me.end_year;
    this.currentSection = this.localStorageService.get(ConstantKeys.CURRENT_SECTION);
    this.reportService.getTocByMainSectionId(this.currentReport._id, this.currentSection.main_section_id).subscribe(data => {
      if (data && data.data && data.data.length) {
        this.commonMenuList.forEach(item => {
          if (this.secondaryArray.includes(item.key)) {
            let temp = _.find(data.data, ['toc.meta_info.parent_section_key', item.key])
            if (temp && temp.toc && temp.toc.content) {
              item.data = this.reportSectionService.convertToReportDataElement(temp.toc.content);
            }
          } else {
            let temp = _.filter(data.data, ['toc.meta_info.parent_section_key', item.key])
            if (temp && temp.length) {
              item.data = _.map(temp, 'toc.meta.data.name');
            }
          }
        })
        data.data.forEach(el => {
          if (!el.toc.hasOwnProperty('meta')) {
            if (el.toc.meta_info.parent_section_key != 'introduction') {
              this.customModules.push(el)
            }
          }
        });
      }
      this.spinner.hide();
    });
  }

  generateData() {
    this.commonMenuList.forEach(item => {
      if (item.key == "introduction") {
        item.data = [{
          "id": 1,
          "type": "TEXT",
          "data": `XXX`
        }];
      } else if (item.key == 'drivers') {
        item.data = ['Driver 1', 'Driver 2']
      } else if (item.key == 'restraints') {
        item.data = ['Restraint 1', 'Restraint 2']
      } else if (item.key == 'opportunities') {
        item.data = ['Opportunity 1', 'Opportunity 2'];
      } else if (item.key == 'trends') {
        item.data = ['Trend 1', 'Trend 2'];
      } else if (item.key == 'challenges') {
        item.data = ['Challenge 1', 'Challenge 2'];
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
      parent_section_key: menu.key,
      parent_section_value: menu.value
    };
    return currentSection;
  }

  saveAndContinue() {
    this.commonMenuList.forEach(async (item) => {
      const sectionData = this.getSectionData(item);
      if (this.secondaryArray.includes(item.key)) {
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
      } else {
        this.subSubSectionList = [];
        if (item.data && item.data.length) {
          item.data.forEach(ele => {
            this.addElement(ele, sectionData, item.data.length)
          });
        } else {
          this.saveMetaInfo(sectionData);
        }
      }
    })
  }

  addElement(ele, currentSection, dataLength) {
    this.spinner.show();
    let newSection: MultiLevelInputInfo = {
      index_id: `${this.subSubSectionList.length + 1}`,
      name: ele,
      rating: [],
    }
    let reqDataObj = { ...currentSection };
    reqDataObj.section_id = `${currentSection.section_id}.${this.subSubSectionList.length + 1}`;
    reqDataObj.meta = {
      type: `${currentSection.meta_info.parent_section_key}`.toUpperCase(),
      data: newSection
    };

    this.subSubSectionList.push(reqDataObj);
    if (this.subSubSectionList.length == dataLength) {
      this.saveMetaInfo(currentSection)
    }
  }

  saveMetaInfo(currentSection) {
    this.spinner.show();
    let reqDataArr = [];
    this.subSubSectionList.forEach((ele, idx) => {
      let reqDataObj = { ...currentSection };
      reqDataObj.section_id = `${currentSection.section_id}.${idx + 1}`;
      reqDataObj.meta = {
        type: `${currentSection.meta_info.parent_section_key}`.toUpperCase(),
        data: ele.meta.data
      };
      reqDataObj.content = ele.content ? ele.content : [];
      if (reqDataObj.meta.type == "DRIVERS") {
        reqDataObj.meta.data.rating = this.setRating(["low", "medium", "high"]);
      } else if (reqDataObj.meta.type == "RESTRAINTS") {
        reqDataObj.meta.data.rating = this.setRating(["high", "medium", "low"]);
      }
      reqDataArr.push(reqDataObj);
    });
    this.reportService.saveAndReplaceTocInfoByReportSectionArr(this.currentReport, reqDataArr, currentSection)
      .subscribe(data => {
        this.snackBar.open('Selected Data saved to platform', 'Close', {
          duration: 2000,
        });
        this.spinner.hide();
      }, (err) => {
        this.snackBar.open('Error occured while submitting to platform', 'Close', {
          duration: 2000,
        });
        this.spinner.hide();
      });
  }

  onEdit() {
    this.router.navigate([`/me-report/${this.currentReport._id}/global-info/market-dynamics`], {relativeTo: this.activatedRoute, queryParams:{reportType: 'generate'}});
  }

  toPreviousPage() {
    this._location.back();
  }
  setRating(rating) {
    return [{
      year: `${this.baseYear - 2}-${this.baseYear - 1}`,
      rating: rating[0]
    },
    {
      year: `${this.baseYear}-${this.baseYear + 2}`,
      rating: rating[1]
    },
    {
      year: `${this.baseYear + 3}-${this.endYear}`,
      rating: rating[2]
    }]
  }
}
