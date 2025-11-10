import { Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { ConstantKeys } from 'src/app/constants/mfr.constants';
import { LocalStorageService } from 'src/app/services/localsotrage.service';
import { ReportService } from 'src/app/services/report.service';
import _ from 'lodash';
import { ToastrService } from 'ngx-toastr';
import { ReportSectionService } from 'src/app/services/report-section.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import * as pieConfig from '../../core/pie-chart-input/pie-chart-sample-configs';
import { SegmentService } from 'src/app/services/segment.service';
import { SampleInputService } from 'src/app/services/sample-input.service';
import { SampleImage } from 'src/app/constants/sample-image.constants';

@Component({
  selector: 'app-generate-sample-research-methodology',
  templateUrl: './generate-sample-research-methodology.component.html',
  styleUrls: ['./generate-sample-research-methodology.component.scss']
})
export class GenerateSampleResearchMethodologyComponent implements OnInit {
  currentReport: any;
  currentSection: any;
  imgArray: any = [];
  secondaryData: any[];
  pieChartType = pieConfig.pieChartSampleType;
  pieChartOptions = pieConfig.pieChartSampleOptions;
  pieChartPlugins = pieConfig.pieChartSamplePlugins;
  pieChartColors = pieConfig.pieChartSampleColors;
  pieChartLegend = pieConfig.pieChartSampleLegend;
  meData: any;
  dataReportTitle = '';

  constructor(
    private _location: Location,
    private spinner: NgxSpinnerService,
    private localStorageService: LocalStorageService,
    private reportService: ReportService,
    private toastr: ToastrService,
    private reportSectionService: ReportSectionService,
    private snackBar: MatSnackBar,
    private router: Router,
    private segmentService: SegmentService,
    private sampleInputService: SampleInputService
  ) {
  }

  ngOnInit() {
    this.currentReport = this.localStorageService.get(ConstantKeys.CURRENT_REPORT);
    this.currentSection = this.localStorageService.get(ConstantKeys.CURRENT_SECTION);
    this.dataReportTitle = this.currentReport.title.trim() + " market";
    this.getMEData();
    this.getRMData();
  }

  generateData() {
    this.secondaryData = [];
    this.secondaryData = [{
      content: [
        {
          "id": 1,
          "type": "TEXT",
          "data": `The research starts with the extensive procurement process of data/information and statistics from company annual reports,
        government websites, statistics agencies, and paid databases. This information creates a base for the study. The information also
        helps to define the scope and to narrow down the area for study for the market. This raw information is processed and analyzed to
        extract crisp data points which currently affect or are likely to affect the industry during the forecast period. After analyzing the
        information, a proprietary statistical tool is used for market estimation and forecast, which generates the quantitative figures/sizes of
        the market/sub-segments in the current scenario as well as for the forecast period.`
        },
        {
          "id": 2,
          type: "TEXT",
          data: `After estimating the market sizes and estimates, the numbers are verified with industry participants and key opinion leaders. The wide
        network of industry participants add value to the research and verify the numbers and estimates provided in the study. At the last
        stage of the research process, a final report is prepared, which is then published on different websites as well as distributed through
        various channels. The below figure contains the different stages of the research process to produce the report.`
        },
        {
          "id": 3,
          type: "IMAGE",
          data: {
            imageUrl: SampleImage.RM_INTRO,
            metaDataValue: {
              source: "MRFR Analysis",
              title: "The different stages of the research process to produce the report"
            }
          }
        },
        {
          "id": 4,
          "type": "HEADING",
          "data": `Data Mining`
        },
        {
          "id": 5,
          "type": "TEXT",
          "data": `Data mining is an extensive part of our research process. It involves the procurement of market data and related information from
        different verified and credible sources. This step helps to obtain raw information about the components of the industry and their
        source, the monetary process for different end uses, the pool of market participants, and the nature of the industry and scope of the
        study. The data mining stage comprises both primary and secondary sources of information.`
        },
        {
          "id": 6,
          "type": "HEADING",
          "data": `Secondary Research`
        },
        {
          id: 7,
          type: "TEXT",
          data: `In the secondary research process, various sources are used to identify and gather industry trends and information for the research
        process. We at MRFR have access to some of the most diversified and extensive paid databases, which give us the most accurate
        data/ information on markets sizes, components, and pricing. Mentioned below is a detailed list of Sources that have been used for
        this study. Please note that this list is not limited to the names as mentioned; we also access other data Sources depending on the
        need.`
        },
        {
          id: 8,
          type: "CUSTOM",
          data: {
            title: "Secondary Research",
            data: [{
              title: [{ title: this.sampleInputService.convertIntoHeading("Market Sizing & Revenue") }],
              data: [{ data: this.sampleInputService.convertIntoHeading("Qualitative Information & Trends") }]
            }, {
              title: [
                {
                  title: this.sampleInputService.convertToList(["Company Websites", "Annual Reports",
                    "Investor Presentations", "Authenticated Directories",
                    "Hoover’s, Factiva, Bloomberg"])
                }],
              data: [
                {
                  data: this.sampleInputService.convertToList(["White Papers", "Magazines", "Company Websites",
                    "Annual Reports", "Press Releases", "Investor Presentations",
                    "Paid Databases", "Authenticated Directories", "Independent Studies",
                    "Internal Audit Report & Archives", "Government and Regulatory Published Material"
                  ])
                }]
            }
            ]
          }
        },
        {
          "id": 9,
          "type": "HEADING",
          "data": `Primary Research`
        },
        {
          id: 10,
          type: "TEXT",
          data: `In the primary research process, in-depth primary interviews are conducted with the CXOs to understand the market share, customer
        base, pricing strategies, channel partners, and other necessary information. Besides, in-depth primary interviews are conducted with
        the CXOs of vendors, channel partners, and others to validate the supply-side information. In addition, various key industry participants
        from both the supply and demand side are interviewed to obtain qualitative and quantitative information on the market. In-depth
        interviews with key primary respondents, including industry professionals, subject matter experts (SMEs), industry consultants, and
        C-level executives of major companies, are conducted to obtain critical qualitative and quantitative information pertaining to the
        market, as well as to assess the prospects for market growth during the forecast period. Detailed information on these primary
        respondents is mentioned below.`
        },
        {
          id: 11,
          type: "CUSTOM",
          data: {
            title: "Primary Research",
            data: [{
              title: [{ title: this.sampleInputService.convertIntoHeading("Primary Respondent Type") }],
              data: [
                {
                  data: this.sampleInputService.convertToList(["Product Development Side Subject Matter Experts, Top Management, and CXOs",
                    "Technical Persons of Organizations Operating in the Market",
                    "Marketing and Business Development Managers, VPs, and Marketing Directors",
                    "Various Partner Consultants from the Demand and Supply Sides"])
                }]
            }]
          }
        },
        {
          id: 12,
          type: "CUSTOM",
          data: {
            title: "Major Primary Respondents fromthe Demand Side",
            data: [{
              title: [{ title: this.sampleInputService.convertIntoHeading("Major Primary Respondents from the Demand Side") }],
              data: [
                {
                  data: this.sampleInputService.convertToList(["XXX",
                    "XXX",
                    "XXX"])
                }]
            }]
          }
        },
        {
          "id": 13,
          "type": "HEADING",
          "data": `Primary Interviews And Information Gathering Process`
        },
        {
          id: 14,
          type: "CUSTOM",
          data: {
            title: "Major Primary Respondents fromthe Demand Side",
            data: [{
              title: [{ title: this.sampleInputService.convertIntoHeading("Respondents") }],
              data: [
                {
                  data: this.sampleInputService.convertIntoHeading("Data Points Received")
                }]
            },
            {
              title: [{ title: this.sampleInputService.convertIntoHeading("Manufacturers and Distributors") }],
              data: [
                {
                  data: this.sampleInputService.convertToList([
                    "Market Size",
                    "Top of the Mind Key Market Players",
                    "Direct Competitors",
                    "Company Market Shares",
                    "Growth Rate (%)",
                    "Market Trends and Prominent Market Drivers",
                    "Major Products/Services",
                    "Type Cost",
                    "Commercial Availability",
                    "Regional Scenario (Americas, Europe, Asia-Pacific, and Rest of the World)"
                  ])
                }]
            },
            {
              title: [{ title: this.sampleInputService.convertIntoHeading("End Users") }],
              data: [
                {
                  data: this.sampleInputService.convertToList([
                    "Type Costs",
                    "Preferred Products/Services",
                    "New Developments in Related Market"
                  ])
                }]
            }]
          }
        },

        {
          "id": 15,
          "type": "HEADING",
          "data": `Breakdown of Primary Respondents`
        },
        {
          id: 16,
          type: "PIE",
          data: {
            metaDataValue: {
              title: this.dataReportTitle + " Market, by Company",
              source: "MRFR Analysis",
              calType: "",
              columns: [{ header: "Tier 1", value: "15" }, { header: "Tier 2", value: "34" }, { header: "Tier 3", value: "51" },]
            },
            chartLabels: ['Tier 1', 'Tier 2', 'Tier 3'],
            chartData: ['15', '34', '51']
          }
        },
        {
          id: 17,
          type: "PIE",
          data: this.generatePieData(this.meData.geo_segment)
        },
        {
          id: 18,
          type: "PIE",
          data: {
            metaDataValue: {
              title: this.dataReportTitle + " Market, by Designation",
              source: "MRFR Analysis",
              calType: "",
              columns: [{ header: "C-Level", value: "13" }, { header: "D-Level", value: "22" }, { header: "Managers", value: "58" }, { header: "Engineers/Technicians", value: "7" },]
            },
            chartLabels: ['C-Level', 'D-Level', 'Managers', 'Engineers/Technicians'],
            chartData: ['13', '22', '58', '7']
          }
        },
        {
          "id": 19,
          "type": "HEADING",
          "data": `Forecasting Techniques`
        },
        {
          id: 20,
          type: "TEXT",
          data: `We at MRFR follow an extensive process for arriving at market estimations, which involves the use of multiple forecasting techniques
        as mentioned below.`
        },
        {
          id: 21,
          type: "CUSTOM",
          data: {
            title: "Forecasting Techniques",
            data: [
              {
                title: [{ title: this.sampleInputService.convertIntoHeading("Forecasting Techniques") }],
                data: [{ data: this.sampleInputService.convertIntoHeading("Description") }]
              },
              {
                title: [{ title: this.sampleInputService.convertIntoHeading("Qualitative and Quantitative Analysis") }],
                data: [{ data: "A combination of qualitative approach, i.e., primary interviews with industry experts to understand the interviewees’ opinions and judgments, more commonly known as the Delphi method, and quantitative analysis to forecast future data based on historical and current data" }]
              },
              {
                title: [{ title: this.sampleInputService.convertIntoHeading("Weighted Average Approach") }],
                data: [{
                  data: `Via this approach, future data is calculated based on the mean of the past data under the
              assumption that some factors affecting the market in the past will continue to have a similar
              impact in the future` }]
              },
              {
                title: [{ title: this.sampleInputService.convertIntoHeading("Drift Method") }],
                data: [{
                  data: `This approach is used to vary the forecast, that is increase or decrease market factor over
              time depending on various parameters affecting the change in the trends of the market` }]
              },
              {
                title: [{ title: this.sampleInputService.convertIntoHeading("Time Series Methods") }],
                data: [{
                  data: `Integration of several time series methods such as moving average, moving weighted
              average, linear prediction, and trend estimation are applied while determining the year-onyear growth rate and the compound annual growth rate of the market being studied` }]
              },
              {
                title: [{
                  title: this.sampleInputService.convertIntoHeading(`Causal/Econometric
              Forecasting Methods`)
                }],
                data: [{
                  data: `Various economic factors such as inflation rate, fiscal policies, changes in government
              regulations, taxes, labor costs, and interest rates are taken into consideration while
              determining the current market size and predicting the future market growth rate` }]
              },
              {
                title: [{ title: this.sampleInputService.convertIntoHeading("Judgmental Methods") }],
                data: [{
                  data: `This involves collection of intuitive judgment, opinions, and probability estimates from
              industry experts in the case of new or upcoming markets/technologies for which no prior
              data is available` }]
              },
              {
                title: [{ title: this.sampleInputService.convertIntoHeading("Regression Analysis") }],
                data: [{
                  data: `This type of statistical modeling is carried out for predicting and forecasting dependent and
              independent variables that will directly or indirectly impact the market` }]
              },
              {
                title: [{ title: this.sampleInputService.convertIntoHeading("Probabilistic Forecasting") }],
                data: [{
                  data: `This forecasting method is carried out to assign a probability to every possible outcome
              ranging from the least optimistic to highly optimistic, which helps in gauging the market
              under stable conditions` }]
              },
              {
                title: [{ title: this.sampleInputService.convertIntoHeading("PESTLE Analysis") }],
                data: [{
                  data: `Political, economic, social, technological, legal, and environmental factors are taken into
              consideration while deriving the fluctuations in the growth rate of the market` }]
              },
              {
                title: [{ title: this.sampleInputService.convertIntoHeading("Porter’s Five Forces Analysis") }],
                data: [{
                  data: `By understanding the supplier-side and demand-side factors, the current market scenario
              can be estimated, and future market scenario predicted, which aid in deriving the growth rate of the market` }]
              }
            ]
          }
        },
        {
          "id": 22,
          "type": "HEADING",
          "data": `Research Methodology for Market size estimation`
        },
        {
          id: 23,
          type: "TEXT",
          data: `Understanding the market in terms of valuation is a crucial task. This becomes significantly important while investing in and choosing
        the correct business opportunities. In this regard, we at MRFR undertake two market sizing approaches simultaneously, namely, the
        top-down and bottom-up approaches. In this step, we assess different data points, numeric attributes, information, and industry trends
        to arrive at the estimates and forecast values for the coming years. We use different mathematical models to estimate the market
        sizes of different economies and segments, each of which is further summed up to define the total market.`
        },
        {
          id: 24,
          type: "TEXT",
          data: `We at MRFR employ a proprietary statistical tool for market estimations, which helps us to arrive at market size estimates and
forecasts for different markets and industries. `
        },
        {
          id: 25,
          type: "IMAGE",
          data: {
            imageUrl: SampleImage.RM_TOP_BOTTOM,
            metaDataValue: {
              source: "MRFR Analysis",
              title: "BOTTOM-UP AND TOP-DOWN APPROACHES"
            }
          }
        },
        {
          "id": 26,
          "type": "HEADING",
          "data": `Bottom-up approach`
        },
        {
          id: 27,
          type: "TEXT",
          data: `In the bottom-up approach, the revenue of key companies and their shares in the market are assessed to deduce the market size.
        More than 25 key players operating in the ${this.dataReportTitle} market are studied. The segmental revenue of each player is analyzed and the
        size for the ${this.dataReportTitle} market is extracted from the segmental/product revenue with the help of secondary and primary research.          
        The extracted size for the market is then validated with industry experts and partner consultants. This derived market size contributes
        to around 65%–70% of the total global market share in terms of revenue for the ${this.dataReportTitle} market. Using the data triangulation
        method, the overall global market size is estimated.`
        },
        {
          "id": 28,
          "type": "HEADING",
          "data": `Top-Down approach`
        },
        {
          id: 29,
          type: "TEXT",
          data: `The overall market size is then used in the top-down procedure to estimate the size of the other sub-markets with the help of
        percentage splits of the market segments from secondary and primary research. The demand-side analysis is conducted, in which the
        expenditure of major industry players in each region is studied.`
        },
        {
          id: 30,
          type: "TEXT",
          data: `The countries considered in the scope of the ${this.dataReportTitle} market are the US, Canada, Mexico, the UK, Germany, France, Italy, Spain,
        China, Japan, India, Australia & New Zealand, South Africa, Egypt, Nigeria, Saudi Arabia, Qatar, the UAE, Bahrain, Kuwait, and Oman,
        Brazil, Argentina, Chile, and others. However, the number of countries varies according to the market.
        The figure below depicts the process of market estimation using independent tools employed by our analysts to arrive at the sizing of
        the market.`
        },
        {
          id: 31,
          type: "IMAGE",
          data: {
            imageUrl: SampleImage.RM_MARKET_PROCESS,
            metaDataValue: {
              source: "MRFR Analysis",
              title: "The process of market estimation using independent tools employed by our analysts"
            }
          }
        },
        {
          id: 32,
          type: "TEXT",
          data: `As a part of the market engineering, the both top-down and bottom-up approaches are utilized along with data triangulation models
        to derive and verify the market sizes and forecast over the coming years.`
        },
        {
          "id": 33,
          "type": "HEADING",
          "data": `Data Triangulation`
        },
        {
          id: 34,
          type: "TEXT",
          data: `After arriving at the overall market sizes, the total market is divided into several segments and sub-segments. Again, the market
        breakdown and data triangulation procedures are implemented, wherever applicable, to complete the overall market engineering
        process and gather the exact statistics for all segments and sub-segments. The data is triangulated by studying various factors and
        trends from the demand and supply sides. Along with this, the market size is validated using the top-down and bottom-up approaches.`
        },
        {
          "id": 35,
          "type": "HEADING",
          "data": `Validation`
        },
        {
          id: 36,
          type: "TEXT",
          data: `Validation is the most important stage of the report making process. Validation via an intricately designed feedback process helps us
        finalize the sizing estimates and forecast for the final collation. Extensive primary research is performed to verify the information. This
        includes telephonic and personal interviews, e-mails, feedback forms, questionnaires, and polling options/answers with a group of
        relevant industry participants. Validation helps to duly check the authenticity of the key industry trends, market dynamics, company
        market share, different business models, and conclusions.`
        }
      ]
    }]
    this.toastr.success('Market Dynamics data generated successfully', 'Message');
  }

  saveAndContinue() {
    this.spinner.show();
    const sectionData = this.localStorageService.get(ConstantKeys.CURRENT_SECTION);
    sectionData.content = this.reportSectionService.convertToSecondaryDataElement(this.secondaryData[0].content ? this.secondaryData[0].content : []);
    this.reportService.saveTocCustomInfoByReportSection(this.currentReport, sectionData, sectionData)
      .subscribe(data => {
        this.onEdit();
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

  deleteElement(element) {
    _.remove(this.secondaryData, (d) => d === element);
  }

  toPreviousPage() {
    this._location.back()
  }

  onEdit() {
    this.router.navigateByUrl(`/me-report/${this.currentReport._id}/global-info/other-module`);
  }

  generatePieData(regions) {
    let division = 100 / regions.length;
    let chartData = []
    let chartLabels = []
    let columns = []
    regions.forEach(e => {
      chartData.push(division)
      chartLabels.push(e.region)
      columns.push({
        header: e.region,
        value: division
      })
    })
    const data = {
      metaDataValue: {
        title: this.dataReportTitle  + " Market, by Regions",
        source: "MRFR Analysis",
        calType: "",
        columns: columns
      },
      chartLabels: chartLabels,
      chartData: chartData
    };
    return data;
  }

  getMEData() {
    this.segmentService.getReportInfoByKey(this.currentReport._id, 'me')
      .subscribe(data => {
        if (data && data.me) {
          this.meData = data.me;
        }
      }, error => {
        console.log(error);
      });
  }

  getRMData() {
    this.spinner.show();
    this.reportService.getTocByMainSectionId(this.currentReport._id, this.currentSection.main_section_id).subscribe(data => {
      if (data && data.data && data.data.length) {
        if (data.data[0].toc && data.data[0].toc.content && data.data[0].toc.content.length) {
          data.data[0].toc.content.forEach(item => {
            item.id = item.order_id;
            if (item.type == 'IMAGE') {
              item.data = {
                imageUrl: item.data.imageUrl,
                metaDataValue: {
                  source: "MRFR Analysis",
                  title: item.data.title
                }
              }
            }
            if (item.type == 'TEXT') {
              item.data = item.data.content;
            }
            if(item.type == 'PIE'){
              item.data = {
                metaDataValue:item.data,
                chartLabels: _.map(item.data.columns,'header'),
                chartData: _.map(item.data.columns,'value')
              }
            }
          })
          this.secondaryData = [{ content: data.data[0].toc.content }]
        }
      }
      this.spinner.hide();
    });
  }
}