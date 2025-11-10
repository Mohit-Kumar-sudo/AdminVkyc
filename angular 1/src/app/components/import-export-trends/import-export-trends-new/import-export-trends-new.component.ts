import { Component, OnInit } from '@angular/core';
import { ReportMetadataService } from 'src/app/services/report-metadata.service';
import { LocalStorageService } from 'src/app/services/localsotrage.service';
import { MainSectionConstants, ConstantKeys } from 'src/app/constants/mfr.constants';

@Component({
  selector: 'app-import-export-trends-new',
  templateUrl: './import-export-trends-new.component.html',
  styleUrls: ['./import-export-trends-new.component.scss']
})
export class ImportExportTrendsNewComponent implements OnInit {

  constructor(private reportMetadataService: ReportMetadataService,
    private localStorageService: LocalStorageService, ) { }

  ngOnInit() {
    let mainSection = this.reportMetadataService.getMainSectionByKey(MainSectionConstants.IMPORT_EXPORT_TRENDS)
    this.localStorageService.set(ConstantKeys.CURRENT_SECTION, {
      main_section_id: mainSection.section_id,
      section_id: mainSection.section_id,
      is_main_section_only: mainSection.is_main_section_only,
      section_name: mainSection.section_name
    })
  }

}
