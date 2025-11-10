import { Component, OnInit } from '@angular/core';
import { SecondarySectionModel, SecondaryDataElement } from 'src/app/models/secondary-research-models';
import { CompanyProfile } from 'src/app/models/company-profile-model';
import { LocalStorageService } from 'src/app/services/localsotrage.service';
import { CompanyProfileService } from 'src/app/services/company-profile.service';
import { ConstantKeys } from 'src/app/constants/mfr.constants';
import { MatSnackBar } from '@angular/material';
import { ReportService } from 'src/app/services/report.service';
import { NgxSpinnerService } from 'ngx-spinner';

@Component({
  selector: 'app-cp-key-developments',
  templateUrl: './cp-key-developments.component.html',
  styleUrls: ['./cp-key-developments.component.scss']
})
export class CpKeyDevelopmentsComponent implements OnInit {

  secondarySectionModel: SecondarySectionModel;
  currentCompany: any;
  sectionName = ConstantKeys.KEY_DEVELOPMENT_SECTION_KEY;
  currentReport: any;

  constructor(private localStorageService: LocalStorageService,
    private companyProfileService: CompanyProfileService,
    private reportService: ReportService,
    private spinner: NgxSpinnerService,
    private _snackBar: MatSnackBar) { }

  ngOnInit() {
    this.currentCompany = this.localStorageService.get(ConstantKeys.CURRENT_SELECTED_COMPANY_PROFILE_INFO);
    this.currentReport = this.localStorageService.get(ConstantKeys.CURRENT_REPORT);

  }

  saveData(data: SecondaryDataElement[]) {
    this.reportService.addReportCompanyDetails(this.currentReport._id, data, this.currentCompany._id, 'kd').subscribe(
      resp => {
        this._snackBar.open('Company Key Developments saved successfully', 'Close', {
          duration: 2000,
        });
        this.spinner.hide();
      },
      err => {
        // ENHANCE: Read ERR & show data
        this._snackBar.open('Error occured while saving Company Key Developments', 'Close', {
          duration: 2000,
        });
        this.spinner.hide();
      }
    );
  }

}
