import { Component, OnInit } from '@angular/core';
import { MasterReportData } from 'src/app/models/me-models';
import { Location } from '@angular/common';
import {MenuMetaData, appendixSections} from 'src/app/models/section-metadata';
import { LocalStorageService } from 'src/app/services/localsotrage.service';
import { ConstantKeys, MainSectionConstants } from 'src/app/constants/mfr.constants';
import { ReportMetadataService } from 'src/app/services/report-metadata.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-appendix',
  templateUrl: './appendix.component.html',
  styleUrls: ['./appendix.component.scss']
})
export class AppendixComponent implements OnInit {

  currentReport: MasterReportData = null;
  menuInputList: MenuMetaData[] = [...appendixSections];

  constructor(private reportMetadataService: ReportMetadataService,
    private localStorageService: LocalStorageService,
    private router: Router,
    private _location: Location, ) { }

  ngOnInit() {
    this.currentReport = this.localStorageService.get(ConstantKeys.CURRENT_REPORT);

    /* let mainSection = this.reportMetadataService.getMainSectionByKey(MainSectionConstants.MARKET_INTRODUCTION)
    this.localStorageService.set(ConstantKeys.CURRENT_SECTION, {
      main_section_id: mainSection.section_id,
      is_main_section_only: mainSection.is_main_section_only
    }) */
  }

  onSectionSelection(menu: MenuMetaData) {
    let currentSection = this.localStorageService.get(ConstantKeys.CURRENT_SECTION)
    currentSection.actual_section_id = menu.id;
    currentSection.section_id = `${currentSection.main_section_id}.${menu.id}`;
    currentSection.section_pid = `${currentSection.main_section_id}`;

    let metaInfo = {
      section_key: menu.key,
      section_value: menu.value
    }
    currentSection.meta_info = metaInfo;

    this.localStorageService.set(ConstantKeys.CURRENT_SECTION, currentSection);
    this.router.navigateByUrl(`/secondary-input`);
  }

  toPreviousPage() {
    this._location.back();
  }

}
