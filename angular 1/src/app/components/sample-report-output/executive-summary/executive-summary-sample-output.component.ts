import { Component, Input, OnInit, QueryList, ViewChildren } from '@angular/core'
import { MasterReportData } from 'src/app/models/me-models';
import * as _ from 'lodash';
import { ReportService } from 'src/app/services/report.service';
import { LocalStorageService } from 'src/app/services/localsotrage.service';
import { ConstantKeys } from 'src/app/constants/mfr.constants';
import { MasterReportSecondarySectionData, ReportDataElement } from 'src/app/models/secondary-research-models';
import { ReportSectionService } from 'src/app/services/report-section.service';
import { SharedSampleTocService } from 'src/app/services/shared-sample-toc.service';
import { SampleOutputService } from 'src/app/services/sample-output.service';

@Component({
  selector: 'app-executive-summary-sample-output',
  templateUrl: './executive-summary-sample-output.component.html',
  styleUrls: []
})
export class ExecutiveSummarySampleOutputComponent implements OnInit {
  currentReport: MasterReportData = null;
  secondaryInputData: ReportDataElement[] = [];
  @Input() selectedModule: any;
  tocContent: any;
  children = [];
  mainContent: ReportDataElement[] = [];

  @ViewChildren('canvas') canvasList: QueryList<any>;
  @ViewChildren('img') imgChartList: QueryList<any>;

  constructor(
    private reportService: ReportService,
    private localStorageService: LocalStorageService,
    private reportSectionService: ReportSectionService,
    private sharedSampleTocService: SharedSampleTocService,
    private sampleOutputService: SampleOutputService
  ) { }

  ngOnInit() {
    if (!this.selectedModule) {
      this.selectedModule = {
        "section_id": "2",
        "section_name": "Executive Summary",
        "section_key": "EXECUTIVE_SUMMARY",
        "urlpattern": "executive-summary",
        "is_main_section_only": true,
        "main_section_id": 2
      }
    }
    this.tocContent = this.sharedSampleTocService.createChapter(this.selectedModule.section_name)
    this.mainContent.push(this.sampleOutputService.generateHeading(this.tocContent.id, this.tocContent.name, this.tocContent.level, this.mainContent.length))
    this.children = this.tocContent.children;
    this.children = [
      {
        id: this.tocContent.id + ".1",
        name: "Market Attractiveness Analysis",
        level: 2,
        children: []
      }
    ]
    this.currentReport = this.localStorageService.get(ConstantKeys.CURRENT_REPORT);
    this.getFormDetails();
  }

  getFormDetails() {
    this.reportService.getTocDetails(this.currentReport._id, this.selectedModule.section_id, this.selectedModule.main_section_id).subscribe(data => {
      this.getFormDetailsSuccess(data);
    }, error => {
      console.log('error', error);
    });
  }
  getFormDetailsSuccess(data: MasterReportSecondarySectionData) {
    if (data && data.content) {
      this.secondaryInputData = this.reportSectionService.convertToReportDataElement(data.content);
      this.checkHeading()
      this.sharedSampleTocService.addChildren(this.children, this.tocContent.id)
      this.sharedSampleTocService.updateCompletedStatus()
    }else{
      this.sharedSampleTocService.updateCompletedStatus()
    }
  }
  checkHeading() {
    this.secondaryInputData.forEach((e, i) => {

      if (e.type == "TEXT" || e.type == "HEADING") {
        let data = e.data
        if (e.type == "HEADING" || (data.includes("<b>") && data.includes("</b>"))) {
          data = data.replace(/<br>/gi, ' ')
          data = data.replace(/<b>/gi, '')
          data = data.replace(/<\/b>/gi, '')
          let child = {
            id: this.tocContent.id + ".1." + (this.children[0].children.length + 1),
            name: data,
            level: 3,
            children: []
          }
          this.children[0].children.push(child)
          e.type = "HEADING"
          e.data = {
            id: child.id,
            name: child.name,
            level: child.level
          }
        }
      }
      this.mainContent.push(e)
    })
  }
}