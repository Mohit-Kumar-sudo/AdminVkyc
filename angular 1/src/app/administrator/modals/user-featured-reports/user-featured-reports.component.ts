import {Component, OnInit, Inject} from '@angular/core';
import {MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';
import {FormControl} from "@angular/forms";
import * as _ from 'lodash';

@Component({
  selector: 'app-user-featured-reports',
  templateUrl: './user-featured-reports.component.html',
  styleUrls: ['./user-featured-reports.component.scss']
})
export class UserFeaturedReportsComponent implements OnInit {
  searchReport: FormControl = new FormControl();
  options = [];
  userFeaturedReports = [];

  constructor(public dialogRef: MatDialogRef<UserFeaturedReportsComponent>
    , @Inject(MAT_DIALOG_DATA) public data: any) {
  }

  ngOnInit() {
    if (this.data) {
      console.log(this.data)
      this.options = this.data.reports;
      if (this.data.user.featuredReportIds && this.data.user.featuredReportIds.length) {
        this.data.reports.forEach(report => {
          if (this.data.user.featuredReportIds.includes(report._id)) {
            this.userFeaturedReports.push(report);
          }
        });
      }
    }
    this.searchReport.valueChanges.subscribe(
      term => {
        if (term && term != '') {
          this.options = this.data.reports.filter(option => option && option.title && option.title.toLowerCase().includes(term.toLowerCase()));
        }
      });
  }

  removeReport(id) {
    _.remove(this.userFeaturedReports, (d) => id === d._id);
  }

  saveReports() {
    const data = {
      userId: this.data.user._id,
      featuredReportIds: _.map(this.userFeaturedReports, '_id'),
      reportIds: this.data.user.reportIds ? this.data.user.reportIds : []
    }
    this.dialogRef.close(data);
  }

  addReport(id) {
    this.data.reports.forEach(report => {
      if (id == report._id && !_.map(this.userFeaturedReports, '_id').includes(id)) {
        this.userFeaturedReports.push(report);
      }
    });
    this.searchReport.reset();
  }

  doClose() {
    this.dialogRef.close();
  }
}
