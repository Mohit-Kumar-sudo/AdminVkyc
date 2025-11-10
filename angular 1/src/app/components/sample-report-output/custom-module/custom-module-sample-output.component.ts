import { Component, Input, OnInit } from '@angular/core';
import { ConstantKeys } from 'src/app/constants/mfr.constants';
import { LocalStorageService } from 'src/app/services/localsotrage.service';
import { ReportService } from 'src/app/services/report.service';
import { SharedSampleTocService } from 'src/app/services/shared-sample-toc.service';
import * as _ from 'lodash';
import { ReportSectionService } from 'src/app/services/report-section.service';
import { MasterReportSecondarySectionData } from 'src/app/models/secondary-research-models';

@Component({
  selector: 'app-custom-module-sample-output',
  templateUrl: './custom-module-sample-output.component.html',
  styleUrls: []
})
export class CustomModuleSampleOutputComponent implements OnInit {
  currentReport: any;
  @Input() selectedModule: any;
  tocContent: any;
  secondaryInputData: any = [];
  section = 0;
  children = []

  constructor(
    private localStorageService: LocalStorageService,
    private sharedSampleTocService: SharedSampleTocService,
    private reportService: ReportService,
    private reportSectionService: ReportSectionService
  ) { }

  ngOnInit() {
    this.tocContent = this.sharedSampleTocService.createChapter(this.selectedModule.section_name)
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
      this.sharedSampleTocService.updateCompletedStatus();
    }
  }
  checkHeading() {
    this.secondaryInputData.forEach((e, i) => {
      if (e.type == "HEADING" || e.type == "TEXT") {
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
    })
  }
}
