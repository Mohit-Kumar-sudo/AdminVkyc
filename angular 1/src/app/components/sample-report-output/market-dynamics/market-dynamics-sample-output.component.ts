import { Component, Input, OnInit } from '@angular/core'
import { MasterReportData } from 'src/app/models/me-models';
import * as _ from 'lodash';
import { ReportService } from 'src/app/services/report.service';
import { LocalStorageService } from 'src/app/services/localsotrage.service';
import { ConstantKeys } from 'src/app/constants/mfr.constants';
import { MD_IMAGE, ReportDataElement, TEXT } from 'src/app/models/secondary-research-models';
import { SharedSampleTocService } from 'src/app/services/shared-sample-toc.service';
import { ReportSectionService } from 'src/app/services/report-section.service';
import { SampleOutputService } from 'src/app/services/sample-output.service';
import { SampleInputService } from 'src/app/services/sample-input.service';

@Component({
  selector: 'app-market-dynamics-sample-output',
  templateUrl: './market-dynamics-sample-output.component.html',
  styleUrls: []
})
export class MarketDynamicsSampleOutputComponent implements OnInit {
  @Input() selectedModule: any;
  currentReport: MasterReportData = null;
  mainContent: ReportDataElement[] = [];

  tocContent: any;
  children = [];
  allData = ["Introduction", "Drivers", "Restraints", "Opportunities", "Challenges", "Trends"]
  droctData = [];
  customModules = [];

  constructor(
    private reportService: ReportService,
    private localStorageService: LocalStorageService,
    private sharedSampleTocService: SharedSampleTocService,
    private reportSectionService: ReportSectionService,
    private sampleOutputService: SampleOutputService,
    private sampleInputService: SampleInputService
  ) { }

  ngOnInit() {
    if (!this.selectedModule) {
      this.selectedModule = {
        "section_id": 5,
        "section_name": "MARKET DYNAMICS",
        "section_key": "MARKET_DYNAMICS",
        "urlpattern": "market-dynamics",
        "is_main_section_only": false
      }
    }
    this.tocContent = this.sharedSampleTocService.createChapter(this.selectedModule.section_name)
    this.mainContent.push(this.sampleOutputService.generateHeading(this.tocContent.id, this.tocContent.name, this.tocContent.level, this.mainContent.length))
    this.currentReport = this.localStorageService.get(ConstantKeys.CURRENT_REPORT);
    let currentSection = this.selectedModule.section_id
    this.reportService.getTocByMainSectionId(this.currentReport._id, currentSection).subscribe(data => {
      if (data && data.data && data.data.length) {
        
        this.allData.forEach((e, i) => {
          let dt = data.data.filter((i) => i.toc.meta_info.parent_section_value == e);

          if (dt.length) {
            let node = {
              id: this.tocContent.id + "." + (i + 1),
              name: e,
              level: 2,
              children: [],
            }
            if (e != 'Introduction') {
              dt.forEach((ele, j) => {
                let child = {
                  id: node.id + "." + (j + 1),
                  name: ele.toc.meta.data.name,
                  level: 3,
                  children: [],
                  data: ele.toc.meta.data
                }

                node.children.push(child)
              });
            } else {
              node['data'] = dt[0].toc.content
            }
            this.tocContent.children.push(node)
          }
        })
        data.data.forEach(el => {
          if (!el.toc.hasOwnProperty('meta')) {
            if (el.toc.meta_info.parent_section_key != 'introduction') {
              this.customModules.push(el)
            }
          }
        });
        this.generateMainContent();
        this.sharedSampleTocService.updateCompletedStatus()
      }else{
        this.sharedSampleTocService.updateCompletedStatus()
      }
    });
  }
  generateMainContent() {

    this.tocContent.children.forEach(ele => {
      let years = []
      let data = []
      this.generateTextHeads(ele.id, ele.name, ele.level)
      ele.children.forEach(e => {
        this.generateTextHeads(e.id, e.name, e.level)
        let dt = []
        if (e.data.rating && e.data.rating.length) {
          years = []
          dt.push({
            name : ele.name,
            value : e.data.name
          })
          e.data.rating.forEach((el, i) => {
              years.push(el.year)
              dt.push({
                name : el.year,
                value : el.rating
              })
          });
          data.push(dt)
        }
      });
      if (years.length && data.length) {
        this.mainContent.push(this.sampleInputService.createReportDataElement(
          MD_IMAGE, { name: ele.name, years: years, ratings: data }, this.mainContent.length))
      }
    });
    this.customModules.forEach(e => {
      let name = e.toc.meta_info.section_value
      let child = {
        id: this.tocContent.id + "." + (this.tocContent.children.length + 1),
        name: name,
        level: 2,
        children: []
      }
      this.mainContent.push(this.sampleOutputService.generateHeading(child.id, child.name, child.level, this.mainContent.length))
      this.tocContent.children.push(child)
      let secData = this.reportSectionService.convertToReportDataElement(e.toc.content);
      secData.forEach(dt =>{
        if(dt.type == 'HEADING' || (dt.type == 'TEXT' && dt.data.includes("<b>") && dt.data.includes("</b>"))){            
          dt.data = dt.data.replace(/<b>/gi, '')
          dt.data = dt.data.replace(/<\/b>/gi, '')
          
          let child1 = this.sampleOutputService.createChild(child, dt.data, 3, child.id)
          this.mainContent.push(this.sampleOutputService.generateHeading(child1.id, child1.name, child1.level, this.mainContent.length))
        child.children.push(child1)
      }else{
        this.mainContent.push(dt)
      }
      })
    })
  }
  checkHeading(data) {
    data.forEach((e) => {
      if (e.type=="HEADING" || e.type == "TEXT") {
        let data = e.data
        if (e.type == "HEADING" || (data.includes("<b>") && data.includes("</b>"))){
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
  generateTextHeads(id, name, level) {
    this.mainContent.push(this.sampleOutputService.generateHeading(id, name, level, this.mainContent.length))
    if (level == 2) {
      if (name == "Introduction") {
        this.mainContent.push(this.sampleInputService.generateText('XXX', this.mainContent.length))
      }
    } else {
      this.mainContent.push(this.sampleInputService.generateText('XXX', this.mainContent.length))
    }
  }
}