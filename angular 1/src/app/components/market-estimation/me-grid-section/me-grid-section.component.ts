import { Component, OnInit } from '@angular/core';
import { LocalStorageService } from 'src/app/services/localsotrage.service';
import { Router } from '@angular/router';
import { Location } from '@angular/common';
import { MasterReportData } from 'src/app/models/me-models';
import { ConstantKeys } from 'src/app/constants/mfr.constants';
import { SegmentService } from 'src/app/services/segment.service';
import { SegmentNodeRequest } from 'src/app/models/segment-models';
import {NgxSpinnerService} from 'ngx-spinner';

@Component({
  selector: 'app-me-grid-section',
  templateUrl: './me-grid-section.component.html',
  styleUrls: ['./me-grid-section.component.scss']
})
export class MeGridSectionComponent implements OnInit {

  currentReport: MasterReportData = null;

  meSectionList: SegmentNodeRequest[] = [];

  constructor(private localStorageService: LocalStorageService,
    private segmentService: SegmentService,
    private spinner: NgxSpinnerService,
    private router: Router,
    private _location: Location) { }

  ngOnInit() {
    this.spinner.show();
    this.currentReport = this.localStorageService.get(ConstantKeys.CURRENT_REPORT);
    this.segmentService.getReportInfoByKey(this.currentReport._id,'me,title').subscribe(
      data => {
        // console.log("dataa",data)
        this.meSectionList = data.me.segment.filter((i) => {
          return (i.pid == "1")
        });
        this.spinner.hide();
      }
    )
  }

  onSegmentSelection(menu) {
    this.localStorageService.set(ConstantKeys.CURRENT_SEGMENT_SELECTED,menu);
    this.localStorageService.set(ConstantKeys.CURRENT_GRID_LOAD_KEY,ConstantKeys.MARKET_BY_SEGMENT);
    this.router.navigateByUrl(`/me-report/${this.currentReport._id}/global-info/market-estimation/me-grid-data-info`);
  }

  onRegionSelection() {
    this.localStorageService.set(ConstantKeys.CURRENT_GRID_LOAD_KEY,ConstantKeys.MARKET_BY_REGION);
    this.router.navigateByUrl(`/me-report/${this.currentReport._id}/global-info/market-estimation/me-grid-region-section`);
  }

  toPreviousPage() {
    this._location.back();
  }


}
