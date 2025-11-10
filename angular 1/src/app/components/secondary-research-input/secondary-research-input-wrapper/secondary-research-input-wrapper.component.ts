import { Component, OnInit, OnChanges, Input } from '@angular/core';
import { getSubSectionMenuInfo, getMenuMetadataById } from 'src/app/models/section-metadata';
import { SecondarySectionModel } from 'src/app/models/secondary-research-models';
import { LocalStorageService } from 'src/app/services/localsotrage.service';
import { ConstantKeys } from 'src/app/constants/mfr.constants';
import {NgxSpinnerService} from 'ngx-spinner';

@Component({
  selector: 'app-secondary-research-input-wrapper',
  templateUrl: './secondary-research-input-wrapper.component.html',
  styleUrls: ['./secondary-research-input-wrapper.component.scss']
})
export class SecondaryResearchInputWrapperComponent implements OnInit, OnChanges {

  secondarySectionModel: SecondarySectionModel;

  sectionDisplayName: string = null;
  subSectionDisplayName: string = null;

  constructor(private localStorageService: LocalStorageService,
    private spinner: NgxSpinnerService) { }

  ngOnChanges() {
  }

  ngOnInit() {
    this.spinner.show();
    let currentSectionInfo = this.localStorageService.get(ConstantKeys.CURRENT_SECTION);
    let menuInfo = currentSectionInfo; //this.reportMetadataService.getMainSectionById(currentSectionInfo.main_section_id);
    this.sectionDisplayName = menuInfo.section_name;
    let subSectionInfoFromMenu = !menuInfo.is_main_section_only ? getSubSectionMenuInfo(menuInfo.section_key) : [];
    let subSectionInfo = '';
    if (!menuInfo.is_main_section_only) {
      let splitSec = currentSectionInfo.section_id.split('.');
      let subMenuInfo = getMenuMetadataById(subSectionInfoFromMenu, menuInfo.actual_section_id);
      subSectionInfo = subMenuInfo ? subMenuInfo.value : '';
    }
    if(!subSectionInfo) {
      subSectionInfo = currentSectionInfo.meta_info ? currentSectionInfo.meta_info.section_value : '';
    }
    this.subSectionDisplayName = subSectionInfo;
    this.spinner.hide();
  }

}
