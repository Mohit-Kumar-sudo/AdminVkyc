import {Component, OnInit} from '@angular/core';
import {MasterReportData} from 'src/app/models/me-models';
import * as _ from 'lodash';
import {Location} from '@angular/common';
import {
  marketDynamicsCommonSections,
  MenuMetaData,
  marketDynamicsTechDomainSections
} from 'src/app/models/section-metadata';
import {ConstantKeys, MainSectionConstants} from 'src/app/constants/mfr.constants';
import {LocalStorageService} from 'src/app/services/localsotrage.service';
import {ReportMetadataService} from 'src/app/services/report-metadata.service';
import {Router, ActivatedRoute} from '@angular/router';
import {ReportService} from "../../../services/report.service";
import {NgxSpinnerService} from "ngx-spinner";

@Component({
  selector: 'app-market-dynamics-new',
  templateUrl: './market-dynamics-new.component.html',
  styleUrls: ['./market-dynamics-new.component.scss']
})
export class MarketDynamicsNewComponent implements OnInit {

  reportType: string = '';
  customTechDomain: string = '';
  currentSection: any;
  currentReport: MasterReportData = null;
  commonMenuList: MenuMetaData[] = [...marketDynamicsCommonSections];
  techTrenMenuList: any[] = [...marketDynamicsTechDomainSections];
  arrayModules: any = ["drivers", "restraints", "opportunities", "trends", "challenges"];

  constructor(private reportMetadataService: ReportMetadataService,
              private localStorageService: LocalStorageService,
              private router: Router,
              private reportService: ReportService,
              private spinner: NgxSpinnerService,
              private activatedRoute: ActivatedRoute,
              private _location: Location,) {
  }

  ngOnInit() {
    this.currentReport = this.localStorageService.get(ConstantKeys.CURRENT_REPORT);
    const params = this.activatedRoute.snapshot.queryParams;
    if (params && params.reportType) {
      this.reportType = params.reportType;
    }
    this.currentSection = this.localStorageService.get(ConstantKeys.CURRENT_SECTION);
    this.reportService.getTocByMainSectionId(this.currentReport._id, this.currentSection.main_section_id).subscribe(data => {
      if (data && data.data && data.data.length) {
        data.data.forEach(item => {
          if (item && item.toc && item.toc.meta_info && item.toc.meta_info.section_key && !this.arrayModules.includes(item.toc.meta_info.section_key)) {
            if(!_.map(this.techTrenMenuList, 'key').includes(item.toc.meta_info.section_key)) {
              console.log(item.toc.section_id.split('.')[1]);
              this.techTrenMenuList.push({
                id: item.toc.section_id.split('.')[1],
                key: item.toc.meta_info.section_key,
                value: item.toc.meta_info.section_value
              });
            }
          }
        });
      }
      this.spinner.hide();
    });
  }

  onSectionSelection(menu: MenuMetaData) {
    let currentSection = this.localStorageService.get(ConstantKeys.CURRENT_SECTION)
    currentSection.actual_section_id = menu.id;
    currentSection.section_id = `${currentSection.main_section_id}.${menu.id}`;
    currentSection.section_pid = `${currentSection.main_section_id}`;
    currentSection.sub_section_name = menu.value;

    this.localStorageService.set(ConstantKeys.CURRENT_SECTION, currentSection);

    let isFromCommon = this.commonMenuList.filter(menuEle => menuEle.id === menu.id).length > 0;

    if (this.arrayModules.includes(menu.key)) {
      currentSection.meta_info = {
        parent_section_key: menu.key,
        parent_section_value: menu.value
      };
      this.localStorageService.set(ConstantKeys.CURRENT_SECTION, currentSection);
      if (this.reportType == 'generate') {
        this.router.navigate([`multi-level-input`], {
          relativeTo: this.activatedRoute,
          queryParams: {reportType: 'generate'}
        });
      } else {
        this.router.navigate([`multi-level-input`], {relativeTo: this.activatedRoute});
      }
    } else {
      // Simple Show
      currentSection.meta_info = {
        section_key: menu.key,
        section_value: menu.value
      };
      this.localStorageService.set(ConstantKeys.CURRENT_SECTION, currentSection);
      this.localStorageService.remove(ConstantKeys.MARKET_DYN_SECTION_INFO);
      this.router.navigateByUrl(`/secondary-input`);
    }
  }

  addCustomTechDomain() {
    this.techTrenMenuList.push({
      id: `${6 + (this.techTrenMenuList.length + 1)}`,
      key: this.customTechDomain.toLowerCase().split(' ').join('_'),
      value: this.customTechDomain
    });
    this.customTechDomain = '';
  }

  toPreviousPage() {
    this._location.back();
  }

}
