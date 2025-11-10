import { Component, OnInit } from '@angular/core';
import { LocalStorageService } from 'src/app/services/localsotrage.service';
import { ConstantKeys, MainSectionConstants } from 'src/app/constants/mfr.constants';
import { ReportMetadataService } from 'src/app/services/report-metadata.service';


@Component({
  selector: 'app-other-module',
  templateUrl: './other-module.component.html',
  styleUrls: ['./other-module.component.scss']
})
export class OtherModuleComponent implements OnInit {

  constructor(private reportMetadataService: ReportMetadataService,
    private localStorageService: LocalStorageService) { }
    sectionDisplayName = "";

  ngOnInit() {
    let currentSectionInfo = this.localStorageService.get(ConstantKeys.CURRENT_SECTION);

    // let menuInfo = this.reportMetadataService.getMainSectionById(currentSectionInfo.main_section_id);
    this.sectionDisplayName = currentSectionInfo.section_name;
  }

}