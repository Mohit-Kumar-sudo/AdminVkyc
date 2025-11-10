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
  selector: 'app-cp-strategy',
  templateUrl: './cp-strategy.component.html',
  styleUrls: ['./cp-strategy.component.scss']
})
export class CpStrategyComponent implements OnInit {

  secondarySectionModel: SecondarySectionModel;
  currentCompany: any;
  currentReport: any;

  sectionName = ConstantKeys.STRATEGY_SECTION_KEY;

  constructor(private localStorageService: LocalStorageService,
    private companyProfileService: CompanyProfileService,
    private reportService: ReportService,
    private spinner: NgxSpinnerService,
    private _snackBar: MatSnackBar) { }

  ngOnInit() {
    this.currentReport = this.localStorageService.get(ConstantKeys.CURRENT_REPORT);
    this.currentCompany = this.localStorageService.get(ConstantKeys.CURRENT_SELECTED_COMPANY_PROFILE_INFO);
  }

  saveData(data: SecondaryDataElement[]) {
    this.reportService.addReportCompanyDetails(this.currentReport._id, data, this.currentCompany._id, 'strategy').subscribe(
      resp => {
        this._snackBar.open('Strategy saved successfully', 'Close', {
          duration: 2000,
        });
        this.spinner.hide();
      },
      err => {
        // ENHANCE: Read ERR & show data
        this._snackBar.open('Error occured while saving Strategy', 'Close', {
          duration: 2000,
        });
        this.spinner.hide();
      }
    );
  }
}
