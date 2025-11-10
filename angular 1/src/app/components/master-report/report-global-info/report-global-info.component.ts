import {Component, OnInit} from '@angular/core';
import {MasterReportData, TocSectionData} from 'src/app/models/me-models';
import {ReportMetadataService} from 'src/app/services/report-metadata.service';
import {ConstantKeys} from 'src/app/constants/mfr.constants';
import {LocalStorageService} from 'src/app/services/localsotrage.service';
import {Router} from '@angular/router';
import {MatSnackBar} from '@angular/material';
import {NgxSpinnerService} from 'ngx-spinner';
import * as _ from 'lodash';
import {StatusService} from '../../../services/status.service';
import {Location} from '@angular/common';
import {CdkDragDrop, moveItemInArray} from '@angular/cdk/drag-drop';
import {TextInputComponent} from "../../core/text-input/text-input.component";
import {MatDialog} from "@angular/material/dialog";
import {ModulesSequenceComponent} from "../modules-sequence/modules-sequence.component";
import {ReportService} from "../../../services/report.service";
import {AddSubModuleComponent} from "../add-sub-module/add-sub-module.component";

export interface AddNewModule {
  main_section_id: number,
  section_id: string,
  section_name: string,
  is_main_section_only: boolean,
  urlpattern: string,
}

@Component({
  selector: 'app-report-global-info',
  templateUrl: './report-global-info.component.html',
  styleUrls: ['./report-global-info.component.scss']
})
export class ReportGlobalInfoComponent implements OnInit {

  currentReport: MasterReportData = null;
  menuInputList: any[] = [];

  newModuleName = '';
  newModuleArr: AddNewModule[] = [];

  statusSelector = [];

  statusArray = ['not started', 'started', 'Finished'];

  constructor(private localStorageService: LocalStorageService,
              private reportMetadataService: ReportMetadataService,
              private spinner: NgxSpinnerService,
              private router: Router,
              private dialog: MatDialog,
              private _snackBar: MatSnackBar,
              private reportService: ReportService,
              private statusService: StatusService,
              private _location: Location) {
  }


  statusChange() {
    console.log(this.statusSelector);
  }

  ngOnInit() {
    this.spinner.show();
    this.currentReport = this.localStorageService.get(ConstantKeys.CURRENT_REPORT);
    this.localStorageService.remove(ConstantKeys.CURRENT_SECTION);
    this.reportService.getReportById(this.currentReport._id, 'tocList').subscribe(data => {
      if(data && data.length && data[0].tocList) {
        this.menuInputList = data[0].tocList;
        this.menuInputList.forEach(item => {
          item.section_name = _.startCase(_.toLower(item.section_name));
        });
        this.reportMetadataService.setReportSectionList(data);
      }
      this.spinner.hide();
    });
    this.addStatus();
  }

  onModuleSequence() {
    const dialogRef = this.dialog.open(ModulesSequenceComponent, {
      width: '60%',
      data: this.menuInputList,
      disableClose: true,
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.saveAPIModules(result);
      }
    });
  }

  addSubCustomModule(menu) {
    const dialogRef = this.dialog.open(AddSubModuleComponent, {
      width: '60%',
      data: {allMenu: this.menuInputList, menu},
      disableClose: true,
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.spinner.show();
        this.saveAPIModules(result);
      }
    });

  }

  saveAPIModules(result) {
    this.reportService.saveReportModuleSequence(this.currentReport._id, result).subscribe(data => {
      this.spinner.hide();
      this._snackBar.open('Modules updated successfully', 'Close', {
        duration: 2000,
      });
    }, error => {
      this.spinner.hide();
    });
  }


  addNewModule() {
    this.spinner.show();
    let nextId = this.menuInputList.length + 1;
    let newSection: AddNewModule = {
      main_section_id: nextId,
      section_id: `${nextId}`,
      section_name: this.newModuleName,
      is_main_section_only: true,
      urlpattern: 'other-module'
    };
    this.reportMetadataService.addNewCustomModule(this.currentReport._id, newSection).subscribe(
      resp => {
        this.newModuleArr.push(newSection);
        this.reportMetadataService.reportSectionList.push(newSection);
        this._snackBar.open('New module saved successfully', 'Close', {
          duration: 2000,
        });
        this.spinner.hide();
      },
      err => {
        this.spinner.hide();
        this._snackBar.open('Error occured while saving New module', 'Close', {
          duration: 2000,
        });
      });
    this.newModuleName = '';
  }

  onSectionSelection(subSubSec: any) {
    let currentSection = subSubSec;
    currentSection.section_id = `${currentSection.section_id}`;
    currentSection.main_section_id = parseInt(currentSection.section_id);
    this.localStorageService.set(ConstantKeys.CURRENT_SECTION, currentSection);
    if (subSubSec.subSections && subSubSec.subSections.length) {
      this.router.navigateByUrl(`me-report/${this.currentReport._id}/other-sub-module`);
    } else {
      this.router.navigateByUrl(`me-report/${this.currentReport._id}/global-info/${currentSection.urlpattern}`);
    }
  }

  removeElement(data) {
    // this.newModuleArr = this.newModuleArr.filter(ele => ele.index_id !== data.index_id);
  }

  addStatus() {
    this.statusService.addStatus(this.currentReport._id)
      .then(response => response.json())
      .then(data => {
        if (data) {
          this.statusService.getStatus(this.currentReport._id)
            .then(response => response.json())
            .then(data => {
              this.statusData(data)

            }).catch(err => {
            console.log(err);

          })
        }
      }).catch(err => {
      console.log(err);

    })
  }

  statusData(data) {
    let objs;
    if (data) {
      objs = data.data.status;
      objs = _.uniqBy(data.data.status, function (e) {
        return e.main_section_id;
      })

      if (this.menuInputList && this.menuInputList.length) {
        this.menuInputList.forEach((d, i) => {
          this.statusSelector[i] = 'not started'
          objs.forEach(s => {
            if (s.main_section_id == d.section_id) {
              this.statusSelector[i] = s.status
            }
          })
        })
      }
    }
  }

  toPreviousPage() {
    this._location.back();
  }

  finishedStatus(data, i) {

    if (data) {
      let status = {
        section_id: data.section_id,
        status: this.statusSelector[i]
      }
      this.statusService.updateStatus(status, this.currentReport._id)
        .then(response => response.json())
        .then(data => {
          console.log(data);

        }).catch(err => {
        console.log(err);

      })
    }

  }
}
