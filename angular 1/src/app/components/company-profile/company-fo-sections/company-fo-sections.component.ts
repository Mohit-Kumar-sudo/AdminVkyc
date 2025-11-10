import {Component, OnInit} from '@angular/core';
import {Location} from '@angular/common';
import {Router} from '@angular/router';
import {LocalStorageService} from 'src/app/services/localsotrage.service';
import {ConstantKeys} from 'src/app/constants/mfr.constants';
import {MasterReportData} from 'src/app/models/me-models';
import {FinancialOverview, CompanyProfile, FinancialOverviewSave} from 'src/app/models/company-profile-model';
import {CompanyProfileService} from 'src/app/services/company-profile.service';
import {MatSnackBar} from '@angular/material';
import {NgxSpinnerService} from 'ngx-spinner';

@Component({
  selector: 'app-company-fo-sections',
  templateUrl: './company-fo-sections.component.html',
  styleUrls: ['./company-fo-sections.component.scss']
})
export class CompanyFoSectionsComponent implements OnInit {

  currentReport: MasterReportData = null;
  currentCompany: CompanyProfile;

  foSections: FinancialOverview[] = [];

  getFOSectionList(fromYear: number, toYear: number): FinancialOverview[] {
    return [
      {
        key: 'SBU',
        name: 'SBU breakup',
        brkup_no: 0,
        currency: 'USD',
        metric: 'Mn',
        content: '',
        from_year: new Date(fromYear, 1, 1),
        to_year: new Date(toYear, 1, 1)
      },
      {
        key: 'VERTICAL',
        name: 'Industry vertical breakup',
        brkup_no: 0,
        currency: 'USD',
        metric: 'Mn',
        content: '',
        from_year: new Date(fromYear, 1, 1),
        to_year: new Date(toYear, 1, 1)
      },
      {
        key: 'REGIONAL',
        name: 'Regional breakup',
        brkup_no: 0,
        currency: 'USD',
        metric: 'Mn',
        content: '',
        from_year: new Date(fromYear, 1, 1),
        to_year: new Date(toYear, 1, 1)
      },
    ];
  }

  constructor(
    private companyProfileService: CompanyProfileService,
    private localStorageService: LocalStorageService,
    private router: Router,
    private spinner: NgxSpinnerService,
    private _location: Location,
    private _snackBar: MatSnackBar
  ) {
    this.spinner.show();
  }

  ngOnInit() {
    this.currentReport = this.localStorageService.get(ConstantKeys.CURRENT_REPORT);
    this.currentCompany = this.localStorageService.get(ConstantKeys.CURRENT_SELECTED_COMPANY_PROFILE_INFO);
    this.getFormInfo();
  }

  getSectionNameByKey(key: string) {
    switch (key) {
      case 'SBU':
        return 'SBU Breakup';
      case 'VERTICAL':
        return 'Industry vertical breakup';
      case 'REGIONAL':
        return 'Regional breakup';
    }
  }

  getDefaultFoSections() {
    let startYear = this.currentReport.me.start_year;
    let endYear = this.currentReport.me.end_year;
    return (this.getFOSectionList(startYear, endYear));
  }

  getFormInfo() {
    let foSections = this.localStorageService.get(ConstantKeys.CURRENT_COMPANY_FO_SECTION_LIST) || [];
    if (foSections.length < 1) {
      this.companyProfileService.getSecondaryDetailsByKey(this.currentCompany._id, ConstantKeys.FINANCIAL_OVERVIEW_SECTION_KEY).subscribe(
        data => {
          if (data.length > 0) {

            this._snackBar.open('Company Financial Overview data fetched successfully', 'Close', {
              duration: 2000,
            });

            if (data && data.length > 0) {
              let withYearOnlyList = data.map(ele => {
                ele.from_year = new Date(ele.from_year, 1, 1);
                ele.to_year = new Date(ele.to_year, 1, 1);
                return ele;
              });
              data = withYearOnlyList;
            }

            this.foSections = data;
          } else {
            this.foSections = this.getDefaultFoSections();
          }
          this.localStorageService.set(ConstantKeys.CURRENT_COMPANY_FO_SECTION_LIST, this.foSections);
          this.spinner.hide();
        },
        error => {
          this.spinner.hide();
          console.log(error);
          this._snackBar.open(error.message, 'Close', {
            duration: 2000,
          });
          this.getDefaultFoSections();
        }
      );
    } else {
      let withYearOnlyList = foSections.map(ele => {
        ele.from_year = new Date(ele.from_year);
        ele.to_year = new Date(ele.to_year);
        return ele;
      });
      this.foSections = withYearOnlyList;
      this.spinner.hide();
    }

  }

  toPreviousPage() {
    this._location.back();
  }

  processSelectedElement(element: FinancialOverview) {
    this.localStorageService.set(ConstantKeys.CURRENT_COMPANY_FO_SECTION, element);

    this.updateFoList(element);

    this.router.navigateByUrl(`/me-report/${this.currentReport._id}/global-info/company-profile/company-sections/fo-sections/${element.key}`);
  }

  saveData() {
    let foSectionList: FinancialOverview[] = this.localStorageService.get(ConstantKeys.CURRENT_COMPANY_FO_SECTION_LIST);
    let foSaveRequest = foSectionList.map(ele => {
      let foSave: FinancialOverviewSave = {
        key: ele.key,
        name: ele.name,
        brkup_no: ele.brkup_no,
        from_year: new Date(ele.from_year).getFullYear(),
        to_year: new Date(ele.to_year).getFullYear(),
        currency: ele.currency,
        metric: ele.metric,
        content: ele.content
      };
      return foSave;
    });
    this.companyProfileService.saveCompanyFoSections(this.currentCompany._id, foSaveRequest).subscribe(
      resp => {
        this._snackBar.open('Company Key Developments saved successfully', 'Close', {
          duration: 2000,
        });
        //this.localStorageService.remove(ConstantKeys.CURRENT_COMPANY_FO_SECTION_LIST);
      },
      err => {
        // ENHANCE: Read ERR & show data
        this._snackBar.open('Error occured while saving Company Key Developments', 'Close', {
          duration: 2000,
        });
      }
    );
  }

  updateFoList(element: FinancialOverview) {
    let foSectionList: FinancialOverview[] = this.localStorageService.get(ConstantKeys.CURRENT_COMPANY_FO_SECTION_LIST);
    let eleFound = false;
    if (foSectionList) {
      for (let ele of foSectionList) {
        if (ele.key === element.key) {
          let indexOf = foSectionList.indexOf(ele);
          foSectionList[indexOf] = element;
          eleFound = true;
        }
      }

      if (!eleFound) {
        foSectionList.push(element);
      }

      this.localStorageService.set(ConstantKeys.CURRENT_COMPANY_FO_SECTION_LIST, foSectionList);
    }
  }
}
