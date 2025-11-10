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
  selector: 'app-competitive-landscape',
  templateUrl: './competitive-landscape.component.html',
  styleUrls: []
})
export class CompetitiveLandscapeComponent implements OnInit {
  currentReport: any;
  tocContent: any;
  secondaryInputData: any = [];
  section = 0;
  subSection = 0;
  @Input() selectedModule: any;
  defaultKeySequence = ["overview", "marketAnalysis", "brandShareAnalysis",
    "dashboard", "benchMarking", "majorGrowthStrategy", "theLeadingPlayer", "devAndGrowthStrategies",
    "majorPlayersFinancialMatrixAndMarketRatio"]

  keyDevelopments = ["newDevelopment", "mergerAndAquisition", "jointVenture"]

  constructor(
    private sharedSampleTocService: SharedSampleTocService,
    private localStorageService: LocalStorageService,
    private reportService: ReportService,
    private reportMetaDataService: ReportMetadataService,
    private reportSectionService: ReportSectionService,
    private sampleOutputService: SampleOutputService
  ) { }

  ngOnInit() {
    this.currentReport = this.localStorageService.get(ConstantKeys.CURRENT_REPORT);
    if (!this.selectedModule) {
      this.getSectionMetaData();
    } else {
      this.getFormDetails();
    }
    this.tocContent = this.sharedSampleTocService.createChapter(this.selectedModule.section_name)
    this.secondaryInputData.push(this.sampleOutputService.generateHeading(this.tocContent.id, this.tocContent.name, this.tocContent.level, this.secondaryInputData.length))
  }
  getSectionMetaData() {
    this.reportMetaDataService.getTocSectionListByReportId(this.currentReport._id).subscribe(data => {
      if (data && data.length) {
        this.selectedModule = _.find(data, ["section_key", "COMPETITIVE_LANDSCAPE"]);
        if (this.selectedModule) {
          this.getFormDetails();
        }
      }
    })
  }
  getFormDetails() {
    this.reportService.getTocByMainSectionId(this.currentReport._id, this.selectedModule.section_id).subscribe(data => {
      this.getFormDetailsSuccess(data);
    });
  }
  getFormDetailsSuccess(data) {
    let clData = [];
    if (data && data.data && data.data.length) {
      this.defaultKeySequence.forEach(e => {
        data.data.forEach(ele => {
          if (e == "devAndGrowthStrategies" && ele.toc.meta_info.hasOwnProperty("section_parent_key")) {
            clData.push(ele);
          } else {
            if (ele.toc.meta_info.section_key == e) {
              if (e == "majorGrowthStrategy") {
                ele.toc.meta_info.section_value = ele.toc.meta_info.section_value + " in the " + this.currentReport.title.trim() + " Market"
              } else if (e == "theLeadingPlayer") {
                ele.toc.meta_info.section_value = ele.toc.meta_info.section_value + " in terms of Number of Developments in " + this.currentReport.title.trim() + " Market"
              }
              clData.push(ele);
            }
          }

        });
      })
    }
    if (clData.length) {
      let isParentFound = false;
      let parent;
      clData.forEach(cl => {
        if (cl.toc.meta_info.section_key) {
          let child;
          let value = this.reportSectionService.convertToReportDataElement(cl.toc.content);
          if (value.length || isParentFound) {
            if (cl.toc.meta_info.hasOwnProperty("section_parent_key")) {
              if (!isParentFound) {
                parent = this.sampleOutputService.createChild(this.tocContent, cl.toc.meta_info.section_parent_value, 2, this.tocContent.id)
                this.secondaryInputData.push(this.sampleOutputService.generateHeading(parent.id, parent.name, parent.level, this.secondaryInputData.length))
                isParentFound = true;
              }
              if (value.length) {
                let child1 = this.sampleOutputService.createChild(parent, cl.toc.meta_info.section_value, 3, parent.id)
                this.secondaryInputData.push(this.sampleOutputService.generateHeading(child1.id, child1.name, child1.level, this.secondaryInputData.length))
                parent.children.push(child1)
              }
            } else {
              if (isParentFound == true) {
                this.tocContent.children.push(parent)
                isParentFound = false
              }
              if (value.length) {
                child = this.sampleOutputService.createChild(this.tocContent, cl.toc.meta_info.section_value, 2, this.tocContent.id)
                this.secondaryInputData.push(this.sampleOutputService.generateHeading(child.id, child.name, child.level, this.secondaryInputData.length))
                this.tocContent.children.push(child)
              }
            }
          }
          value.forEach((d, i) => {
            if (d.type == 'HEADING' || (d.type == 'TEXT' && d.data.includes("<b>") && d.data.includes("</b>"))) {
              d.data = d.data.replace(/<b>/gi, '')
              d.data = d.data.replace(/<\/b>/gi, '')
              let child1 = this.sampleOutputService.createChild(child, d.data, 3, child.id)
              this.secondaryInputData.push(this.sampleOutputService.generateHeading(child1.id, child1.name, child1.level, this.secondaryInputData.length))
              child.children.push(child1)
            } else {
              this.generateData(d)
            }
          })
        }
      })
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