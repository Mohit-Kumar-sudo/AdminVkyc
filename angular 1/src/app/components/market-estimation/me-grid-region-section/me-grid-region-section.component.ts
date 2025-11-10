import { Component, OnInit } from '@angular/core';
import { LocalStorageService } from 'src/app/services/localsotrage.service';
import { Router } from '@angular/router';
import { MasterReportData, RegionCountry } from 'src/app/models/me-models';
import { ConstantKeys } from 'src/app/constants/mfr.constants';
import { Location } from '@angular/common';
import { SegmentService } from 'src/app/services/segment.service';
import {NgxSpinnerService} from 'ngx-spinner';

@Component({
  selector: 'app-me-grid-region-section',
  templateUrl: './me-grid-region-section.component.html',
  styleUrls: ['./me-grid-region-section.component.scss']
})
export class MeGridRegionSectionComponent implements OnInit {

  currentReport: MasterReportData = null;

  meRegionsList: RegionCountry[] = [];

  constructor(private localStorageService: LocalStorageService,
    private segmentService: SegmentService,
    private spinner: NgxSpinnerService,
    private router: Router,
    private _location: Location) { }

  ngOnInit() {
    this.spinner.show();
    this.currentReport = this.localStorageService.get(ConstantKeys.CURRENT_REPORT);
    this.segmentService.getReportInfoByKey(this.currentReport._id, 'me,title').subscribe(
      data => {
        this.meRegionsList = data.me.geo_segment;
        this.spinner.hide();
      }
    )
  }


  onRegionSelection(reg) {
    this.localStorageService.set(ConstantKeys.CURRENT_REGIONS_SELECTED,reg);
    this.router.navigateByUrl(`/me-report/${this.currentReport._id}/global-info/market-estimation/me-grid-data-info`);
  }

  toPreviousPage() {
    this._location.back();
  }
}
