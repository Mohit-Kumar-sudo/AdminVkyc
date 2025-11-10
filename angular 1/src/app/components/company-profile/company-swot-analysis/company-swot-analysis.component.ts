import { Component, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import { LocalStorageService } from 'src/app/services/localsotrage.service';
import { MatSnackBar } from '@angular/material';
import { ConstantKeys } from 'src/app/constants/mfr.constants';
import { Swot, CompanyProfile, SWOTAnalysisData } from 'src/app/models/company-profile-model';
import { CompanyProfileService } from 'src/app/services/company-profile.service';
import {ReportService} from '../../../services/report.service';
import * as _ from 'lodash';
import { NgxSpinnerService } from 'ngx-spinner';

@Component({
  selector: 'app-company-swot-analysis',
  templateUrl: './company-swot-analysis.component.html',
  styleUrls: ['./company-swot-analysis.component.scss']
})

export class CompanySwotAnalysisComponent implements OnInit {

  STRENGTH = 'STRENGTH';
  WEAKNESS = 'WEAKNESS';
  OPPORTUNITIES = 'OPPORTUNITIES';
  THREAT = 'THREAT';

  strengths: Swot[] = [];
  weakness: Swot[] = [];
  opportunities: Swot[] = [];
  threats: Swot[] = [];

  currentStrength = '';
  currentWeakNess = '';
  currentOppourtunities = '';
  currentThreat = '';

  currentCompany: CompanyProfile;
  currentReport: any;

  constructor(private localStorageService: LocalStorageService,
    private companyProfileService: CompanyProfileService,
    private _location: Location,
    private spinner: NgxSpinnerService,
    private reportService: ReportService,
    private _snackBar: MatSnackBar) { }

  ngOnInit() {
    this.spinner.show();
    this.currentCompany = this.localStorageService.get(ConstantKeys.CURRENT_SELECTED_COMPANY_PROFILE_INFO);
    this.currentReport = this.localStorageService.get(ConstantKeys.CURRENT_REPORT);
    this.getFormInfo();
  }

  getFormInfo() {
    this.reportService.getReportCompanyDetailsByKeys(this.currentReport._id, this.currentCompany._id, 'swot_analysis').subscribe(data => {
        this.getFormInfoSuccess(data);
      },
      error => {
        console.log(error);
      }
    );
  }

  getFormInfoSuccess(data) {
    if (data && data.data.cp && data.data.cp.length) {
      const secData = _.find(data.data.cp, ['company_id', this.currentCompany._id])
      const swotData = secData.swot_analysis;
      let temp;
      temp = _.find(swotData, ['key', this.STRENGTH])
      if(temp && temp.value)
        this.strengths = temp.value
      temp = _.find(swotData, ['key', this.WEAKNESS])
      if(temp && temp.value)
        this.weakness = temp.value
      temp = _.find(swotData, ['key', this.OPPORTUNITIES])
      if(temp && temp.value)
        this.opportunities = temp.value
      temp = _.find(swotData, ['key', this.THREAT])
      if(temp && temp.value)
        this.threats = temp.value
    }
    this.spinner.hide();
  }

  selectedStrengthIndex = -1;
  addStrength() {
    if (this.selectedStrengthIndex >= 0) {
      let strength = {
        index_id: this.selectedStrengthIndex,
        name: this.currentStrength
      }
      this.strengths[this.selectedStrengthIndex] = strength
    } else {
      let strength = {
        index_id: this.strengths.length + 1,
        name: this.currentStrength
      }
      this.strengths.push(strength);
    }
    this.currentStrength = '';
    this.selectedStrengthIndex = -1;
  }

  selectCurrentStrength(element) {
    this.selectedStrengthIndex = this.strengths.indexOf(element);
    this.currentStrength = element.name;
  }

  selectedWeaknessIndex = -1;
  addWeakness() {
    if (this.selectedWeaknessIndex >= 0) {
      let weakness = {
        index_id: this.selectedWeaknessIndex,
        name: this.currentWeakNess
      }
      this.weakness[this.selectedWeaknessIndex] = weakness;
    } else {
      let weakness = {
        index_id: this.weakness.length + 1,
        name: this.currentWeakNess
      }
      this.weakness.push(weakness);
    }
    this.currentWeakNess = '';
    this.selectedWeaknessIndex = -1;
  }

  selectCurrentWeakness(element) {
    this.selectedWeaknessIndex = this.weakness.indexOf(element);
    this.currentWeakNess = element.name;
  }

  selectedOppIndex = -1;
  addOpportunities() {
    if (this.selectedOppIndex >= 0) {
      let opportunity = {
        index_id: this.selectedOppIndex,
        name: this.currentOppourtunities
      }
      this.opportunities[this.selectedOppIndex] = opportunity;
    } else {
      let opportunity = {
        index_id: this.opportunities.length + 1,
        name: this.currentOppourtunities
      }
      this.opportunities.push(opportunity);
    }
    this.currentOppourtunities = '';
    this.selectedOppIndex = -1;
  }

  selectCurrentOpportunity(element) {
    this.selectedOppIndex = this.opportunities.indexOf(element);
    this.currentOppourtunities = element.name;
  }


  selectedThreatIndex = -1;
  addOrUpdateThreat() {
    if (this.selectedThreatIndex >= 0) {
      let threat = {
        index_id: this.selectedThreatIndex,
        name: this.currentThreat
      }
      this.threats[this.selectedThreatIndex] = threat;
    } else {
      let threat = {
        index_id: this.threats.length + 1,
        name: this.currentThreat
      }
      this.threats.push(threat);
    }
    this.currentThreat = '';
    this.selectedThreatIndex = -1;
  }

  selectCurrentThread(element) {
    this.selectedThreatIndex = this.threats.indexOf(element);
    this.currentThreat = element.name;
  }

  onSubmitInfo() {
    this.spinner.show();
    let dataInfo: SWOTAnalysisData[] = [
      {
        key: this.STRENGTH,
        value: this.strengths
      },
      {
        key: this.WEAKNESS,
        value: this.weakness
      },
      {
        key: this.OPPORTUNITIES,
        value: this.opportunities
      },
      {
        key: this.THREAT,
        value: this.threats
      }
    ];
    this.reportService.addReportCompanyDetails(this.currentReport._id, dataInfo, this.currentCompany._id, 'sa').subscribe(
      resp => {
        this._snackBar.open('Company SWOT information saved successfully', 'Close', {
          duration: 2000,
        });
        this.spinner.hide();
      },
      err => {
        // ENHANCE: Read ERR & show data
        this._snackBar.open('Error occured while saving Company SWOT information', 'Close', {
          duration: 2000,
        });
        this.spinner.hide();
      }
    );
  }

  removeStrength(data) {
    this.strengths = this.strengths.filter(ele => ele.index_id !== data.index_id);
  }

  removeWeakness(data) {
    this.weakness = this.weakness.filter(ele => ele.index_id !== data.index_id);
  }

  removeOpportunity(data) {
    this.opportunities = this.opportunities.filter(ele => ele.index_id !== data.index_id);
  }

  removeThreat(data) {
    this.threats = this.threats.filter(ele => ele.index_id !== data.index_id);
  }

  toPreviousPage() {
    this._location.back();
  }
}
