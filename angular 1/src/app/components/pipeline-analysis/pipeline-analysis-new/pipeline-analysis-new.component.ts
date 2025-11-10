import { Component, OnInit } from '@angular/core';
import { MasterReportData } from 'src/app/models/me-models';
import { pipelineAnalysisSections, MenuMetaData } from 'src/app/models/section-metadata';
import { Location } from '@angular/common';
import { LocalStorageService } from 'src/app/services/localsotrage.service';
import { ConstantKeys, MainSectionConstants } from 'src/app/constants/mfr.constants';
import { ReportMetadataService } from 'src/app/services/report-metadata.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-pipeline-analysis-new',
  templateUrl: './pipeline-analysis-new.component.html',
  styleUrls: ['./pipeline-analysis-new.component.scss']
})
export class PipelineAnalysisNewComponent implements OnInit {

  currentReport: MasterReportData = null;
  menuInputList: MenuMetaData[] = pipelineAnalysisSections;

  constructor(private reportMetadataService: ReportMetadataService,
    private localStorageService: LocalStorageService,
    private router: Router,
    private _location: Location, ) { }

  ngOnInit() {
    this.currentReport = this.localStorageService.get(ConstantKeys.CURRENT_REPORT);

    /* let mainSection = this.reportMetadataService.getMainSectionByKey(MainSectionConstants.PIPELINE_ANALYSIS)
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
    currentSection.section_name = menu.value;

    let metaInfo = {
      section_key: menu.key,
      section_value: menu.value
    }
    currentSection.meta_info=metaInfo;

    this.localStorageService.set(ConstantKeys.CURRENT_SECTION, currentSection);
    this.router.navigateByUrl(`/secondary-input`);
  }


  toPreviousPage() {
    this._location.back();
  }
}
