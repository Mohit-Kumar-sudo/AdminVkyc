import {Component, Inject, OnInit} from '@angular/core';
import {MasterReportData} from 'src/app/models/me-models';
import {Location} from '@angular/common';
import {LocalStorageService} from 'src/app/services/localsotrage.service';
import {ConstantKeys} from 'src/app/constants/mfr.constants';
import {ReportService} from 'src/app/services/report.service';
import {MatSnackBar} from '@angular/material';
import {Router, ActivatedRoute} from '@angular/router';
import {CompanyProfile, GetCompanyProfileDetails} from 'src/app/models/company-profile-model';
import {CompanyProfileService} from 'src/app/services/company-profile.service';
import {NgxSpinnerService} from 'ngx-spinner';
import {MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';
import {ToastrService} from 'ngx-toastr';
import * as _ from 'lodash';
import {FormControl} from '@angular/forms';

@Component({
  selector: 'app-company-profile-new',
  templateUrl: './company-profile-new.component.html',
  styleUrls: ['./company-profile-new.component.scss']
})

export class CompanyProfileNewComponent implements OnInit {

  currentReport: MasterReportData = null;

  existingCompany: any = [];
  newCompany: any;
  currentCompanyList: CompanyProfile[] = [];
  selectedCompanyInfo: string = '';
  newCompanyInfo: string = '';
  searchCompany: FormControl = new FormControl();
  filteredCompany: any;

  constructor(
    private localStorageService: LocalStorageService,
    private reportService: ReportService,
    private spinner: NgxSpinnerService,
    public dialog: MatDialog,
    private toastr: ToastrService,
    private companyService: CompanyProfileService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private _location: Location,
    private _snackBar: MatSnackBar) {

  }

  ngOnInit() {
    this.spinner.show();
    // let segName: string = localStorage.getItem(ConstantKeys.REPORT_NAME);
    this.localStorageService.remove(ConstantKeys.CURRENT_COMPANY_FO_SECTION_LIST);
    this.currentReport = this.localStorageService.get(ConstantKeys.CURRENT_REPORT);
    this.getFormInfo(this.currentReport);
    this.searchCompany.valueChanges.subscribe(
      term => {
        if (term != '') {
          this.filteredCompany = this.existingCompany.filter(option => option.company_name.toLowerCase().includes(term.toLowerCase()));
          if (this.filteredCompany.length == 0 || this.filteredCompany.length <= 2) {
            this.selectedCompanyInfo = this.searchCompany.value;
          } else {
            this.selectedCompanyInfo = '';
          }
        }
      });

  }

  getFormInfo(currentReport) {
    this.reportService.getReportCompanyProfiles(currentReport).subscribe(
      res => {
        if (res && res.data && res.data.length > 0) {
          res.data[0].cp.map((ele) => {
            ele._id = ele.company_id;
          });
        }
        this.currentCompanyList = res.data[0].cp;
        this.companyService.getAllCompanies().subscribe(res => {
          this.existingCompany = res;
          this.filteredCompany = res;
          this.spinner.hide();
        }, error => {
          console.log(error);
          this.spinner.hide();
        });
      }, error => {
        console.log(error);
        this.spinner.hide();
      });
  }

  addDetails() {
    this.spinner.show();
    if (this.newCompanyInfo !== '') {
      if (!_.find(this.currentCompanyList, item => item.company_name.toLowerCase() === this.newCompanyInfo.toLowerCase()) && !_.find(this.existingCompany, item => item.company_name.toLowerCase() === this.newCompanyInfo.toLowerCase())) {
        let comp: CompanyProfile = {
          company_name: this.newCompanyInfo,
          vertical: this.currentReport.vertical
        };
        this.newCompanyInfo = '';
        this.companyService.addNewCompany(comp).subscribe(data => {
          this.currentCompanyList.push(data);
          this.localStorageService.set(ConstantKeys.COMPANY_PROFILE_INFO, this.currentCompanyList);
          this.addNewCompanyToReport({company_id: data._id, company_name: data.company_name});
        }, error => {
          this.spinner.hide();
        });
      } else {
        this.spinner.hide();
        this.toastr.error('Selected company already exists', 'Message');
      }
    } else {
      if (this.selectedCompanyInfo && !_.find(this.currentCompanyList, ['company_name', this.selectedCompanyInfo])) {
        let existingComp = this.existingCompany.filter(ele => ele.company_name == this.selectedCompanyInfo)[0];
        let comp: CompanyProfile = {
          _id: existingComp._id,
          company_name: existingComp.company_name,
          vertical: this.currentReport.vertical
        };
        this.selectedCompanyInfo = '';
        this.currentCompanyList.push(comp);
        this.localStorageService.set(ConstantKeys.COMPANY_PROFILE_INFO, this.currentCompanyList);
        this.addNewCompanyToReport({company_id: comp._id, company_name: comp.company_name});
      } else {
        this.selectedCompanyInfo = '';
        this.toastr.error('Selected company already exists in the current report.', 'Message');
        this.spinner.hide();
      }
    }
  }

  addNewCompanyToReport(company) {
    this.reportService.addNewCompanyToReport(this.currentReport._id, company).subscribe(
      resp => {
        this.spinner.hide();
        this.toastr.success('Companies updated to the current report successfully', 'Message');
      },
      err => {
        this.spinner.hide();
        this.toastr.error('Error occurred while adding Companies to Report', 'Message');
      }
    );
  }

  deleteCompanyFromReport(company) {
    this.reportService.deleteCompanyFromReport(this.currentReport._id, company).subscribe(
      resp => {
        this.spinner.hide();
        this.toastr.success('Companies updated to the current report successfully', 'Message');
      },
      err => {
        this.spinner.hide();
        this.toastr.error('Error occurred while adding Companies to Report', 'Message');
      }
    );
  }

  onSectionSelection(menu) {
    this.localStorageService.set(ConstantKeys.CURRENT_SELECTED_COMPANY_PROFILE_INFO, menu);
    this.router.navigate([`company-sections`], {relativeTo: this.activatedRoute, queryParams:{company_name:menu.company_name,companyId:menu.company_id}});
  }

  toPreviousPage() {
    this._location.back();
  }

  deleteCompany(company): void {
    const dialogRef = this.dialog.open(DeleteCompanyProfileDialog, {
      width: '400px',
      data: company
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.spinner.show();
        this.currentCompanyList = this.currentCompanyList.filter(ele => ele.company_name !== company.company_name);
        this.deleteCompanyFromReport(company);
      }
    });
  }
}

@Component({
  selector: 'delete-company-profile-dialog',
  template: `
    <p>
      Do you really want to remove company: <br><b>{{data?.company_name }}</b>
    </p>
    <hr>
    <div class="row">
      <div class="col-sm-6">
        <button class="btn btn-danger btn-block" (click)="dialogRef.close(true)">Yes</button>
      </div>
      <div class="col-sm-6">
        <button class="btn btn-info btn-block" (click)="dialogRef.close(false)">No</button>
      </div>
    </div>`
})

export class DeleteCompanyProfileDialog {
  constructor(
    public dialogRef: MatDialogRef<DeleteCompanyProfileDialog>,
    @Inject(MAT_DIALOG_DATA) public data: any) {
  }
}
