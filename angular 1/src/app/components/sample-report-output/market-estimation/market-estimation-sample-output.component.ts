import { Component, Input, OnInit } from '@angular/core'
import { ConstantKeys } from 'src/app/constants/mfr.constants';
import { MasterReportData, RegionCountry } from 'src/app/models/me-models';
import { BAR, PIE, ReportDataElement, ME_TABLE, ME_LIST, ME_TABLE_HEADING } from 'src/app/models/secondary-research-models';
import { SegmentNodeRequest } from 'src/app/models/segment-models';
import { LocalStorageService } from 'src/app/services/localsotrage.service';
import { SegmentService } from 'src/app/services/segment.service';
import { SharedSampleTocService, TocContent } from 'src/app/services/shared-sample-toc.service';
import * as _ from 'lodash';
import { SampleOutputService } from 'src/app/services/sample-output.service';
import { SampleInputService } from 'src/app/services/sample-input.service';

@Component({
  selector: 'app-market-estimation-sample-output',
  templateUrl: './market-estimation-sample-output.component.html',
  styleUrls: []
})
export class MarketEstimationSampleOutputComponent implements OnInit {
  @Input() selectedModule: any;
  currentReport: MasterReportData = null;
  startYear = "";
  endYear = "";
  baseYear = "";
  meRegionsList: RegionCountry[] = [];
  meSegmentsList: SegmentNodeRequest[] = [];
  segments = [];
  allTocContent: TocContent[] = [];
  mainContent: ReportDataElement[] = [];
  allYears = [];
  regions = [];
  title = "";

  constructor(
    private localStorageService: LocalStorageService,
    private segmentService: SegmentService,
    private sharedSampleTocService: SharedSampleTocService,
    private sampleOutputService: SampleOutputService,
    private sampleInputService: SampleInputService
  ) { }

