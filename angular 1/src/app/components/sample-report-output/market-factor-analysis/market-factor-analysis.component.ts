import { Component, Input, OnInit } from '@angular/core';
import { ConstantKeys } from 'src/app/constants/mfr.constants';
import { LocalStorageService } from 'src/app/services/localsotrage.service';
import { ReportMetadataService } from 'src/app/services/report-metadata.service';
import { ReportSectionService } from 'src/app/services/report-section.service';
import { ReportService } from 'src/app/services/report.service';
import { SharedSampleTocService } from 'src/app/services/shared-sample-toc.service';
import * as _ from 'lodash';
import { SampleOutputService } from 'src/app/services/sample-output.service';
import { SampleInputService } from 'src/app/services/sample-input.service';
import { SampleImage } from 'src/app/constants/sample-image.constants';

@Component({
  selector: 'app-market-factor-analysis',
  templateUrl: './market-factor-analysis.component.html',
  styleUrls: []
})
export class MarketFactorAnalysisComponent implements OnInit {
  @Input() selectedModule: any;
  tocContent: any;
  currentReport: any;
  secondaryInputData: any = [];
  children: any = [];
  section = 0;
  subSection = 0;
  mainContent: any = [];
  portersImage = SampleImage.PORTERS_1
  porters: any = ['Bargaining Power Of Suppliers', 'Bargaining Power Of Buyers', 'Threat Of New Entrants', 'Threat Of Substitutes', 'Intensity Of Rivalry'];
  customModules: any = [];

  constructor(
    private sharedSampleTocService: SharedSampleTocService,
    private localStorageService: LocalStorageService,
    private reportService: ReportService,
    private reportSectionService: ReportSectionService,
    private reportMetaDataService: ReportMetadataService,
    private sampleOutputService: SampleOutputService,
    private sampleInputService: SampleInputService
  ) { }

  ngOnInit() {
    if (!this.selectedModule) {
      this.getSectionMetaData()
    } else {
      this.tocContent = this.sharedSampleTocService.createChapter(this.selectedModule.section_name)
      this.secondaryInputData.push(this.sampleOutputService.generateHeading(this.tocContent.id, this.tocContent.name, this.tocContent.level, this.secondaryInputData.length))
      this.currentReport = this.localStorageService.get(ConstantKeys.CURRENT_REPORT);
      this.generatePortersFive();
    }
  }
  getSectionMetaData() {
    this.reportMetaDataService.getTocSectionListByReportId(this.currentReport._id).subscribe(data => {
      if (data && data.length) {
        this.selectedModule = _.find(data, ["section_key", "MARKET_FACTOR_ANALYSIS"]);
        if (this.selectedModule) {
          this.tocContent = this.sharedSampleTocService.createChapter(this.selectedModule.section_name)
          this.secondaryInputData.push(this.sampleOutputService.generateHeading(this.tocContent.id, this.tocContent.name, this.tocContent.level, this.secondaryInputData.length))
          this.currentReport = this.localStorageService.get(ConstantKeys.CURRENT_REPORT);
          this.generatePortersFive();
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
    if (data && data.data && data.data.length) {
      data.data.forEach(item => {
        if (item.toc && item.toc.meta && ((item.toc.meta.type == 'SUPPLY_CHAIN' && item.toc.meta.data.length) || (item.toc.meta.type == 'VALUE_CHAIN' && item.toc.meta.data.length))) {
          this.getSupplyChainDataSuccess(item)
        }
        if (item.toc && !item.toc.meta && item.toc.meta_info) {
          this.generateCustomModules(item)
        }
      })
      this.secondaryInputData.forEach(element => {
        this.mainContent.push(element)
      });
      this.sharedSampleTocService.updateCompletedStatus();
    } else {
      this.secondaryInputData.forEach(element => {
        this.mainContent.push(element)
      });
      this.sharedSampleTocService.updateCompletedStatus();
    } 
  }

  getSupplyChainDataSuccess(data) {
    if (data && data.toc && data.toc.content && data.toc.content.length) {
      let child = this.sampleOutputService.createChild(this.tocContent, data.toc.meta_info.section_value + " Analysis", 2, this.tocContent.id)
      this.secondaryInputData.push(this.sampleOutputService.generateHeading(child.id, child.name, child.level, this.secondaryInputData.length))
      this.tocContent.children.push(child)
      this.secondaryInputData.push(this.sampleInputService.generateText("XXX", this.secondaryInputData.length))
      this.secondaryInputData.push({
        id: this.secondaryInputData.length + 1,
        type: 'CHAIN',
        data: {
          nodes: data.toc.content,
          paths: data.toc.meta.data,
          typeOption: data.toc.meta.chain_type,
          figTitle: data.toc.meta_info.section_value + " Analysis" + ': ' + this.currentReport.title.trim() + " market"
        }
      })
      data.toc.content.forEach(item => {
        let child1 = this.sampleOutputService.createChild(child, item.title, 3, child.id)
        this.secondaryInputData.push(this.sampleOutputService.generateHeading(child1.id, child1.name, child1.level, this.secondaryInputData.length))
        child.children.push(child1)
        if (item.data && item.data.length && item.data[0].type == 'TEXT') {
          let data = item.data[0].info.length ? item.data[0].info : 'XXX'
          this.secondaryInputData.push(this.sampleInputService.generateText(data, this.secondaryInputData.length))
        }
      })
    }
  }

  generatePortersFive() {
    let child = this.sampleOutputService.createChild(this.tocContent, "Porter’s Five Forces Model", 2, this.tocContent.id)
    this.secondaryInputData.push(this.sampleOutputService.generateHeading(child.id, child.name, child.level, this.secondaryInputData.length))
    this.tocContent.children.push(child)
    this.secondaryInputData.push(this.sampleInputService.generateImage(this.portersImage, 'Porter’s Five Forces Model: ' + this.currentReport.title.trim() + " market", this.secondaryInputData.length))

    this.porters.forEach((d, i) => {
      let child1 = this.sampleOutputService.createChild(child, d, 3, child.id)
      this.secondaryInputData.push(this.sampleOutputService.generateHeading(child1.id, child1.name, child1.level, this.secondaryInputData.length))
      this.secondaryInputData.push(this.sampleInputService.generateText("XXXXX", this.secondaryInputData.length))
      child.children.push(child1)
    })
    this.getFormDetails();
  }

  generateCustomModules(data) {
    if (data.toc.content && data.toc.content.length) {
      let child = this.sampleOutputService.createChild(this.tocContent, data.toc.meta_info.section_value + " Analysis", 2, this.tocContent.id)
      this.secondaryInputData.push(this.sampleOutputService.generateHeading(child.id, child.name, child.level, this.secondaryInputData.length))
      this.tocContent.children.push(child)
      data.toc.content.forEach((d,i)=>{
        if(d.type == 'HEADING' || (d.type == 'TEXT' && d.data.content.includes("<b>") && d.data.content.includes("</b>"))){            
            d.data.content = d.data.content.replace(/<b>/gi, '')
            d.data.content = d.data.content.replace(/<\/b>/gi, '')
            
          let child1 = this.sampleOutputService.createChild(child, d.data.content, 3, child.id)
          this.secondaryInputData.push(this.sampleOutputService.generateHeading(child1.id, child1.name, child1.level, this.secondaryInputData.length))
          child.children.push(child1)
        }else{
          let data = this.reportSectionService.convertToReportDataElement([d])
          this.secondaryInputData.push(data[0])
        }
      })
    }
  }
}