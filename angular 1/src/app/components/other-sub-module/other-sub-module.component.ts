import {Component, OnInit} from '@angular/core';
import {MasterReportData} from 'src/app/models/me-models';
import {Location} from '@angular/common';
import {MenuMetaData} from 'src/app/models/section-metadata';
import {LocalStorageService} from 'src/app/services/localsotrage.service';
import {ConstantKeys} from 'src/app/constants/mfr.constants';
import {ReportMetadataService} from 'src/app/services/report-metadata.service';
import {Router} from '@angular/router';

@Component({
  selector: 'app-market-introduction-new',
  templateUrl: './other-sub-module.component.html'
})
export class OtherSubModuleComponent implements OnInit {

  currentReport: MasterReportData = null;
  menuInputList: MenuMetaData[];

  constructor(private reportMetadataService: ReportMetadataService,
              private localStorageService: LocalStorageService,
              private router: Router,
              private _location: Location,) {
  }

  ngOnInit() {
    this.currentReport = this.localStorageService.get(ConstantKeys.CURRENT_REPORT);
    let section = this.localStorageService.get(ConstantKeys.CURRENT_SECTION);
    this.menuInputList = section.subSections;
  }

  onSectionSelection(menu) {
    let currentSection = this.localStorageService.get(ConstantKeys.CURRENT_SECTION)
    currentSection.actual_section_id = menu.id;
    currentSection.section_id = `${currentSection.main_section_id}.${menu.id}`;
    currentSection.section_pid = `${currentSection.main_section_id}`;
    currentSection.meta_info = {
      section_key: menu.key,
      section_value: menu.value
    };
    this.localStorageService.set(ConstantKeys.CURRENT_SECTION, currentSection);
    this.router.navigateByUrl(`/secondary-input`);
  }

  toPreviousPage() {
    this._location.back();
  }

}
