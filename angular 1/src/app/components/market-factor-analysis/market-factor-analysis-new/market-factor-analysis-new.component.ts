import {Component, OnInit} from '@angular/core';
import {MasterReportData} from 'src/app/models/me-models';
import {marketFactorAnalysisSections} from 'src/app/models/section-metadata';
import {ReportMetadataService} from 'src/app/services/report-metadata.service';
import {LocalStorageService} from 'src/app/services/localsotrage.service';
import {ActivatedRoute, Router} from '@angular/router';
import {ConstantKeys} from 'src/app/constants/mfr.constants';
import {Location} from '@angular/common';
import {ReportService} from "../../../services/report.service";
import {NgxSpinnerService} from "ngx-spinner";
import * as _ from 'lodash';

@Component({
  selector: 'app-market-factor-analysis-new',
  templateUrl: './market-factor-analysis-new.component.html',
  styleUrls: ['./market-factor-analysis-new.component.scss']
})
export class MarketFactorAnalysisNewComponent implements OnInit {

  currentReport: MasterReportData = null;
  menuInputList: any[] = [...marketFactorAnalysisSections];
  currentSection: any;
  customMFAModule: string = '';

  constructor(private reportMetadataService: ReportMetadataService,
              private localStorageService: LocalStorageService,
              private router: Router,
              private spinner: NgxSpinnerService,
              private reportService: ReportService,
              private activatedRoute: ActivatedRoute,
              private _location: Location) {
  }

  ngOnInit() {
    this.currentReport = this.localStorageService.get(ConstantKeys.CURRENT_REPORT);
    this.currentSection = this.localStorageService.get(ConstantKeys.CURRENT_SECTION);
    this.reportService.getTocByMainSectionId(this.currentReport._id, this.currentSection.main_section_id).subscribe(data => {
      if (data && data.data && data.data.length) {
        data.data.forEach(item => {
          if (item && item.toc && item.toc.meta_info && item.toc.meta_info.section_key) {
            // For adding custom modules to menu list.
            if (!_.map(this.menuInputList, 'key').includes(item.toc.meta_info.section_key)) {
              this.menuInputList.push({
                id: item.toc.section_id.split('.')[1],
                key: item.toc.meta_info.section_key,
                value: item.toc.meta_info.section_value,
                isSecondary: true
              });
            }
          }
        });
      }
      this.menuInputList.forEach(item => {
        item.isSecondary = !(['porter', 'supply-chain', "supplyChain", "valueChain"].includes(item.key))
      });
      this.spinner.hide();
    });
  }

  addCustomMFAModule() {
    this.menuInputList.push({
      id: `${(this.menuInputList.length + 1)}`,
      key: this.customMFAModule.toLowerCase().split(' ').join('_'),
      value: this.customMFAModule,
      isSecondary: true
    });
    this.customMFAModule = '';
  }


  onSectionSelection(menu, domain) {
    let currentSection = this.localStorageService.get(ConstantKeys.CURRENT_SECTION)
    currentSection.section_id = `${currentSection.main_section_id}.${menu.id}`;
    currentSection.section_pid = `${currentSection.main_section_id}`;
    currentSection.sub_section_name = menu.value;
    // Simple Show
    currentSection.meta_info = {
      section_key: menu.key,
      section_value: menu.value
    };
    this.localStorageService.set(ConstantKeys.CURRENT_SECTION, currentSection);
    if (menu.isSecondary) {
      this.router.navigateByUrl(`/secondary-input`);
    } else {
      if (domain == "nontech") {
        this.router.navigate([`porter-nontech`], {relativeTo: this.activatedRoute});
      } else {
        if ('supply-chain' == menu.key) {
          this.router.navigate([`supply-chain`], {relativeTo: this.activatedRoute});
        } else if (['supplyChain', 'valueChain'].includes(menu.key)) {
          this.router.navigate([`supply-chain`], {relativeTo: this.activatedRoute, queryParams: {chainType: menu.key}});
        } else {
          this.router.navigate([`porter`], {relativeTo: this.activatedRoute});
        }
      }
    }

  }

  toPreviousPage() {
    this._location.back();
  }

}