  ngOnInit() {
    this.currentReport = this.localStorageService.get(ConstantKeys.CURRENT_REPORT);
    this.title = this.currentReport.title.trim() + " market"
    this.segmentService.getReportInfoByKey(this.currentReport._id, 'me')
      .subscribe(data => {
        this.baseYear = data.me.base_year;
        this.startYear = data.me.start_year;
        this.endYear = data.me.end_year;
        this.meRegionsList = data.me.geo_segment;
        this.segments = data.me.segment
        
        this.meSegmentsList = this.segments.filter((i) => i.pid == "1")
        this.regions = []
        this.regions = this.meRegionsList.map(e => e.region)
        this.generateToc();
        this.sharedSampleTocService.updateCompletedStatus();
      });
  }
  generateToc() {
    let children = []
    this.meSegmentsList.forEach((e, i) => {
      e['children'] = this.findChild(children, e.id)
      let tocContent = this.sharedSampleTocService.createChapter(this.title + ", By " + e.name)
      tocContent.children.push(this.sampleOutputService.createChild(tocContent, "Introduction", 2, tocContent.id))
      tocContent.children = tocContent.children.concat(this.createTree([], 2, e, tocContent.id))
      this.allTocContent.push(tocContent)
    })
    this.generateMEData();
    this.generateRegionToc();
  }
  generateMEData() {
    this.allYears = []
    this.allYears.push(parseInt(this.baseYear) - 1)
    this.allYears.push(parseInt(this.baseYear))
    this.allYears.push(parseInt(this.baseYear + 1))
    this.allYears.push(parseInt(this.endYear))

    this.allTocContent.forEach((e, i) => {
      this.mainContent.push(this.sampleOutputService.generateHeading(e.id, e.name, e.level, this.mainContent.length))
      this.generateTextHeads(e.children[0].id, e.children[0].name, e.children[0].level)
      this.mainContent.push(this.generatePieData(this.meSegmentsList[i]['children'], this.meSegmentsList[i].name, true, ""))
      this.mainContent.push(this.generateBarData(e['children'], e.name))
      let text = `The XX segment accounted for the largest market share of XX% in ${this.baseYear}, with a market value of USD XX million; it is expected to register a CAGR of XX % during the forecast period. The XX segment was the second-largest market in ${this.baseYear}, valued at USD XX million; it is projected to exhibit a CAGR of XX%.`;
      this.generateRecursiveTables(this.meSegmentsList[i].name, this.meSegmentsList[i], false, text)
      this.generateAllTextHeads(e.children)
    })
  }
  generateAllTextHeads(toc) {
    toc.forEach(el => {
      if (el.name !== 'Introduction') {
        this.generateTextHeads(el.id, el.name, el.level)
        this.generateSubSegmentData(el.name)
        if (el.children && el.children.length) {
          this.generateAllTextHeads(el.children)
        }
      }
    });
  }
  generateTextHeads(id, name, level) {
    this.mainContent.push(this.sampleOutputService.generateHeading(id, this.sampleOutputService.getSegRefactored(name), level, this.mainContent.length))
    this.mainContent.push(this.sampleInputService.generateText('XXX', this.mainContent.length))
  };
  createTree(tocContent, level, segment, id) {
    segment.children.forEach((ele, i) => {
      let child = this.sampleOutputService.createChild(tocContent, ele.name, level, id, i)
      if (ele.children && ele.children.length > 0) {
        let newLevel = level + 1;
        child = this.createTree(child, newLevel, ele, child.id)
      }
      if (level == 2) {
        tocContent.push(child)
      } else {
        tocContent.children.push(child)
      }
    });
    return tocContent
  }
  findChild(children, pid) {
    children = this.segments.filter(e => e.pid === pid)
    children.forEach(element => {
      element.children = this.findChild(element.children, element.id)
    });
    return children
  }
  generatePieData(allSubSegments, segment, isSegment, source, regionName?) {
    let division = 100 / allSubSegments.length;
    let chartData = []
    let chartLabels = []
    let columns = []
    allSubSegments.forEach(e => {
      let label = ""
      label = isSegment? e.name : e
      chartData.push(division)
      chartLabels.push(label)
      columns.push({
        header: label,
        value: division
      })
    })
    const data = {
      metaDataValue: {
        title: this.generatePieChartTitle(segment, regionName),
        source: source,
        calType: "",
        columns: columns
      },
      chartLabels: chartLabels,
      chartData: chartData
    };
    return this.sampleInputService.createReportDataElement(PIE, data, this.mainContent);
  }
  generateBarData(allSubSegments, segment) {
    let dataStore = []
    let chartLabels = []
    let chartData = []
    allSubSegments.forEach(e => {
      if (e.name != "Introduction") {
        chartLabels.push(e.name)
        let dataStoreData = {
          rowHeader: e.name
        }
        this.allYears.forEach((e, i) => {
          dataStoreData[e] = (10 * (i + 1)).toString()
        })
        dataStore.push(dataStoreData)
      }
    })
    let colMetaData = [
      {
        "header": segment + "/Market Size - (USD Million)",
        "name": "rowHeader",
        "type": "text"
      }
    ]
    this.allYears.forEach((e, i) => {
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
        title: this.title + ", By " + segment + ", " + (parseInt(this.baseYear) - 1) + "-" + this.endYear + " (USD Million)",
        labelX: segment,
        labelY: "Market Size - (USD Million)"
      },
      chartLabels: chartLabels,
      chartData: chartData,
      colMetaData: colMetaData,
      dataStore: dataStore,
    };
    return this.sampleInputService.createReportDataElement(BAR, data, this.mainContent);
  }
  generateRecursiveTables(segmentName, segment, isChildren, text, region?) {
    let heading = ""
    heading = region ? heading = heading + region + ": "
      + this.title.replace(/global/ig, "")
      : heading + this.title

    heading = !isChildren ?
      heading + ", By " + this.sampleOutputService.getSegRefactored(segmentName) + ", " + (parseInt(this.baseYear)-1) + "-" + this.endYear + " (USD Million)" :
      heading + " By " + this.sampleOutputService.getSegRefactored(segment.name) + ", " + (parseInt(this.baseYear)-1) + "-" + this.endYear + " (USD Million)"

    this.generateTableData(segment.children, segment.name, heading, text)
    segment.children.forEach(ele => {
      if (ele.children.length > 0) {
        this.generateRecursiveTables(segmentName, ele, true, text, region)
      }
    });
  }

