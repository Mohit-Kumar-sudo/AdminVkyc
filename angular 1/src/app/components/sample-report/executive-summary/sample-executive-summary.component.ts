import { Component, OnInit } from '@angular/core'
import { MasterReportData, RegionCountry } from 'src/app/models/me-models';
import { SegmentService } from 'src/app/services/segment.service';
import { SegmentNodeRequest } from 'src/app/models/segment-models';
import { ReportService } from 'src/app/services/report.service';
import { LocalStorageService } from 'src/app/services/localsotrage.service';
import { ConstantKeys } from 'src/app/constants/mfr.constants';
import { MatSnackBar } from '@angular/material';
import { NgxSpinnerService } from 'ngx-spinner';
import { MasterReportSecondarySectionData, ReportDataElement, BAR, PIE, CUSTOM_TABLE, TEXT, IMAGE, CUSTOM } from 'src/app/models/secondary-research-models';
import { ReportSectionService } from 'src/app/services/report-section.service';
import * as pieConfig from '../../core/pie-chart-input/pie-chart-sample-configs';
import * as barConfig from '../../core/bar-chart-input/bar-chart-sample-configs';
import { Router } from '@angular/router';
import { Location } from '@angular/common';
import { SampleImage } from 'src/app/constants/sample-image.constants';
import { SampleInputService } from 'src/app/services/sample-input.service';

@Component({
  selector: 'app-sample-executive-summary',
  templateUrl: './sample-executive-summary.component.html',
  styleUrls: ['./sample-executive-summary.component.scss']
})
export class SampleExecutiveSummaryComponent implements OnInit {
  currentReport: MasterReportData = null;
  startYear = "";
  endYear = "";
  baseYear = "";
  meRegionsList: RegionCountry[] = [];
  meSegmentsList: SegmentNodeRequest[] = [];
  segments = [];
  secondaryInputData: ReportDataElement[] = [];
  pieChartType = pieConfig.pieChartSampleType;
  pieChartOptions = pieConfig.pieChartSampleOptions;
  pieChartPlugins = pieConfig.pieChartSamplePlugins;
  pieChartColors = pieConfig.pieChartSampleColors;
  pieChartLegend = pieConfig.pieChartSampleLegend;

  barChartType = barConfig.barChartType;
  barChartOptions = barConfig.barChartOptions;
  barChartColors = barConfig.barChartColors;
  barChartPlugins = barConfig.barChartPlugins;
  barChartLegend = barConfig.barChartLegend;
  barData: any;
  chartOptions: any;

  tableData = {
    title: "",
    data: []
  }
  allData = ["Drivers", "Restraints", "Opportunities"]
  mdData = []
  currentCompanyList = []
  constructor(
    private segmentService: SegmentService,
    private reportService: ReportService,
    private localStorageService: LocalStorageService,
    private snackBar: MatSnackBar,
    private spinner: NgxSpinnerService,
    private reportSectionService: ReportSectionService,
    private router: Router,
    private _location: Location,
    private sampleInputService: SampleInputService
  ) { }

