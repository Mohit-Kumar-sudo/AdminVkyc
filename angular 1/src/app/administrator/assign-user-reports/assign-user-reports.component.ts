import { Component, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { SelectionModel } from '@angular/cdk/collections';
import { AdminService } from 'src/app/services/admin.service';
import * as _ from 'lodash';
import { NgxSpinnerService } from 'ngx-spinner';
import { MatSnackBar } from '@angular/material';
import { Location } from '@angular/common';
import { MatDialog } from "@angular/material/dialog";
import { UserReportsComponent } from "../modals/user-reports/user-reports.component";
import { UserFeaturedReportsComponent } from '../modals/user-featured-reports/user-featured-reports.component';

@Component({
  selector: 'app-admin-panel',
  templateUrl: './assign-user-reports.component.html',
  styleUrls: ['./assign-user-reports.component.scss']
})
export class AssignUserReportsComponent implements OnInit {
  displayedColumns: string[] = ['Sr. No.', 'Full name', 'Email', 'Action'];
  dataSource: any
  @ViewChild(MatPaginator) paginator: MatPaginator;

  users: any;
  reports: any;
  actualData: any;
  selection: SelectionModel<any>;

  applyFilter(filterValue: string) {
    this.users.filter = filterValue.trim().toLowerCase();
  }

  constructor(
    private adminService: AdminService,
    private spinner: NgxSpinnerService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog,
    private _location: Location
  ) {
  }

  ngOnInit() {
    this.getAllUsers()
  }

  getAllReports() {
    this.adminService.getAllReportsByKeys('_id,title').subscribe(data => {
      this.spinner.hide();
      if (data && data.data) {
        this.reports = data.data;
      }
    }, err => {
      this.spinner.hide()
    })
  }

  assignReports(user) {
    const dialogRef = this.dialog.open(UserReportsComponent, {
      width: '60%',
      data: { reports: this.reports, user },
      disableClose: true,
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        console.log(result);
        this.spinner.show();
        this.adminService.assignUserReports(result.userId, { featuredReportIds: result.featuredReportIds, reportIds: result.reportIds }).subscribe(data => {
          this.getAllUsers();
        }, err => {
          this.spinner.hide()
        })
      }
    });
  }

  assignFeaturedReports(user) {
    const dialogRef = this.dialog.open(UserFeaturedReportsComponent, {
      width: '60%',
      data: { reports: this.reports, user },
      disableClose: true,
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        console.log(result);
        this.spinner.show();
        this.adminService.assignUserReports(result.userId, { featuredReportIds: result.featuredReportIds, reportIds: result.reportIds }).subscribe(data => {
          this.getAllUsers();
        }, err => {
          this.spinner.hide()
        })
      }
    });
  }

  getAllUsers() {
    this.spinner.show();
    this.adminService.getAllUsersByKeys('_id,firstName,lastName,email,reportIds,featuredReportIds').subscribe(data => {
      this.spinner.hide();
      if (data && data.data) {
        data.data.forEach((user, index) => {
          user.no = index + 1;
        })
        this.users = new MatTableDataSource(data.data)
        this.users.paginator = this.paginator;
        this.getAllReports();
      }
    }, err => {
      this.spinner.hide()
    })
  }

}
