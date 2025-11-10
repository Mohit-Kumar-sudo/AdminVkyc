import {AfterViewInit, Component, ElementRef, OnInit, ViewChild} from '@angular/core'
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
  ReportDataElement
} from 'src/app/models/secondary-research-models';
import {ReportSectionService} from 'src/app/services/report-section.service';
import * as pieConfig from '../../core/pie-chart-input/pie-chart-sample-configs';
import * as barConfig from '../../core/bar-chart-input/bar-chart-sample-configs';
import {Router} from '@angular/router';
import {Location} from '@angular/common';
import {
  markenIntroductionSections
} from "../../../models/section-metadata";
import {ToastrService} from "ngx-toastr";
import { SampleImage } from 'src/app/constants/sample-image.constants';
import { SampleInputService } from 'src/app/services/sample-input.service';
import * as html2canvas from 'html2canvas';
import { SampleOutputService } from 'src/app/services/sample-output.service';

@Component({
  selector: 'app-generate-sample-market-introduction',
  templateUrl: './generate-sample-market-introduction.component.html',
  styleUrls: ['./generate-sample-market-introduction.component.scss']
})
export class GenerateSampleMarketIntroductionComponent implements OnInit, AfterViewInit {
  currentReport: MasterReportData = null;
  menuInputList: TocSectionData[] = [];
  selectedModule = "";
  tocModules = [];
  reportId = "";
  reportName = "";
  startYear = "";
  endYear = "";
  baseYear:any;
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
  segmentString = '';
  commonMenuList: any[] = [...markenIntroductionSections];

  dataReportTitle = '';
  @ViewChild('marketStructure') marketStructure: ElementRef;
  parents: any = [];
  regions: any = [];
  hide = true;
  marketStructureImg: any;
  miSeq = ['definition', 'scope', 'researchObjective', 'structure', 
  'assumptions', 'keyBuyingCriteria']

  constructor(
    private segmentService: SegmentService,
    private reportService: ReportService,
    private localStorageService: LocalStorageService,
    private snackBar: MatSnackBar,
    private spinner: NgxSpinnerService,
    private reportSectionService: ReportSectionService,
    private router: Router,
    private toastr: ToastrService,
    private _location: Location,
    private sampleInputService: SampleInputService,
    private sampleOutputService: SampleOutputService
  ) {
    this.spinner.show();
  }

  deleteElement(element) {
    _.remove(this.commonMenuList, (d) => d.key === element.key);
  }

  ngOnInit() {
    this.spinner.show();
    let newCommonMenuList = []
    this.miSeq.forEach(e => {
      let item = this.commonMenuList.filter(item => item.key === e)
      if (item) {
        newCommonMenuList.push(item[0])
        _.remove(this.commonMenuList, (d) => d.key === e)
      }
    })
    newCommonMenuList = [...newCommonMenuList, ...this.commonMenuList]
    this.commonMenuList = [...newCommonMenuList]
    
    this.currentReport = this.localStorageService.get(ConstantKeys.CURRENT_REPORT);
    this.baseYear = this.currentReport.me.base_year;
    this.dataReportTitle = this.currentReport.title.trim() + " market";
    this.currentSection = this.localStorageService.get(ConstantKeys.CURRENT_SECTION);
    this.segmentService.getReportInfoByKey(this.currentReport._id, 'me.segment,title')
      .subscribe(data => {
        if (data && data.me && data.me.segment) {
          data.me.segment.forEach(item => {
            if (item.pid == '1') {
              this.segmentString = this.segmentString + this.sampleOutputService.getSegRefactored(item.name.toLowerCase()) + ', ';
            }
          });
        }
      });

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
    this.generateMarketStructure();
  }

