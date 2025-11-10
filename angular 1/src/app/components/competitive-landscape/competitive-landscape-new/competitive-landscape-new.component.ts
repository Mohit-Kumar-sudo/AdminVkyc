import { Component, OnInit } from '@angular/core';
import { MasterReportData } from 'src/app/models/me-models';
import { MenuMetaData, competiveLandscapeCommonSections, competiveLandscapeTechDomainSections } from 'src/app/models/section-metadata';
import { Location } from '@angular/common';
import { LocalStorageService } from 'src/app/services/localsotrage.service';
import { ConstantKeys, MainSectionConstants } from 'src/app/constants/mfr.constants';
import { ReportMetadataService } from 'src/app/services/report-metadata.service';
import { Router } from '@angular/router';
import {NgxSpinnerService} from "ngx-spinner";

@Component({
  selector: 'app-competitive-landscape-new',
  templateUrl: './competitive-landscape-new.component.html',
  styleUrls: ['./competitive-landscape-new.component.scss']
})
export class CompetitiveLandscapeNewComponent implements OnInit {

  currentReport: MasterReportData = null;
  commonMenuList: MenuMetaData[] = competiveLandscapeCommonSections;
  techTrenMenuList: MenuMetaData[] = competiveLandscapeTechDomainSections;

  constructor(private reportMetadataService: ReportMetadataService,
    private localStorageService: LocalStorageService,
    private router: Router,
    private spinner: NgxSpinnerService,
    private _location: Location) { }

  ngOnInit() {
    this.spinner.hide();
    this.currentReport = this.localStorageService.get(ConstantKeys.CURRENT_REPORT);
  }

  onSectionSelection(menu: MenuMetaData, subMenu: MenuMetaData) {
    let currentSection = this.localStorageService.get(ConstantKeys.CURRENT_SECTION)
    if (subMenu) {
      currentSection.actual_section_id = `${menu.id}`;
      currentSection.section_id = `${currentSection.main_section_id}.${menu.id}.${subMenu.id}`;
      currentSection.section_pid = `${currentSection.main_section_id}.${menu.id}`;
      currentSection.sub_section_name = subMenu.value;

      let metaInfo = {
        section_key: subMenu.key,
        section_value: subMenu.value,
        section_parent_key: menu.key,
        section_parent_value: menu.value,
      }
      currentSection.meta_info = metaInfo;

    } else {
      currentSection.actual_section_id = menu.id;
      currentSection.section_id = `${currentSection.main_section_id}.${menu.id}`;
      currentSection.section_pid = `${currentSection.main_section_id}`;
      currentSection.sub_section_name = menu.value;

      let metaInfo = {
        section_key: menu.key,
        section_value: menu.value
      }
      currentSection.meta_info = metaInfo;
    }
    this.localStorageService.set(ConstantKeys.CURRENT_SECTION, currentSection);
    if(menu.key == 'dashboard'){
      this.router.navigateByUrl(`/competitor`);
    }else{
      this.router.navigateByUrl(`/secondary-input`);
    }
  }

  toPreviousPage() {
    this._location.back();
  }
}
