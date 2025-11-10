import { Component, OnInit } from '@angular/core';
import { SecondarySectionModel, SecondaryDataElement } from 'src/app/models/secondary-research-models';
import { CompanyProfileService } from 'src/app/services/company-profile.service';
import { LocalStorageService } from 'src/app/services/localsotrage.service';
import { CompanyProfile } from 'src/app/models/company-profile-model';
import { ConstantKeys } from 'src/app/constants/mfr.constants';
import { MatSnackBar } from '@angular/material';
import {ReportService} from '../../../services/report.service';
import { NgxSpinnerService } from 'ngx-spinner';

@Component({
  selector: 'app-cp-overview',
  templateUrl: './cp-overview.component.html',
  styleUrls: ['./cp-overview.component.scss']
})
export class CpOverviewComponent implements OnInit {

  secondarySectionModel: SecondarySectionModel;
  currentCompany: any;
  currentReport: any;

  sectionName = ConstantKeys.COMPANY_OVERVIEW_SECTION_KEY;

  constructor(private localStorageService: LocalStorageService,
    private companyProfileService: CompanyProfileService,
    private spinner: NgxSpinnerService,
    private reportService: ReportService,
    private _snackBar: MatSnackBar) { }

  ngOnInit() {
    this.currentCompany = this.localStorageService.get(ConstantKeys.CURRENT_SELECTED_COMPANY_PROFILE_INFO);
    this.currentReport = this.localStorageService.get(ConstantKeys.CURRENT_REPORT);
  }

  saveData(data: SecondaryDataElement[]) {
    this.reportService.addReportCompanyDetails(this.currentReport._id, data, this.currentCompany._id, 'co').subscribe(
      resp => {
        this._snackBar.open('Company Overview saved successfully', 'Close', {
          duration: 2000,
        });
        this.spinner.hide();
      },
      err => {
        this.spinner.hide();
        // ENHANCE: Read ERR & show data
        this._snackBar.open('Error occured while saving Company Overview', 'Close', {
          duration: 2000,
        });
      }
    );
  }
}
