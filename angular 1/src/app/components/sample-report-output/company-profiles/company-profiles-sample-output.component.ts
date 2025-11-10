import { Component, Input, OnInit } from '@angular/core'
import { MasterReportData } from 'src/app/models/me-models';
import * as _ from 'lodash';
import { ReportService } from 'src/app/services/report.service';
import { LocalStorageService } from 'src/app/services/localsotrage.service';
import { ConstantKeys } from 'src/app/constants/mfr.constants';
import { CP_LIST, ReportDataElement } from 'src/app/models/secondary-research-models';
import { CompanyProfile } from 'src/app/models/company-profile-model';
import { SharedSampleTocService } from 'src/app/services/shared-sample-toc.service';
import { SampleImage } from 'src/app/constants/sample-image.constants';
import { SampleOutputService } from 'src/app/services/sample-output.service';
import { SampleInputService } from 'src/app/services/sample-input.service';

@Component({
  selector: 'app-company-profiles-sample-output',
  templateUrl: './company-profiles-sample-output.component.html',
  styleUrls: []
})
export class CompanyProfilesSampleOutputComponent implements OnInit {
  @Input() selectedModule: any;
  currentReport: MasterReportData = null;
  secondaryInputData: ReportDataElement[] = [];
  currentCompanyList: CompanyProfile[] = [];
  tocContent: any;
  cpData = [];
  mainContent = [];
  cpBase64 = SampleImage.COMPANY_PROFILES_1
  swotBase64 = SampleImage.COMPANY_PROFILES_2;
  constructor(
    private reportService: ReportService,
    private localStorageService: LocalStorageService,
    private sharedSampleTocService: SharedSampleTocService,
    private sampleOutputService: SampleOutputService,
    private sampleInputService: SampleInputService
  ) { }

  ngOnInit() {
    if (!this.selectedModule) {
      this.selectedModule = {
        "section_id": 11,
        "section_name": "COMPANY PROFILES",
        "section_key": "COMPANY_PROFILES",
        "urlpattern": "company-profile",
        "is_main_section_only": false
      }
    }
    this.currentReport = this.localStorageService.get(ConstantKeys.CURRENT_REPORT);
    this.tocContent = this.sharedSampleTocService.createChapter(this.selectedModule.section_name)
    this.sharedSampleTocService.updateCPNo(this.tocContent.id)
    this.mainContent.push(this.sampleOutputService.generateHeading(this.tocContent.id, this.tocContent.name, this.tocContent.level, this.mainContent.length))
    this.getFormInfo(this.currentReport);
  }

  getFormInfo(currentReport) {
    this.reportService.getReportCompanyProfiles(currentReport).subscribe(
      res => {
        if (res && res.data && res.data.length > 0) {
          res.data[0].cp.map((ele) => {
            ele._id = ele.company_id;
          });
        }
        this.currentCompanyList = res.data[0].cp;
        this.currentCompanyList.forEach((e, i) => {
          let child = {
            id: this.tocContent.id + "." + (i + 1),
            name: e.company_name,
            level: 2,
            children: []
          }
          this.tocContent.children.push(child)
        })
        this.generateCPData(this.tocContent)
        this.sharedSampleTocService.updateCompletedStatus();
      }, error => {
        (error);
      });
  }
  generateCPData(tocContent) {
    tocContent.children.forEach((ele, i) => {
      if (i == 0) {
        this.mainContent.push(this.sampleOutputService.generateHeading(ele.id, ele.name, ele.level, this.mainContent.length))
        ele.children.push(this.sampleOutputService.createChild(ele, "Company Overview", 3, ele.id))
        this.generateCPList("Headquarters: ", "XXX")
        this.generateCPList("Founded: ", "XXX")
        this.generateCPList("Workforce: ", "XXX")
        this.generateCPList("Company Working: ", "XXX")
        ele.children.push(this.sampleOutputService.createChild(ele, "Financial Overview", 3, ele.id))
        this.mainContent.push(this.sampleInputService.generateImage(this.cpBase64, ele.name + ": Financial Overview Snapshot", this.mainContent.length))
        ele.children.push(this.sampleOutputService.createChild(ele, "Products Offered", 3, ele.id))

        let data = [
          {
            title: [{ title: this.sampleInputService.convertIntoHeading("Category") }],
            data: [{ data: this.sampleInputService.convertIntoHeading("Products") }]
          },
          {
            title: [{ title: "Category" }],
            data: [{ data: this.sampleInputService.convertToList(["Product", "Product", "Product"]) }]
          },
          {
            title: [{ title: "Category" }],
            data: [{ data: this.sampleInputService.convertToList(["Product", "Product", "Product"]) }]
          }
        ]
        this.mainContent.push(this.sampleInputService.generateCustomTable(data, ele.name + ": Products Offered", this.mainContent.length))
        ele.children.push(this.sampleOutputService.createChild(ele, "Ket Developments", 3, ele.id))
        let cols = ["Date", "Approach", "Development"]
        let title = "Key Developments"
        let columns = [{ "header": "Date" },
        { "header": "Approach" },
        { "header": "Development" }]
        let rows = 4
        let dataStore = [{ "Date": "Jan-2020", "Approach": "Expansion", "Development": "XXX" },
        { "Date": "Jan-2020", "Approach": "Expansion", "Development": "XXX" },
        { "Date": "Jan-2020", "Approach": "Expansion", "Development": "XXX" },
        { "Date": "Jan-2020", "Approach": "Expansion", "Development": "XXX" }
        ]

        this.mainContent.push(this.sampleInputService.generateTable(title, rows, columns, dataStore, cols, this.mainContent.length))
        ele.children.push(this.sampleOutputService.createChild(ele, "SWOT Analysis", 3, ele.id))
        this.mainContent.push(this.sampleInputService.generateImage(this.swotBase64, ele.name + ": SWOT Analysis", this.mainContent.length))
      }
    });
  }
  generateCPList(title, data) {
    this.mainContent.push(this.sampleInputService.createReportDataElement(CP_LIST, {
      title: title,
      data: data
    }, this.mainContent.length))
  }
}