  generateData() {
    if(this.marketStructureImg){
    this.commonMenuList.forEach(item => {
      if (item.key == "definition") {
        item.data = [{
          "id": 1,
          "type": "TEXT",
          "data": `XXX`
        }];
      } else if (item.key == 'scope') {
        item.data = [{
          "id": 1,
          "type": "TEXT",
          "data": `The scope of the ${this.dataReportTitle} study includes the market size analysis and a detailed analysis of the manufacturer’s products and strategies. The market has been segmented based on ${this.segmentString} and region.`
        }];
      } else if (item.key == "researchObjective") {
        item.data = [{
          "id": 1,
          "type": "TEXT",
          "data": `<ul><li>To provide a comprehensive analysis of the ${this.dataReportTitle.trim().replace('Global', '')} and its sub-segments in the global market, thereby providing a detailed structure of the industry.</li><li>To provide detailed insights into factors driving and restraining the growth of the ${this.dataReportTitle}.</li><li>To estimate the market size of the ` + this.dataReportTitle.trim() + ` where ${parseInt(this.baseYear) - 2}, ${parseInt(this.baseYear) - 1} would be the historical year, ${this.baseYear} shall be the base year, and ` + (parseInt(this.baseYear) + 1) + ` to ` + this.currentReport.me.end_year + ` will be forecast period for the study.</li><li>To analyze the ` + this.dataReportTitle.trim() + ` in four main geographies, namely, the North America, Europe, Asia-Pacific, and Rest of the World.</li><li>To provide country-wise market value analysis for various segments of the ` + this.dataReportTitle.trim() + `.</li><li>To provide strategic profiling of key companies (manufacturers and distributors) present across the globe, and comprehensively analyze their competitiveness/competitive landscape in this market.</li><li>To provide a distribution chain analysis/value chain for the ` + this.dataReportTitle.trim() + `.<br></li></ul>`
        }];
      } else if (item.key == "structure") {
        item.data = [{
          "id": 1,
          "type": "IMAGE",
          "data": {
            "metaDataValue": {
              "source": "MRFR Analysis",
              "title": this.currentReport.title + " Market: Market structure",
              "type": "3"
            },
            "imageUrl": this.marketStructureImg
          }
        }];
      } else if (item.key == 'assumptions') {
        item.data = [{
          "id": 1,
          "type": "CUSTOM",
          data: {
            title: "List of assumptions",
            data: [
              {
                title: [{ title: this.sampleInputService.convertIntoHeading("Parameter") }],
                data: [{ data: this.sampleInputService.convertIntoHeading("Assumption & Limitations") }]
              },
              {
                title: [{ title: this.sampleInputService.convertIntoHeading("Currency value") }],
                data: [{ data: "All the forecasts are done with the revenue and volume calculated under the standard assumption that the globally accepted currency - the U.S. Dollar's value remains constant over the next five years." }]
              },
              {
                title: [{ title: [this.sampleInputService.convertIntoHeading("Exchange rates and currency") + '<br>' + this.sampleInputService.convertIntoHeading("Conversion")] }],
                data: [{
                  data: "For conversion of various currencies to USD, average historical exchange rates were used according to the year specified. For all historical and current exchange rates required for calculations & currency conversions - OANDA - website was used in this research study."
                }]
              },
              {
                title: [{ title: this.sampleInputService.convertIntoHeading("Niche market segments") }],
                data: [{
                  data: "For niche market segments where accurate data of the respective time line was not available, the data was calculated using trend line analysis. In some instances, where mathematical and statistical models could not be applied to arrive at the number, generalization of specific related trends to that particular market was done"
                }]
              },
              {
                title: [{ title: this.sampleInputService.convertIntoHeading("Qualitative analysis") }],
                data: [{
                  data: "The qualitative analysis done from the quantitative data arrived at is solely based on the understanding of the market and its trends by the team of experts involved in making this report."
                }]
              },
              {
                title: [{
                  title: this.sampleInputService.convertIntoHeading("Average Selling Prices (ASP)")
                }],
                data: [{
                  data: "The ASPs, wherever applied, are calculated using all kinds of suitable statistical and mathematical methods and considering external qualitative factors affecting the prices. All the calculations interconnected between the tables are done considering the finalized ASPs."
                }]
              }
            ]
          }
        }];
      } else if (item.key == 'keyBuyingCriteria') {
        item.data = [
          {
            "id": 1,
            "type": "IMAGE",
            "data": {
              "metaDataValue": {
                "source": "MRFR Analysis",
                "title": "KEY BUYING CRITERIA",
                "type": "3"
              },
              "imageUrl": SampleImage.MARKET_INTRODUCTION_1
            }
          }
        ];
      }
    });
    this.toastr.success('Market Dynamics data generated successfully', 'Message');
    }
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
    this.router.navigateByUrl(`/me-report/${this.currentReport._id}/global-info/market-introduction`);
  }

  onEdit() {
    this.router.navigateByUrl(`/me-report/${this.currentReport._id}/global-info/market-introduction`);
  }

  toPreviousPage() {
    this._location.back();
  }
  convertIntoHeading(str) {
    return "<b>" + str + "</b>"
  }
  convertToList(array) {
    let allList = []
    let list = "<ul>"
    array.forEach(ele => {
      list = list + "<li>" + ele + "</li>"
    });
    list = list + "</ul>"
    allList.push(list)
    return allList
  }

  generateMarketStructure() {
    this.segmentService.getReportInfoByKey(this.currentReport._id, 'me,title')
      .subscribe(data => {
        if (data && data.me && data.me.segment && data.me.segment.length && data.me.geo_segment && data.me.geo_segment.length) {
          this.parents = _.filter(data.me.segment, ['pid', '1']);
          if (this.parents.length) {
            this.parents.forEach(d => {
              d.childrens = _.filter(data.me.segment, ['pid', d.id])
              if (d.childrens && d.childrens.length) {
                d.childrens.forEach(dd => {
                  dd.childrens = _.filter(data.me.segment, ['pid', dd.id])
                  dd.childrens.forEach(ddd => {
                    ddd.name = ddd.name.split(dd.name + "_").join('');
                  })
                })
              }
            })
          }
          this.regions = data.me.geo_segment
        }
      });
  }
  ngAfterViewInit() {
    if (this.marketStructure.nativeElement) {
      setTimeout(()=>{
        this.generateImage();
      },3000)
    }
  }
  generateImage() {
    // @ts-ignore
    html2canvas(this.marketStructure.nativeElement).then(canvas => {
      this.marketStructureImg = canvas.toDataURL();
      this.hide = false;      
    });
  }
}
