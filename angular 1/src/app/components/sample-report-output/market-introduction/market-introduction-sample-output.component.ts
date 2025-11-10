import { Component, Input, OnInit, QueryList, ViewChildren } from '@angular/core'
import { MasterReportData } from 'src/app/models/me-models';
import * as _ from 'lodash';
import { ReportService } from 'src/app/services/report.service';
import { LocalStorageService } from 'src/app/services/localsotrage.service';
import { ConstantKeys } from 'src/app/constants/mfr.constants';
import { ReportDataElement } from 'src/app/models/secondary-research-models';
import { ReportSectionService } from 'src/app/services/report-section.service';
import { MenuMetaData, markenIntroductionSections } from 'src/app/models/section-metadata';
import { SharedSampleTocService } from 'src/app/services/shared-sample-toc.service';
import { SegmentService } from 'src/app/services/segment.service';
import { SampleOutputService } from 'src/app/services/sample-output.service';

@Component({
  selector: 'app-market-introduction-sample-output',
  templateUrl: './market-introduction-sample-output.component.html',
  styleUrls: []
})
export class MarketIntroductionSampleOutputComponent implements OnInit {
  currentReport: MasterReportData = null;
  @Input() selectedModule: any;
  menuInputList: MenuMetaData[] = [...markenIntroductionSections];
  allSections = []
  tocContent: any;
  children = []
  mainContent: ReportDataElement[] = [];
  allMainContent: ReportDataElement[] = [];

  miSeq = ['definition', 'scope', 'researchObjective', 'structure', 
  'assumptions', 'keyBuyingCriteria']

  @ViewChildren('canvas') canvasList: QueryList<any>;
  @ViewChildren('img') imgChartList: QueryList<any>;

  constructor(
    private reportService: ReportService,
    private localStorageService: LocalStorageService,
    private reportSectionService: ReportSectionService,
    private sharedSampleTocService: SharedSampleTocService,
    private segmentService: SegmentService,
    private sampleOutputService: SampleOutputService
  ) { }

  ngOnInit() {
    this.allSections = []
    if (this.selectedModule) {
      this.selectedModule = {
        "section_id": 3,
        "section_name": "MARKET INTRODUCTION",
        "section_key": "MARKET_INTRODUCTION",
        "urlpattern": "market-introduction",
        "is_main_section_only": false
      }
    }
    this.tocContent = this.sharedSampleTocService.createChapter(this.selectedModule.section_name)
    this.mainContent.push(this.sampleOutputService.generateHeading(this.tocContent.id, this.tocContent.name, this.tocContent.level, this.mainContent.length))
    this.currentReport = this.localStorageService.get(ConstantKeys.CURRENT_REPORT);
    let newCommonMenuList = []
    this.miSeq.forEach(e => {
      let item = this.menuInputList.filter(item => item.key === e)
      if (item) {
        newCommonMenuList.push(item[0])
        _.remove(this.menuInputList, (d) => d.key === e)
      }
    })
    newCommonMenuList = [...newCommonMenuList, ...this.menuInputList]
    this.menuInputList = [...newCommonMenuList]
    this.getFormDetails(this.menuInputList);
    this.sharedSampleTocService.addChildren(this.children, this.tocContent.id)
  }

  getFormDetails(menuInputList) {
    this.reportService.getTocByMainSectionId(this.currentReport._id, this.selectedModule.section_id).subscribe(data => {
      this.getFormDetailsSuccess(data, menuInputList);
    });
  }
  getFormDetailsSuccess(data, menuInputList) {
    if (data.data && data.data.length) {
      if(menuInputList && menuInputList.length) {
        menuInputList.forEach(e => {
          let selectedDt = data.data.filter(ele => ele.toc.meta_info.section_key == e.key);
          if (selectedDt && selectedDt.length) {
            if (selectedDt[0].toc.content && selectedDt[0].toc.content.length) {
              let secondaryInputData = this.reportSectionService.convertToReportDataElement(selectedDt[0].toc.content);
              let child = {
                id: this.tocContent.id + "." + (this.children.length + 1),
                name: e.value,
                level: 2,
                children: []
              }
              this.mainContent.push(this.sampleOutputService.generateHeading(child.id, child.name, child.level, this.mainContent.length))
              secondaryInputData.forEach(e => {
                this.mainContent.push(e)
              })
              this.children.push(child)
            }
          }
        })
        this.mainContent.forEach(e => {
          this.allMainContent.push(e)
        })
        this.sharedSampleTocService.updateCompletedStatus();
      }
    }
  }
}