import {Component, OnInit} from '@angular/core'
import {ReportMetadataService} from 'src/app/services/report-metadata.service';
import {MasterReportData, TocSectionData} from 'src/app/models/me-models';
import * as _ from 'lodash';
import {Router} from '@angular/router';
import {LocalStorageService} from 'src/app/services/localsotrage.service';
import {ConstantKeys} from 'src/app/constants/mfr.constants';
import {Location} from '@angular/common';
import {NgxSpinnerService} from "ngx-spinner";
import {ReportService} from "../../services/report.service";
import {ToastrService} from "ngx-toastr";

@Component({
  selector: 'app-sample-report',
  templateUrl: './sample-report.component.html',
  styleUrls: ['./sample-report.component.scss']
})
export class SampleReportComponent implements OnInit {
  menuInputList: any[] = [];
  selectedModule: any;
  tocModules = [];
  currentReport: MasterReportData = null;
  generatedModules = ['EXECUTIVE_SUMMARY', 'MARKET_INTRODUCTION', 'RESEARCH_METHODOLOGY', 'MARKET_DYNAMICS', 'COMPETITIVE_LANDSCAPE', 'APPENDIX']
  defaultModules = ['MARKET_ESTIMATION', 'MARKET_DYNAMICS', 'COMPANY_PROFILES', 'EXECUTIVE_SUMMARY', 'MARKET_FACTOR_ANALYSIS', 'MARKET_INTRODUCTION', 'RESEARCH_METHODOLOGY', 'COMPETITIVE_LANDSCAPE', 'APPENDIX']
  dropDownModules = [];
  tableModules = [];

  constructor(
    private router: Router,
    private spinner: NgxSpinnerService,
    private localStorageService: LocalStorageService,
    private reportService: ReportService,
    private toastr: ToastrService,
    private reportMetadataService: ReportMetadataService,
    public location: Location
  ) {
  }

  ngOnInit() {
    // this.spinner.show();
    this.currentReport = this.localStorageService.get(ConstantKeys.CURRENT_REPORT);
    this.localStorageService.remove(ConstantKeys.CURRENT_SECTION);
    this.reportMetadataService.getTocSectionListByReportId(this.currentReport._id).subscribe(data => {
      this.menuInputList = data;
      if (this.menuInputList && this.menuInputList[0] && !this.menuInputList[0].hasOwnProperty('deleted')) {
        // If deleted property present
        this.defaultModules.forEach(item => {
          let temp = _.find(this.menuInputList, ['section_key', item]);
          if (temp) {
            temp.section_name = _.startCase(_.toLower(temp.section_name));
            this.tableModules.push(temp);
            _.remove(this.menuInputList, (d) => temp.section_key === d.section_key);
          }
        });
        this.menuInputList.forEach(item => {
          item.section_name = _.startCase(_.toLower(item.section_name));
          this.dropDownModules.push(item);
        });
      } else {
        this.menuInputList.forEach(item => {
          if (item.hasOwnProperty('deleted')) {
            if (item.deleted) {
              this.dropDownModules.push(item);
            } else {
              this.tableModules.push(item);
            }
          } else {
            this.dropDownModules.push(item)
          }
        });
      }
      this.spinner.hide();
    }, error => {
      this.spinner.hide();
    });
  }

  addTocModule() {
    this.tableModules.push(this.selectedModule);
    _.remove(this.dropDownModules, (d) => this.selectedModule.section_key === d.section_key);
  }

  deleteModule(moduleToDelete) {
    this.dropDownModules.push(moduleToDelete);
    _.remove(this.tableModules, (d) => moduleToDelete.section_key === d.section_key);
  }

  onEditSelection(module) {
    let currentSection = module;
    currentSection.section_id = `${currentSection.section_id}`;
    currentSection.main_section_id = parseInt(currentSection.section_id);
    this.localStorageService.set(ConstantKeys.CURRENT_SECTION, currentSection);
    if (currentSection.subSections && currentSection.subSections.length) {
      this.router.navigateByUrl(`me-report/${this.currentReport._id}/other-sub-module`);
    } else {
      this.router.navigateByUrl(`me-report/${this.currentReport._id}/global-info/${currentSection.urlpattern}`);
    }
  }

  saveModules() {
    this.spinner.show();
    let data = [];
    this.tableModules.filter(item => {
      item.deleted = false;
      data.push(item);
    });
    this.dropDownModules.filter(item => {
      item.deleted = true;
      data.push(item);
    });
    this.reportService.saveReportModuleSequence(this.currentReport._id, data).subscribe(data => {
      this.toastr.success('Modules updated successfully', 'Message');
      this.spinner.hide();
    }, error => {
      this.spinner.hide();
    });
  }

  viewSample() {
    this.router.navigateByUrl(`sample-report-output/${this.currentReport._id}`);
  }

  onSectionSelection(subSubSec: TocSectionData) {
    let currentSection = subSubSec;
    currentSection.section_id = `${currentSection.section_id}`;
    currentSection.main_section_id = parseInt(currentSection.section_id);
    this.localStorageService.set(ConstantKeys.CURRENT_SECTION, currentSection);
    this.router.navigateByUrl(`sample-report/${this.currentReport._id}/${currentSection.urlpattern}`);
  }
}
