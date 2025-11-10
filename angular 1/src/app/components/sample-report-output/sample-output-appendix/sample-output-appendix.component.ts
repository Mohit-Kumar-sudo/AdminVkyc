import { Component, Input, OnInit } from '@angular/core';
import { ConstantKeys } from 'src/app/constants/mfr.constants';
import { LocalStorageService } from 'src/app/services/localsotrage.service';
import { ReportMetadataService } from 'src/app/services/report-metadata.service';
import { ReportService } from 'src/app/services/report.service';
import { SharedSampleTocService } from 'src/app/services/shared-sample-toc.service';
import * as _ from 'lodash';
import { ReportSectionService } from 'src/app/services/report-section.service';
import { SampleOutputService } from 'src/app/services/sample-output.service';

@Component({
  selector: 'app-sample-output-appendix',
  templateUrl: './sample-output-appendix.component.html',
  styleUrls: []
})
export class SampleOutputAppendixComponent implements OnInit {
  currentReport: any;
  @Input() selectedModule: any;
  tocContent: any;
  secondaryInputData: any = [];
  section = 0;

  constructor(
    private localStorageService: LocalStorageService,
    private reportMetaDataService: ReportMetadataService,
    private sharedSampleTocService: SharedSampleTocService,
    private reportService: ReportService,
    private reportSectionService: ReportSectionService,
    private sampleOutputService: SampleOutputService
  ) { }

  ngOnInit() {    
    this.currentReport = this.localStorageService.get(ConstantKeys.CURRENT_REPORT);
    this.getSectionMetaData();
  }
  getSectionMetaData() {
    if (!this.selectedModule) {
      this.reportMetaDataService.getTocSectionListByReportId(this.currentReport._id).subscribe(data => {
        if (data && data.length) {
          this.selectedModule = _.find(data, ["section_key", "APPENDIX"]);
        }
      })
    }
    if (this.selectedModule) {
      this.tocContent = this.sharedSampleTocService.createChapter(this.selectedModule.section_name)
      this.secondaryInputData.push(this.sampleOutputService.generateHeading(this.tocContent.id, this.tocContent.name, this.tocContent.level, this.secondaryInputData.length))
      this.getFormDetails();
    }
  }
  getFormDetails() {
    this.reportService.getTocByMainSectionId(this.currentReport._id, this.selectedModule.section_id).subscribe(data => {
      this.getFormDetailsSuccess(data);
    }, error => {
      console.log('error', error);
    });
  }
  getFormDetailsSuccess(data) {
    if(data && data.data && data.data.length){
      data.data.forEach(item => {
        if (item && item.toc && item.toc.content && item.toc.content.length) {
          if (item.toc.meta_info && !item.toc.meta_info.section_parent_key) {
            let child = this.sampleOutputService.createChild(this.tocContent, item.toc.meta_info.section_value, 2, this.tocContent.id)
            this.secondaryInputData.push(this.sampleOutputService.generateHeading(child.id, child.name, child.level, this.secondaryInputData.length))
            this.tocContent.children.push(child)

            let value = this.reportSectionService.convertToReportDataElement(item.toc.content);
            if (value.length) {
              value.forEach((d, i) => {
                if (d.type == 'HEADING' || (d.type == 'TEXT' && d.data.includes("<b>") && d.data.includes("</b>"))) {
                  d.data = d.data.replace(/<b>/gi, '')
                  d.data = d.data.replace(/<\/b>/gi, '')
                  let child1 = this.sampleOutputService.createChild(child, d.data, 3, child.id)
                  this.secondaryInputData.push(this.sampleOutputService.generateHeading(child1.id, child1.name, child1.level, this.secondaryInputData.length))
                  child.children.push(child1)
                }
                this.generateData(d)
              })
            }
          }
        }
      });
    }
    this.sharedSampleTocService.updateCompletedStatus();
  }

  generateData(data) {
    this.secondaryInputData.push({
      id: this.secondaryInputData.length + 1,
      type: data.type,
      data: data.data
    })
  }
}
