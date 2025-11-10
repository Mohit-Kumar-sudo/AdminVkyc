import { Component, OnInit } from '@angular/core';
import { MasterReportData, TocSectionData } from 'src/app/models/me-models';
import { Router } from '@angular/router';
import { Location } from '@angular/common';
import { MenuMetaData, getSubSectionMenuInfo, getMenuMetadataById } from 'src/app/models/section-metadata';
import { MatDialog, MatSnackBar } from '@angular/material';
import { MarDynRatingStrengthComponent } from '../mar-dyn-rating-strength/mar-dyn-rating-strength.component';
import { ReportMetadataService } from 'src/app/services/report-metadata.service';
import { LocalStorageService } from 'src/app/services/localsotrage.service';
import { ConstantKeys } from 'src/app/constants/mfr.constants';
import { MasterReportSecondarySection, MasterReportSecondarySectionData } from 'src/app/models/secondary-research-models';
import { ReportService } from 'src/app/services/report.service';
import {ReportSectionService} from 'src/app/services/report-section.service';
import { NgxSpinnerService } from 'ngx-spinner';

export interface RatingInfo {
  year: number,
  rating: number,
}

export interface MultiLevelInputInfo {
  name: string;
  index_id: string;
  rating: RatingInfo[];
}

@Component({
  selector: 'app-multi-level-input',
  templateUrl: './multi-level-input.component.html',
  styleUrls: ['./multi-level-input.component.scss']
})
export class MultiLevelInputComponent implements OnInit {

  currentReport: MasterReportData = null;
  selectedSection: TocSectionData = null;
  subSectionInfo: MenuMetaData = null;

  childSectionName: string = '';
  subSubSectionList: any[] = [];
  data: any;

  constructor(private localStorageService: LocalStorageService,
    private reportService: ReportService,
    private reportMetadataService: ReportMetadataService,
    private reportSectionService: ReportSectionService,
    private router: Router,
    private spinner: NgxSpinnerService,
    private _location: Location,
    private dialog: MatDialog,
    private _snackBar: MatSnackBar) { }

  ngOnInit() {
    this.spinner.show();
    this.currentReport = this.localStorageService.get(ConstantKeys.CURRENT_REPORT);
    let currentSection = this.localStorageService.get(ConstantKeys.CURRENT_SECTION)

    // Current Section Info
    this.selectedSection = currentSection; //this.reportMetadataService.getMainSectionById(currentSection.main_section_id);

    let subSectionList = getSubSectionMenuInfo(this.selectedSection.section_key);
    this.subSectionInfo = getMenuMetadataById(subSectionList, currentSection.actual_section_id);

    currentSection.actual_section_id = this.subSectionInfo.id;
    currentSection.section_id = `${currentSection.main_section_id}.${this.subSectionInfo.id}`;
    currentSection.section_pid = `${currentSection.main_section_id}.${currentSection.actual_section_id}`;
    currentSection.section_name= this.subSectionInfo.value;

    this.localStorageService.set(ConstantKeys.CURRENT_SECTION, currentSection);

    this.getFormDetails();
  }

  getFormDetails() {
    const currentReport = this.localStorageService.get(ConstantKeys.CURRENT_REPORT);
    const sectionData = this.localStorageService.get(ConstantKeys.CURRENT_SECTION);
    this.reportService.getContentParentDetails(currentReport._id, sectionData.main_section_id, sectionData.section_pid).subscribe(data => {
      this.getFormDetailsSuccess(data)
      this.spinner.hide();
    }, error => {
      this.spinner.hide();
      console.error('error', error);
    });
  }

  getFormDetailsSuccess(data: MasterReportSecondarySectionData[]) {
    if (data && data.length > 0) {
      this.data = data;
      this.subSubSectionList = data;
    }
    this.spinner.hide();
  }