  ngOnInit() {
    this.currentReport = this.localStorageService.get(ConstantKeys.CURRENT_REPORT);
    this.spinner.show();
    this.getFormDetails();
    this.segmentService.getReportInfoByKey(this.currentReport._id, 'me')
      .subscribe(data => {
        this.baseYear = data.me.base_year;
        this.startYear = data.me.start_year;
        this.endYear = data.me.end_year;
        this.meRegionsList = data.me.geo_segment;
        this.segments = data.me.segment
        this.meSegmentsList = data.me.segment.filter((i) => {
          return (i.pid == "1")
        });
      });
    this.reportService.getTocByMainSectionId(this.currentReport._id, 5).subscribe(data => {
      if (data && data.data && data.data.length) {
        this.allData.forEach((e, i) => {
          let dt = data.data.filter((i) => i.toc.meta_info.parent_section_value == e)

          if (dt.length) {
            if (e != 'Introduction') {
              let child = {
                type: e,
                children: []
              }
              child.children = dt.map(ele => ele.toc.meta.data.name);
              this.mdData.push(child)
            }
          }
        })
      }
      this.reportService.getReportCompanyProfiles(this.currentReport).subscribe(
        res => {
          if (res && res.data && res.data.length > 0) {
            res.data[0].cp.map((ele) => {
              ele._id = ele.company_id;
            });
          }
          let companies = res.data[0].cp;
          this.currentCompanyList = companies.map(ele => ele.company_name);
        });
    });
    this.spinner.hide();
  }
  getFormDetails() {
    const sectionData = this.localStorageService.get(ConstantKeys.CURRENT_SECTION);
    this.reportService.getTocDetails(this.currentReport._id, sectionData.section_id, sectionData.main_section_id).subscribe(data => {
      this.getFormDetailsSuccess(data);
    });
  }
  getFormDetailsSuccess(data: MasterReportSecondarySectionData) {
    if (data && data.content) {
      this.secondaryInputData = this.reportSectionService.convertToReportDataElement(data.content);
    }
  }

