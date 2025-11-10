import {Component, OnInit, ViewChild} from '@angular/core';
import {MatPaginator} from '@angular/material/paginator';
import {AdminService} from 'src/app/services/admin.service';
import * as _ from 'lodash';
import {NgxSpinnerService} from 'ngx-spinner';
import {MatSnackBar} from '@angular/material';
import {Location} from '@angular/common';
import {FormControl} from "@angular/forms";
import {ToastrService} from "ngx-toastr";

@Component({
  selector: 'app-admin-panel',
  templateUrl: './featured-reports.component.html',
  styleUrls: ['./featured-reports.component.scss']
})
export class FeaturedReportsComponent implements OnInit {
  searchReport: FormControl = new FormControl();
  @ViewChild(MatPaginator) paginator: MatPaginator;

  featuredReports: any;
  allReports: any;
  options: any;

  constructor(
    private adminService: AdminService,
    private spinner: NgxSpinnerService,
    private toastr: ToastrService,
    private snackBar: MatSnackBar,
    private _location: Location
  ) {
  }

  ngOnInit() {
    this.spinner.show();
    this.getAllReports();
    this.searchReport.valueChanges.subscribe(
      term => {
        if (term && term != '') {
          this.options = this.allReports.filter(option => option && option.title && option.title.toLowerCase().includes(term.toLowerCase()));
        }
      });
  }

  addReport(value) {
    this.spinner.show();
    const reportIds = _.map(this.featuredReports, '_id')
    reportIds.push(value);
    this.updateFeaturedReports(reportIds);
    this.toastr.success('Featured reports updated successfully', 'Message');
  }

  deleteReport(value) {
    this.spinner.show();
    const reportIds = _.map(this.featuredReports, '_id')
    _.remove(reportIds, (d) => d === value);
    this.updateFeaturedReports(reportIds);
    this.toastr.success('Featured reports updated successfully', 'Message');
  }

  updateFeaturedReports(reportIds) {
    this.adminService.update_featured_reports({reportIds}).subscribe(data => {
      this.getFeaturedReports();
      this.searchReport.reset();
    }, err => {
      this.spinner.hide()
    })
  }

  getFeaturedReports() {
    this.adminService.getFeaturedReports().subscribe(data => {
      if (data && data.data) {
        this.featuredReports = data.data;
      }
      this.spinner.hide();
    }, err => {
      this.spinner.hide()
    })
  }

  getAllReports() {
    this.adminService.getAllReportsByKeys('_id,title,vertical').subscribe(data => {
      if (data && data.data) {
        this.allReports = data.data;
        this.options = data.data;
        this.getFeaturedReports();
      }
    }, err => {
      this.spinner.hide()
    })
  }
}
