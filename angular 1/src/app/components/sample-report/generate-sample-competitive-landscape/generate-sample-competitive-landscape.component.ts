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
import {Router} from '@angular/router';
import {Location} from '@angular/common';
import {
  competiveLandscapeCommonSections, competiveLandscapeTechDomainSections
} from "../../../models/section-metadata";
import {ToastrService} from "ngx-toastr";
import { SampleImage } from 'src/app/constants/sample-image.constants';

@Component({
  selector: 'app-generate-sample-market-introduction',
  templateUrl: './generate-sample-competitive-landscape.component.html',
  styleUrls: ['./generate-sample-competitive-landscape.component.scss']
})
export class GenerateSampleCompetitiveLandscapeComponent implements OnInit {
  normalMenuList: any[] = [...competiveLandscapeCommonSections];
  techTrenMenuList: any[] = [...competiveLandscapeTechDomainSections];
  commonMenuList: any[] = []
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
  dataReportTitle = '';
  data: any;
  secondaryArray = ['regStandards', 'introduction', 'patentTrends', 'techTrends'];
  apiData: any = [];
  defaultKeySequence = ["overview", "marketAnalysis", "brandShareAnalysis",
  "dashboard", "benchMarking", "majorGrowthStrategy", 
  "theLeadingPlayer", "devAndGrowthStrategies",
  "majorPlayersFinancialMatrixAndMarketRatio"]

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
    if (element.subSections && element.subSections.length) {
      element.subSections.forEach(ele => {
        ele.data = []
      });
    } else {
      element.data = []
    }
  }

  ngOnInit() {
    this.spinner.show();
    let commonList = [...this.normalMenuList, ...this.techTrenMenuList]

    this.defaultKeySequence.forEach(e => {
      let item = commonList.filter(item => item.key === e)
      if (item) {
        this.commonMenuList.push(item[0])
        _.remove(commonList, (d) => d.key === e)
      }
    })

    this.currentReport = this.localStorageService.get(ConstantKeys.CURRENT_REPORT);
    this.dataReportTitle = this.currentReport.title.trim() + " market";
    this.currentSection = this.localStorageService.get(ConstantKeys.CURRENT_SECTION);
    this.reportService.getTocByMainSectionId(this.currentReport._id, this.currentSection.main_section_id).subscribe(data => {
      if (data && data.data && data.data.length) {
        this.commonMenuList.forEach(item => {
          let temp = _.find(data.data, ['toc.meta_info.section_key', item.key])
          if (temp && temp.toc && temp.toc.content) {
            item.data = this.reportSectionService.convertToReportDataElement(temp.toc.content);
          }
          if (item.subSections) {
            item.subSections.forEach(subItem => {
              let temp1 = _.find(data.data, ['toc.meta_info.section_key', subItem.key])
              if (temp1 && temp1.toc && temp1.toc.content) {
                subItem.data = this.reportSectionService.convertToReportDataElement(temp1.toc.content);
              }
            });
          }
        })
      }
      this.spinner.hide();
    });
  }

  generateData() {
    this.commonMenuList.forEach(item => {
      if (item.key == "overview") {
        item.data = [{
          "id": 1,
          "type": "TEXT",
          "data": `The ${this.dataReportTitle} is characterized by the presence of many regional and local vendors........`
        }];
      }
      else if (item.key == "majorGrowthStrategy") {
        item.data = [{
          "id": 1,
          "type": "TABLE",
          "data": {
            "cols": [
              "Key Players",
              "2016",
              "2017",
              "2018",
              "2019"
            ],
            "metaDataValue": {
              "source": "MRFR Analysis",
              "title": `Major Strategy Adopted by Key Players in the ${this.currentReport.title + " market"}`,
              "rows": 4,
              "columns": [
                {
                  "header": "Key Players"
                },
                {
                  "header": "2016"
                },
                {
                  "header": "2017"
                },
                {
                  "header": "2018"
                },
                {
                  "header": "2019"
                }
              ]
            },
            "dataStore": [
              {
                "2016": "XX",
                "2017": "XX",
                "2018": "XX",
                "2019": "XX",
                "Key Players": "Agreement"
              },
              {
                "2016": "XX",
                "2017": "XX",
                "2018": "XX",
                "2019": "XX",
                "Key Players": "Mergers & Acquisitions"
              },
              {
                "2016": "XX",
                "2017": "XX",
                "2018": "XX",
                "2019": "XX",
                "Key Players": "New Product & Development"
              },
              {
                "2016": "XX",
                "2017": "XX",
                "2018": "XX",
                "2019": "XX",
                "Key Players": "Expansions & Investments"
              }
            ]
          }
        }];
      }
      else if (item.key == "devAndGrowthStrategies") {
        item.subSections.forEach(subItem => {
          if (subItem.key == 'newDevelopment') {
            subItem.data = [{
              "id": 1,
              "type": "TABLE",
              "data": {
                "cols": [
                  "Month & Year",
                  "Categories",
                  "Developments"
                ],
                "metaDataValue": {
                  "source": "MRFR Analysis",
                  "title": "New product Launch",
                  "rows": 2,
                  "columns": [
                    {
                      "header": "Month & Year"
                    },
                    {
                      "header": "Categories"
                    },
                    {
                      "header": "Developments"
                    }
                  ]
                },
                "dataStore": [
                  {
                    "Month & Year": "XXXX",
                    "Categories": "XXXX",
                    "Developments": "XXXX"
                  },
                  {
                    "Month & Year": "XXXX",
                    "Categories": "XXXX",
                    "Developments": "XXXXX"
                  }
                ]
              }
            }];
          } else if (subItem.key == 'mergerAndAquisition') {
            subItem.data = [{
              "id": 1,
              "type": "TABLE",
              "data": {
                "cols": [
                  "Month & Year",
                  "Categories",
                  "Developments"
                ],
                "metaDataValue": {
                  "source": "MRFR Analysis",
                  "title": "Merger & Acquisition",
                  "rows": 2,
                  "columns": [
                    {
                      "header": "Month & Year"
                    },
                    {
                      "header": "Categories"
                    },
                    {
                      "header": "Developments"
                    }
                  ]
                },
                "dataStore": [
                  {
                    "Month & Year": "XXXX",
                    "Categories": "XXXX",
                    "Developments": "XXXX"
                  },
                  {
                    "Month & Year": "XXXX",
                    "Categories": "XXXX",
                    "Developments": "XXXX"
                  }
                ]
              }
            }];
          } else if (subItem.key == 'jointVenture') {
            subItem.data = [{
              "id": 1,
              "type": "TABLE",
              "data": {
                "cols": [
                  "Month & Year",
                  "Categories",
                  "Developments"
                ],
                "metaDataValue": {
                  "source": "MRFR Analysis",
                  "title": "Joint Ventures",
                  "rows": 2,
                  "columns": [
                    {
                      "header": "Month & Year"
                    },
                    {
                      "header": "Categories"
                    },
                    {
                      "header": "Developments"
                    }
                  ]
                },
                "dataStore": [
                  {
                    "Month & Year": "XXXX",
                    "Categories": "XXXX",
                    "Developments": "XXXX"
                  },
                  {
                    "Month & Year": "XXXX",
                    "Categories": "XXXX",
                    "Developments": "XXXX"
                  }
                ]
              }
            }];
          }
        });
      }
      else if (item.key == "marketAnalysis") {
        item.data = [{
          "id": 1,
          "type": "IMAGE",
          "data": {
            "metaDataValue": {
              "source": "MRFR Analysis",
              "title": "Major Manufacturer Market Share Analysis, " + this.currentReport.me.base_year,
              "type": "1"
            },
            "imageUrl": SampleImage.COMPETITIVE_LANDSCAPE_1
          }
        }, {
          "id": 2,
          "type": "TEXT",
          "data": `The scope of the ${this.dataReportTitle} study includes the market size analysis and a detailed analysis of the manufacturer’s products and strategies. The market has been segmented based on flavor, packaging type, distribution channel, and region.`
        }];
      }
      else if (item.key == "majorPlayersFinancialMatrixAndMarketRatio") {
        item.data = [
          {
            "id": 1,
            "type": "HEADING",
            "data": "Sales & operating Income"
          },
          {
          "id": 2,
          "type": "IMAGE",
          "data": {
            "metaDataValue": {
              "source": "MRFR Analysis",
              "title": "Sales & operating Income",
              "type": "1"
            },
            "imageUrl": SampleImage.COMPETITIVE_LANDSCAPE_2
          }
        }, 
        {
          "id": 3,
          "type": "HEADING",
          "data": "R&D Expenditure"
        },
        {
          "id": 4,
          "type": "IMAGE",
          "data": {
            "metaDataValue": {
              "source": "MRFR Analysis",
              "title": `Major players R&D Expenditure ${this.baseYear}`,
              "type": "1"
            },
            "imageUrl": SampleImage.COMPETITIVE_LANDSCAPE_3
          }
        }]
      }
      else if (item.key == "theLeadingPlayer") {
        item.data = [{
          "id": 1,
          "type": "TABLE",
          "data": {
            "cols": [
              "Company Name",
              "Contracts & Agreements",
              "Mergers & Acquisitions",
              "New Product/ Services Development",
              "Expansions & Investments",
              "Total"
            ],
            "metaDataValue": {
              "source": "MRFR Analysis",
              "title": `The most active player in the ${this.currentReport.title} market`,
              "rows": 11,
              "columns": [
                {
                  "header": "Company Name"
                },
                {
                  "header": "Contracts & Agreements"
                },
                {
                  "header": "Mergers & Acquisitions"
                },
                {
                  "header": "New Product/ Services Development"
                },
                {
                  "header": "Expansions & Investments"
                },
                {
                  "header": "Total"
                }
              ]
            },
            "dataStore": [
              {
                "Company Name": "Player 1",
                "Contracts & Agreements": "XX",
                "Mergers & Acquisitions": "XX",
                "New Product/ Services Development": "XX",
                "Expansions & Investments": "XX",
                "Total": "XX"
              },
              {
                "Company Name": "Player 2",
                "Contracts & Agreements": "XX",
                "Mergers & Acquisitions": "XX",
                "New Product/ Services Development": "XX",
                "Expansions & Investments": "XX",
                "Total": "XX"
              },
              {
                "Company Name": "Player 3",
                "Contracts & Agreements": "XX",
                "Mergers & Acquisitions": "XX",
                "New Product/ Services Development": "XX",
                "Expansions & Investments": "XX",
                "Total": "XX"
              },
              {
                "Company Name": "Player 4",
                "Contracts & Agreements": "XX",
                "Mergers & Acquisitions": "XX",
                "New Product/ Services Development": "XX",
                "Expansions & Investments": "XX",
                "Total": "XX"
              },
              {
                "Company Name": "Player 5",
                "Contracts & Agreements": "XX",
                "Mergers & Acquisitions": "XX",
                "New Product/ Services Development": "XX",
                "Expansions & Investments": "XX",
                "Total": "XX"
              },
              {
                "Company Name": "Player 6",
                "Contracts & Agreements": "XX",
                "Mergers & Acquisitions": "XX",
                "New Product/ Services Development": "XX",
                "Expansions & Investments": "XX",
                "Total": "XX"
              },
              {
                "Company Name": "Player 7",
                "Contracts & Agreements": "XX",
                "Mergers & Acquisitions": "XX",
                "New Product/ Services Development": "XX",
                "Expansions & Investments": "XX",
                "Total": "XX"
              },
              {
                "Company Name": "Player 8",
                "Contracts & Agreements": "XX",
                "Mergers & Acquisitions": "XX",
                "New Product/ Services Development": "XX",
                "Expansions & Investments": "XX",
                "Total": "XX"
              },
              {
                "Company Name": "Player 9",
                "Contracts & Agreements": "XX",
                "Mergers & Acquisitions": "XX",
                "New Product/ Services Development": "XX",
                "Expansions & Investments": "XX",
                "Total": "XX"
              },
              {
                "Company Name": "Player 10",
                "Contracts & Agreements": "XX",
                "Mergers & Acquisitions": "XX",
                "New Product/ Services Development": "XX",
                "Expansions & Investments": "XX",
                "Total": "XX"
              },
              {
                "Company Name": "Total",
                "Contracts & Agreements": "XX",
                "Mergers & Acquisitions": "XX",
                "New Product/ Services Development": "XX",
                "Expansions & Investments": "XX",
                "Total": "XX"
              }
            ]
          }
        }];
      }
      else if (item.key == "brandShareAnalysis") {
        item.data = [{
          "id": 1,
          "type": "IMAGE",
          "data": {
            "metaDataValue": {
              "source": "MRFR Analysis",
              "title": `Brand Share Analysis, ${this.currentReport.me.base_year}`,
              "type": "1"
            },
            imageUrl: SampleImage.COMPETITIVE_LANDSCAPE_4
          }
        }];
      }
      else if (item.key == "dashboard") {
        item.data = [{
          "id": 1,
          "type": "IMAGE",
          "data": {
            "metaDataValue": {
              "source": "MRFR Analysis",
              "title": "Competitor Dashboard",
              "type": "2"
            },
            "imageUrl": SampleImage.COMPETITIVE_LANDSCAPE_5
          }
        }]
      }
      else if (item.key == "benchMarking") {
        item.data = [{
          "id": 1,
          "type": "IMAGE",
          "data": {
            "metaDataValue": {
              "source": "MRFR Analysis",
              "title": "BENCHMARKING OF MAJOR COMPETITORS",
              "type": "2"
            },
            "imageUrl": SampleImage.COMPETITIVE_LANDSCAPE_6
          }
        }, {
          "id": 2,
          "type": "IMAGE",
          "data": {
            "metaDataValue": {
              "source": "MRFR Analysis",
              "title": "Competitive Benchmarking",
              "type": "1"
            },
            "imageUrl": SampleImage.COMPETITIVE_LANDSCAPE_7
          }
        }];
      }
    });
    this.toastr.success('Competitive landscape data generated successfully', 'Message');
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
    this.spinner.show();
    this.commonMenuList.forEach((item) => {
      const sectionData = this.getSectionData(item);
      if (item.subSections) {
        item.subSections.forEach(subItem => {
          sectionData.section_id = sectionData.section_pid + '.' + subItem.id;
          sectionData.meta_info.section_parent_key = item.key;
          sectionData.meta_info.section_key = subItem.key;
          sectionData.meta_info.section_parent_value = sectionData.section_name;
          sectionData.meta_info.section_value = subItem.value;
          sectionData.content = this.reportSectionService.convertToSecondaryDataElement(subItem.data);
          this.saveAPIData(sectionData);
        });
      }
      if (item.data) {
        sectionData.content = this.reportSectionService.convertToSecondaryDataElement(item.data);
        this.saveAPIData(sectionData);
      }
    });
    this.techTrenMenuList.forEach((item) => {
      const sectionData = this.getSectionData(item);
      if (item.data) {
        sectionData.content = this.reportSectionService.convertToSecondaryDataElement(item.data);
        this.saveAPIData(sectionData);
      }
    });
    this.router.navigateByUrl(`/me-report/${this.currentReport._id}/global-info/competitive-landscape`);
  }

  saveAPIData(sectionData) {
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

  onEdit() {
    this.router.navigateByUrl(`/me-report/${this.currentReport._id}/global-info/competitive-landscape`);
  }

  toPreviousPage() {
    this._location.back();
  }
}