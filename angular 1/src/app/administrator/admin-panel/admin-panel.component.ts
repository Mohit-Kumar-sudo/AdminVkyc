import { Component, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { SelectionModel } from '@angular/cdk/collections';
import { AdminService } from 'src/app/services/admin.service';
import * as _ from 'lodash';
import { NgxSpinnerService } from 'ngx-spinner';
import { MatSnackBar } from '@angular/material';
import { Location } from '@angular/common';

@Component({
  selector: 'app-admin-panel',
  templateUrl: './admin-panel.component.html',
  styleUrls: ['./admin-panel.component.scss']
})
export class AdminPanelComponent implements OnInit {
  displayedColumns: string[] = ['_id', 'name', 'email', 'email confirm', 'access'];
  dataSource: any
  @ViewChild(MatPaginator) paginator: MatPaginator;

  btnLabel = 'pending'
  actualData: any;
  selection: SelectionModel<any>;
  applyFilter(filterValue: string) {
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  constructor(
    private adminService: AdminService,
    private spinner: NgxSpinnerService,
    private snackBar: MatSnackBar,
    private _location:Location
  ) { }

  ngOnInit() {
    this.getAllUsers(0)
  }

  getAllUsers(key) {
    this.spinner.show();
    this.adminService.getAllUsers(key).subscribe(d => {
      this.spinner.hide();
      if (d && d.data) {
        this.actualData = d
        this.dataSource = new MatTableDataSource(this.actualData.data)
        this.dataSource.paginator = this.paginator;
        this.selection = new SelectionModel(true, []);
        this.actualData.data.forEach(dd => {
          if (dd.adminConfirm) {
            this.selection.select(dd)
          }
        })
      }
    }, err => {
      console.log(err);
      this.spinner.hide()
    })
  }

  changeLabel(val) {
    this.btnLabel = val === 1 ? 'confirmed' : (val === 2) ? 'all' : 'pending';
    this.getAllUsers(val)
  }

  isAllSelected() {
    return (this.selection.selected.length === this.dataSource.data.length);
  }

  masterToggle() {
    this.isAllSelected() ?
      this.selection.clear() :
      this.dataSource.data.forEach(row => this.selection.select(row));
  }

  checkboxLabel(row?: any): string {
    if (!row) {
      return `${this.isAllSelected() ? 'select' : 'deselect'} all`;
    }
    return `${this.selection.isSelected(row) ? 'deselect' : 'select'} row ${row.position + 1}`;
  }

  grantAccess() {
    this.spinner.show();
    const accessId = _.map(this.selection.selected, '_id');
    const denyId = _.filter(this.actualData.data, obj => accessId.indexOf(obj._id) == -1);
    const removeAccess = _.map(denyId, '_id');
    if (accessId.length) {
      this.accessService(1, accessId)
    } if (removeAccess.length) {
      this.accessService(0, removeAccess)
    }
  }

  accessService(key, ids) {
    this.adminService.userAccess({ key, ids }).subscribe(d => {
      this.spinner.hide()
      this.snackBar.open("User access update successfully!!!", 'Close', {
        duration: 2000,
      });
    }, err => {
      console.log(err);
      this.spinner.hide()
    })
  }

  back(){
    this._location.back()
  }
}
