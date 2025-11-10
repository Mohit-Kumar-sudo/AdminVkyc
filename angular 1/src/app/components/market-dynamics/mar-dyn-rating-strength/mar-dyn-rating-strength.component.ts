import {Component, OnInit, Input} from '@angular/core';
import {MatDialogRef} from '@angular/material';
import {MasterReportData} from 'src/app/models/me-models';
import {LocalStorageService} from 'src/app/services/localsotrage.service';
import {ConstantKeys} from 'src/app/constants/mfr.constants';
import {ActivatedRoute} from "@angular/router";

@Component({
  selector: 'app-mar-dyn-rating-strength',
  templateUrl: './mar-dyn-rating-strength.component.html',
  styleUrls: ['./mar-dyn-rating-strength.component.scss']
})
export class MarDynRatingStrengthComponent implements OnInit {

  isGenerate = false;
  currentReport: MasterReportData = null;
  ratingValue: any = [
    1, 2, 3, 4, 5, 6, 7, 8, 9, 10
  ]
  yearRatingList = [];

  @Input() public data = [];

  constructor(private localStorageService: LocalStorageService,
              private routes: ActivatedRoute,
              public dialogRef: MatDialogRef<MarDynRatingStrengthComponent>) {
  }

  ngOnInit() {
    const params = this.routes.snapshot.queryParams;
    if (params && params.reportType == 'generate') {
      this.isGenerate = true;
    }
    this.currentReport = this.localStorageService.get(ConstantKeys.CURRENT_REPORT);
    if (this.currentReport) {
      let baseYear = this.currentReport.me.base_year;
      let startYear = this.currentReport.me.base_year;
      let endYear = this.currentReport.me.end_year;
      if (this.isGenerate) {
        this.ratingValue = ['low', 'medium', 'high'];
        this.yearRatingList.push({
          year: `${baseYear - 2}-${baseYear - 1}`,
          rating: 0
        });
        this.yearRatingList.push({
          year: `${baseYear}-${baseYear + 2}`,
          rating: 0
        });
        this.yearRatingList.push({
          year: `${baseYear + 3}-${endYear}`,
          rating: 0
        });
      } else {
        for (let i = startYear; i <= endYear; i++) {
          let yearObj = {
            year: i,
            rating: 0
          }
          this.yearRatingList.push(yearObj);
        }
      }
    }
    if (this.data.length) {
      this.yearRatingList = this.data;
    }
  }

  onSubmitInfo() {
    this.dialogRef.close(this.yearRatingList);
  }
}
