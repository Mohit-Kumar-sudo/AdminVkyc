import {Component, OnInit, Inject} from '@angular/core';
import {MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';
import {FormControl} from "@angular/forms";
import * as _ from 'lodash';

@Component({
  selector: 'app-user-reports',
  templateUrl: './user-reports.component.html',
  styleUrls: ['./user-reports.component.scss']
})
export class UserReportsComponent implements OnInit {
  searchReport: FormControl = new FormControl();
  options = [];
  userReports = [];

  constructor(public dialogRef: MatDialogRef<UserReportsComponent>
    , @Inject(MAT_DIALOG_DATA) public data: any) {
  }

  ngOnInit() {
    if (this.data) {
      this.options = this.data.reports;
      if (this.data.user.reportIds && this.data.user.reportIds.length) {
        this.data.reports.forEach(report => {
          if (this.data.user.reportIds.includes(report._id)) {
            this.userReports.push(report);
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
    _.remove(this.userReports, (d) => id === d._id);
  }

  saveReports() {
    const data = {
      userId: this.data.user._id,
      reportIds: _.map(this.userReports, '_id'),
      featuredReportIds: this.data.user.featuredReportIds ? this.data.user.featuredReportIds : []
    }
    this.dialogRef.close(data);
  }

  addReport(id) {
    this.data.reports.forEach(report => {
      if (id == report._id && !_.map(this.userReports, '_id').includes(id)) {
        this.userReports.push(report);
      }
    });
    this.searchReport.reset();
  }

  doClose() {
    this.dialogRef.close();
  }
}