  generateChartData() {
    this.secondaryInputData = [];
    this.secondaryInputData.push(this.sampleInputService
      .generateText(`${this.currentReport.title.trim()} market is expected to grow at XX% CAGR during the forecast period, ${parseInt(this.baseYear) + 1}-${this.endYear}`, this.secondaryInputData.length))
    this.secondaryInputData.push(this.sampleInputService.generateText('XX', this.secondaryInputData.length))
    this.generateTableData();
    let allYears = []
    allYears.push(parseInt(this.baseYear) - 1)
    allYears.push(parseInt(this.baseYear))
    allYears.push(parseInt(this.baseYear + 1))
    allYears.push(parseInt(this.endYear))
    this.meSegmentsList.forEach(el => {

      let allSubSegments = this.segments.filter((i) => i.pid == el.id);
      this.secondaryInputData.push(this.sampleInputService.generateHeading(
        this.currentReport.title.trim() + " Market", el.name, this.secondaryInputData.length))
      this.secondaryInputData.push(this.sampleInputService.generateText('XX', this.secondaryInputData.length))
      this.generatePieData(allSubSegments, el.name)
      this.generateBarData(allSubSegments, allYears, el.name)
    })
    this.secondaryInputData.push(this.sampleInputService
      .generateHeading(this.currentReport.title.trim() + " Market", "region", this.secondaryInputData.length))
    this.secondaryInputData.push(this.sampleInputService
      .generateImage(SampleImage.EXECUTIVE_SUMMARY_1, this.currentReport.title.trim()
        + " Market Analysis By Region", this.secondaryInputData.length))
    this.snackBar.open('Executive Summary data generated successfully', 'Close', {
      duration: 4000,
    });
  }
  generateBarData(allSubSegments, allYears, segment) {
    let dataStore = []
    let chartLabels = []
    let chartData = []
    allSubSegments.forEach(e => {
      chartLabels.push(e.name)
      let dataStoreData = {
        rowHeader: e.name
      }
      allYears.forEach((e, i) => {
        dataStoreData[e] = (10 * (i + 1)).toString()
      })
      dataStore.push(dataStoreData)
    })
    let colMetaData = [
      {
        "header": segment + "/Market Size - (USD Million)",
        "name": "rowHeader",
        "type": "text"
      }
    ]
    allYears.forEach((e, i) => {
      let data = []
      allSubSegments.forEach(e => {
        data.push(10 * (i + 1))
      })

      let dt = {
        label: e,
        data: data,
      }
      chartData.push(dt)
      let yearDt = {
        "name": e.toString(),
        "header": e.toString(),
        "type": "number"
      }
      colMetaData.push(yearDt)
    })
    const data = {
      metaDataValue: {
        source: "MRFR Analysis",
        title: this.currentReport.title.trim() + " Market Analysis by " + segment,
        labelX: segment,
        labelY: "Market Size - (USD Million)"
      },
      chartLabels: chartLabels,
      chartData: chartData,
      colMetaData: colMetaData,
      dataStore: dataStore,
    };
    const dataNode = this.sampleInputService.createReportDataElement(BAR, data,
      this.secondaryInputData.length);
    this.secondaryInputData.push(dataNode);
  }
  generatePieData(allSubSegments, segment) {
    let division = 100 / allSubSegments.length;
    let chartData = []
    let chartLabels = []
    let columns = []
    allSubSegments.forEach(e => {
      chartData.push(division)
      chartLabels.push(e.name)
      columns.push({
        header: e.name,
        value: division
      })
    })
    const data = {
      metaDataValue: {
        title: this.currentReport.title.trim() + " Market Analysis by " + segment,
        source: "",
        calType: "",
        columns: columns
      },
      chartLabels: chartLabels,
      chartData: chartData
    };
    const dataNode = this.sampleInputService.createReportDataElement(PIE, data,
      this.secondaryInputData.length);
    this.secondaryInputData.push(dataNode)
  }
  generateTableData() {
    let keyGeographies = []
    let keyCountries = []
    this.meRegionsList.forEach(ele => {
      let region = ele.region + ": XX%"
      keyGeographies.push(region)
      ele.countries.forEach(e => {
        let country = e.name + ": XX%"
        keyCountries.push(country)
      })
    })
    let tableData = {
      title: "Market Synopsis",
      data: [
        {
          title: [{ title: this.sampleInputService.convertIntoHeading("Market Size") }],
          data: [{ data: this.sampleInputService.convertToList([this.baseYear + ": USD XX Million", this.endYear + ": USD XX Million"]) }]
        },
        {
          title: [{ title: this.sampleInputService.convertIntoHeading("CAGR (" + (this.baseYear + 1) + "-" + this.endYear + ")") }],
          data: [{ data: this.sampleInputService.convertToList(["XX%"]) }]
        },
        {
          title: [{ title: this.sampleInputService.convertIntoHeading("Key Geographies") }],
          data: [{ data: this.sampleInputService.convertToList(keyGeographies) }]
        },
        {
          title: [{ title: this.sampleInputService.convertIntoHeading("Key Countries") }],
          data: [{ data: this.sampleInputService.convertToList(keyCountries) }]
        }
      ]
    }
    this.mdData.forEach(e => {
      if (e.type == "Drivers" || e.type == "Restraints") {
        let mdDt = {
          title: [{ title: this.sampleInputService.convertIntoHeading("Key Market " + e.type) }],
          data: [{ data: this.sampleInputService.convertToList(e.children) }]
        }
        tableData.data.push(mdDt)
      }
    })
    if (this.currentCompanyList.length > 0) {
      let cpDt = {
        title: [{ title: this.sampleInputService.convertIntoHeading("Key Vendors") }],
        data: [{ data: this.sampleInputService.convertToList(this.currentCompanyList) }]
      }
      tableData.data.push(cpDt)
    }
    const dataNode = this.sampleInputService.createReportDataElement(CUSTOM, tableData,
      this.secondaryInputData.length);
    this.secondaryInputData.push(dataNode)
  }
  save() {
    this.spinner.show();
    const currentSectionInfo = this.localStorageService.get(ConstantKeys.CURRENT_SECTION);
    currentSectionInfo.content = this.reportSectionService.convertToSecondaryDataElement(this.secondaryInputData);

    this.reportService.saveTocInfoByReportSection(this.currentReport, currentSectionInfo)
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
  onEdit() {
    const currentSectionInfo = this.localStorageService.get(ConstantKeys.CURRENT_SECTION);
    this.router.navigateByUrl(`me-report/${this.currentReport._id}/global-info/${currentSectionInfo.urlpattern}`);
  }
  toPreviousPage() {
    this._location.back();
  }
}