  generateTableData(children, segName, heading, text) {
    this.mainContent.push(this.sampleInputService.createReportDataElement(ME_TABLE_HEADING, heading, this.mainContent))
    this.mainContent.push(this.sampleInputService.createReportDataElement(ME_TABLE, this.generateTable(children, segName), this.mainContent))
    this.mainContent.push(this.sampleInputService.generateText(text, this.mainContent.length))
  }
  generateTable(allSubSegments, segment) {
    let cagrHead = "CAGR (" + this.allYears[2] + "-" + this.allYears[3] + ")"
    let allHeading = _.union([this.sampleOutputService.getSegRefactored(segment)], this.allYears, [cagrHead])    
    let data = []
    let rowHeads = _.union(allSubSegments, ["Total"]);    
    rowHeads.forEach(ele => {
      let dt = []
      allHeading.forEach((e, i) => {
        if (i == 0) {
          ele.name ? dt.push(this.sampleOutputService.getSegRefactored(ele.name)) : dt.push(ele)
        } else if (i < allHeading.length - 1) {
          dt.push('XX')
        } else {
          dt.push('XX%')
        }
      });
      data.push(dt)
    });
    return {
      heading: allHeading,
      data: data
    }
  }

  generateSubSegmentData(name) {
    let tableHeading = this.sampleOutputService.getSegRefactored(name) + ': ' + 'MARKET ESTIMATES & FORECAST, BY REGION/ COUNTRY, ' + (parseInt(this.baseYear)-1) + '-' + this.endYear + ' (USD Million)'
    let text = `Xx region accounted for the largest market share of XX% in ${this.baseYear}, with a market value of USD XX million; it is expected to register the highest CAGR of XX% during the forecast period. Xx region was the second-largest market in ${this.baseYear}, valued at USD XX million; it is projected to exhibit a CAGR of XX%`
    this.generateTableData(this.regions, "Region", tableHeading, text)
  }
  generateRegionToc() {
    let tocContent = this.sharedSampleTocService.createChapter(this.title + ", By Region")
    this.mainContent.push(this.sampleOutputService.generateHeading(tocContent.id, tocContent.name, tocContent.level, this.mainContent.length))
    let child = this.sampleOutputService.createChild(tocContent, "Introduction", 2, tocContent.id)
    tocContent.children.push(child)
    this.meRegionsList.forEach(e => {
      let child = this.sampleOutputService.createChild(tocContent, e.region, 2, tocContent.id)
      e.countries.forEach(el => {
        let subChild = this.sampleOutputService.createChild(child, el.name, 3, child.id)
        child.children.push(subChild)
      })
      tocContent.children.push(child)
    })
    this.allTocContent.push(tocContent)
    this.generateRegionData(tocContent.children)
  }
  generateRegionData(tocContent) {
    tocContent.forEach((e, i) => {
      if (i == 0) {
        this.generateTextHeads(e.id, e.name, e.level)
        this.mainContent.push(this.sampleInputService.generateText(`The report on the ${this.title.trim()} has been segmented, on the basis of region, into:`, this.mainContent.length))
        this.mainContent.push(this.generateList())

        this.mainContent.push(this.generateRegionBarData(this.regions, this.allYears, "Region"))
        this.mainContent.push(this.generatePieData(this.regions, "Region", false, "MRFR Analysis"))
        this.mainContent.push(this.sampleInputService.generateText(`XX accounted for the largest market share of XX% in ${this.baseYear}, with a market value of USD XX million; the market is expected
      to register a CAGR of XX% during the forecast period. XX was the second-largest market in ${this.baseYear}, valued at USD XX million; the
      market is projected to exhibit a CAGR of XX%. However, the market in XX is expected to register the highest CAGR of XX%.`, this.mainContent.length))

        let heading = this.title + ", By Region, " + (parseInt(this.baseYear)-1) + "-" + this.endYear + " (USD Million)";
        let text = `XX accounted for the largest market share of XX% in ${this.baseYear}, with a market value of USD XX million; the market is expected to register a CAGR of XX% during the forecast period. XX was the second-largest market in ${this.baseYear}, valued at USD XX million; the market is projected to exhibit a CAGR of XX%. However, the market in XX is expected to register the highest CAGR of XX%.`
        this.generateTableData(this.regions, "Region", heading, text)
      } else {
        this.generateTextHeads(e.id, e.name, e.level)
        let type = 'Country';
        if(e.name === 'Rest of the World') {
          type = 'Region';
        }
        
        this.mainContent.push(this.generatePieData(this.meRegionsList[i - 1].countries, type, true, "MRFR Analysis", e.name))
        if (i == 1) {

          let text = `Xx segment accounted for the largest market share of XX% in ${this.baseYear}, with a market value of USD XX million and is projected to grow at the highest CAGR of XX% during the forecast period. Xx segment was the second-largest market in ${this.baseYear}, valued at USD XX million in ${this.baseYear}; it is projected to grow at a CAGR of XX%`
          this.generateRegionTablesByCountry(this.meRegionsList[i - 1])
          this.meSegmentsList.forEach(e => {
            this.generateRecursiveTables(e.name, e, false, text, this.meRegionsList[i - 1].region)
          });
          e.children.forEach((ele, j) => {
            this.generateTextHeads(ele.id, ele.name, ele.level)
            if (j == 0) {
              this.meSegmentsList.forEach(e => {
                this.generateRecursiveTables(e.name, e, false, text, ele.name)
              })
            }
          });
        }
      }
    });
  }
  generateRegionTablesByCountry(region) {
    let title = this.title.replace(/global/ig, "")
    let heading = region.region + ": " + title + ", By Country, " + (parseInt(this.baseYear)-1) + "-" + this.endYear + " (USD Million)";
    let text = `XX accounted for the largest market share of XX% in ${this.baseYear}, with a market value of USD XX million and is projected to grow at the highest CAGR of XX% during the forecast period. XX was the second-largest market in ${this.baseYear}, valued at USD XX million in ${this.baseYear}; it is projected to grow at a CAGR of XX%.`
    this.generateTableData(region.countries, "Country", heading, text)
  }
  generateRegionBarData(xAxis, yAxis, byName) {
    let dataStore = []
    let chartLabels = []
    let chartData = []
    yAxis.forEach(e => {
      chartLabels.push(e)
      let dataStoreData = {
        rowHeader: e
      }
      xAxis.forEach((e, i) => {
        dataStoreData[e] = (10 * (i + 1)).toString()
      })
      dataStore.push(dataStoreData)
    })
    let colMetaData = [
      {
        "header": byName + "/Market Size - (USD Million)",
        "name": "rowHeader",
        "type": "text"
      }
    ]
    xAxis.forEach((e, i) => {
      let data = []
      yAxis.forEach(e => {
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
        title: this.title + ", By " + byName + ", " + this.startYear + "-" + this.endYear + " (USD Million)",
        labelX: byName,
        labelY: "Market Size - (USD Million)"
      },
      chartLabels: chartLabels,
      chartData: chartData,
      colMetaData: colMetaData,
      dataStore: dataStore,
    };
    return this.sampleInputService.createReportDataElement(BAR, data, this.mainContent);
  }
  generateList() {
    let data = []
    this.meRegionsList.forEach(e => {
      data.push(e.region)
    })
    return this.sampleInputService.createReportDataElement(ME_LIST, data, this.mainContent);
  }
  generatePieChartTitle(seg, regionName){
    let title = this.title;
    if(seg == "Country"){
      if(regionName){
        title = regionName + ": " + this.title.replace(/global/gi, "")
      }else{
        title = this.title.replace(/global/gi, "")
      }
    }
    return title + ", By " + seg + ", " + (this.baseYear) + " (% share)"
  }
}