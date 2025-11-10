import { Component, Input, OnInit } from '@angular/core'
import { MasterReportData } from 'src/app/models/me-models';
import * as _ from 'lodash';
import { ReportService } from 'src/app/services/report.service';
import { LocalStorageService } from 'src/app/services/localsotrage.service';
import { ConstantKeys } from 'src/app/constants/mfr.constants';
import { MasterReportSecondarySectionData, ReportDataElement, RM_PIE } from 'src/app/models/secondary-research-models';
import { ReportSectionService } from 'src/app/services/report-section.service';
import { SharedSampleTocService } from 'src/app/services/shared-sample-toc.service';
import { SampleOutputService } from 'src/app/services/sample-output.service';

@Component({
  selector: 'app-research-methodology-sample-output',
  templateUrl: './research-methodology-sample-output.component.html',
  styleUrls: []
})
export class ResearchMethodologySampleOutputComponent implements OnInit {
  currentReport: MasterReportData = null;
  secondaryInputData: ReportDataElement[] = [];
  @Input() selectedModule: any;
  tocContent: any;
  children = []
  pieData: any = [];
  mainContent: ReportDataElement[] = [];

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
        "section_id": 4,
        "section_name": "RESEARCH METHODOLOGY",
        "section_key": "RESEARCH_METHODOLOGY",
        "urlpattern": "other-module",
        "is_main_section_only": true
      }
    }

    this.tocContent = this.sharedSampleTocService.createChapter(this.selectedModule.section_name)
    this.mainContent.push(this.sampleOutputService.generateHeading(this.tocContent.id, this.tocContent.name, this.tocContent.level, this.mainContent.length))
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
      this.pieData = _.filter(this.secondaryInputData, ['type', 'PIE']);
      this.generateRMPIE()
      this.checkHeading()
      this.sharedSampleTocService.addChildren(this.children, this.tocContent.id)
      this.sharedSampleTocService.updateCompletedStatus();
    }else{
      this.sharedSampleTocService.updateCompletedStatus();
    }
  }
  checkHeading() {
    this.secondaryInputData.forEach((e, i) => {
      if (e.type == "TEXT"|| e.type == "HEADING") {
        let data = e.data
        if (e.type == "HEADING" || (data.includes("<b>") && data.includes("</b>"))) {
          data = data.replace(/<br>/gi, ' ')
          data = data.replace(/<b>/gi, '')
          data = data.replace(/<\/b>/gi, '')
          let child = {
            id: this.tocContent.id + "." + (this.children.length + 1),
            name: data,
            level: 2,
            children: []
          }
          this.children.push(child)
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

  generateRMPIE() {
    let index = [];
    if (this.pieData && this.pieData.length) {
      // get index
      this.pieData.forEach(d => {
        index.push(_.findIndex(this.secondaryInputData, d))
      });
      // delete index expect 0 index
      _.remove(this.secondaryInputData,['type','PIE'])
      this.secondaryInputData.splice(index[0],0,{id:index[0]+1,type:RM_PIE,data:this.pieData})      
    }
  }
}