  addElement() {
    this.spinner.show();
    let newSection: MultiLevelInputInfo = {
      index_id: `${this.subSubSectionList.length + 1}`,
      name: this.childSectionName,
      rating: [],
    }

    this.childSectionName = '';

    let currentSection: MasterReportSecondarySection = this.localStorageService.get(ConstantKeys.CURRENT_SECTION);
    let reqDataObj = {...currentSection};
      reqDataObj.section_id = `${currentSection.section_id}.${this.subSubSectionList.length+1}`;
      reqDataObj.meta = {
        type: `${this.subSectionInfo.key}`.toUpperCase(),
        data: newSection
      };

    this.subSubSectionList.push(reqDataObj);

    this.reportService.saveTocInfoByReportSection(this.currentReport, reqDataObj)
      .subscribe(data => {
        console.log("Record added!");
        this.spinner.hide();
      }, (err) => {
        // ENHANCE: Read ERR & show data
        this._snackBar.open('Error occured while adding record to section', 'Close', {
          duration: 2000,
        });
        this.spinner.hide();
      });

    // this.localStorageService.set(ConstantKeys.MARKET_DYN_SECTION_INFO, this.subSubSectionList);
  }


  onSectionSelection(subSubSec: any) {
    let currentSection = this.localStorageService.get(ConstantKeys.CURRENT_SECTION)
    currentSection.section_pid = `${currentSection.main_section_id}.${currentSection.actual_section_id}`;
    currentSection.section_id = `${currentSection.main_section_id}.${currentSection.actual_section_id}.${subSubSec.meta.data.index_id}`;
    currentSection.section_name = subSubSec.meta.data.name;
    currentSection.meta = {
      type: `${this.subSectionInfo.key}`.toUpperCase(),
      data: subSubSec.meta.data
    };

    this.localStorageService.set(ConstantKeys.CURRENT_SECTION, currentSection);
    this.localStorageService.set(ConstantKeys.STORE_IN_LOCALSTORAGE, false);
    this.router.navigateByUrl(`/secondary-input`);
  }


  onRatingSelection(currSubSec) {
    const dialogRef = this.dialog.open(MarDynRatingStrengthComponent, {
      width: "60%",
      maxHeight: '80vh',
      data: currSubSec.meta.data.rating
    });
    dialogRef.componentInstance.data = currSubSec.meta.data.rating;

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        currSubSec.meta.data.rating = result;
        this.localStorageService.set(ConstantKeys.MARKET_DYN_SECTION_INFO, this.subSubSectionList);
      }
    });
  }

  saveMetaInfo() {
    this.spinner.show();
    let currentSection: MasterReportSecondarySection = this.localStorageService.get(ConstantKeys.CURRENT_SECTION);
    let reqDataArr = [];

    this.subSubSectionList.forEach((ele, idx) => {
      let reqDataObj = {...currentSection};
      reqDataObj.section_id = `${currentSection.section_id}.${idx+1}`;
      reqDataObj.meta = {
        type: `${this.subSectionInfo.key}`.toUpperCase(),
        data: ele.meta.data
      };
      reqDataObj.content = ele.content ? ele.content : [];
      reqDataArr.push(reqDataObj);
    });

    /* let metaInfo = {
      type: `${this.subSectionInfo.key}`.toUpperCase(),
      data: this.subSubSectionList
    }
    currentSection.content = [];
    currentSection.meta = metaInfo;
    */
    this.reportService.saveAndReplaceTocInfoByReportSectionArr(this.currentReport, reqDataArr, this.localStorageService.get(ConstantKeys.CURRENT_SECTION))
      .subscribe(data => {
        this._snackBar.open('Selected Data saved to platform', 'Close', {
          duration: 2000,
        });
        this.spinner.hide();
      }, (err) => {
        // ENHANCE: Read ERR & show data
        this._snackBar.open('Error occured while submitting to platform', 'Close', {
          duration: 2000,
        });
        this.spinner.hide();
      });

  }

  removeElement(data) {
    let idxToBeRemoved = -1;
    this.subSubSectionList.forEach((ele, idx) => {

      if (idxToBeRemoved !== -1) {
        ele.meta.data.index_id = idx;
      }

      if (ele.section_id == data.section_id) {
        idxToBeRemoved = idx;
      }

    });

    this.subSubSectionList.splice(idxToBeRemoved, 1);

    // this.subSubSectionList = this.subSubSectionList.filter(ele => ele.section_id !== data.section_id);
  }

  toPreviousPage() {
    this.localStorageService.remove(ConstantKeys.MARKET_DYN_SECTION_INFO);
    this._location.back();
  }
}
