import {Component, OnInit, ChangeDetectorRef} from '@angular/core';
import {LocalStorageService} from 'src/app/services/localsotrage.service';
import {ReportMetadataService} from 'src/app/services/report-metadata.service';
import {Router, ActivatedRoute} from '@angular/router';
import {MatDialog, MatSnackBar} from '@angular/material';
import {ConstantKeys} from 'src/app/constants/mfr.constants';
import {CompetitiveDashboardServiceApi} from 'src/app/services/competitiveDashboard.serviceApi';
import {MasterReportData, TocSectionData} from 'src/app/models/me-models';
import {MenuMetaData, getSubSectionMenuInfo, getMenuMetadataById} from 'src/app/models/section-metadata';
import {Location} from '@angular/common';
import {SegmentService} from 'src/app/services/segment.service';

@Component({
  selector: 'app-competitor-dashboard',
  templateUrl: './competitor-dashboard.component.html',
  styleUrls: ['./competitor-dashboard.component.scss']
})
export class CompetitorDashboardComponent implements OnInit {
  currentReport: MasterReportData = null;
  selectedSection: TocSectionData = null;
  subSectionInfo: MenuMetaData = null;
  rawData: any;
  childSectionName = '';
  newData = {
    company: ""
  };
  colspans: any = [];
  allKeys = [];
  data = {
    allHeads: {},
    allData: []
  };
  existingSecData: any = [];
  cnt = 0;

  objectKeys = Object.keys;
  objectValues = Object.values;

  constructor(private changeDetector: ChangeDetectorRef,
              private localStorageService: LocalStorageService,
              private reportMetadataService: ReportMetadataService,
              private router: Router,
              private route: ActivatedRoute,
              private dialog: MatDialog,
              private _snackBar: MatSnackBar,
              private _location: Location,
              private segmentService: SegmentService,
              private competitiveDashboardServiceApi: CompetitiveDashboardServiceApi) {
  }

  ngOnInit() {
    this.currentReport = this.localStorageService.get(ConstantKeys.CURRENT_REPORT);
    let currentSection = this.localStorageService.get(ConstantKeys.CURRENT_SECTION)

    this.selectedSection = currentSection;
    let subSectionList = getSubSectionMenuInfo(this.selectedSection.section_key);
    this.subSectionInfo = getMenuMetadataById(subSectionList, currentSection.actual_section_id);
    this.getCompetitiveDashboard1();
    this.getCompetitiveDashBoardData();
  }

  generateNewEntry() {
    this.newData = {
      company: ""
    };
    this.allKeys = [];
    let heads = Object.keys(this.data.allHeads);
    heads.forEach(e => {
      this.data.allHeads[e].forEach(e => {
        this.allKeys.push(e);
        this.newData[e] = false;
      });
    });
  }

  addNewEntry() {
    this.data.allData.push(this.newData);
    this.newData = {
      company: ""
    };
    this.generateNewEntry();
  }

  removeEntry(item) {
    let index = this.data.allData.indexOf(item)
    this.data.allData.splice(index, 1);
  }

  saveMetaInfo() {
    let currentSection: any = this.localStorageService.get(ConstantKeys.CURRENT_SECTION);
    let pushData = {
      "order_id": this.existingSecData.length ? this.existingSecData.length : 1,
      "type": "TABLE",
      "data": {"content": this.data.allData}
    };
    let isOldData = false;
    this.existingSecData.forEach(item => {
      if (item.type == 'TABLE' && item.data && item.data.content) {
        // CD type 2 table with checkbox
        item.data.content = this.data.allData;
        isOldData = true;
        return;
      }
    });
    currentSection.content = this.existingSecData;
    if (!isOldData) {
      currentSection.content.push(pushData);
    }
    currentSection.meta = {
      type: `DRIVERS`
    };
    currentSection.section_name = "Competitor Dashboard";

    this.competitiveDashboardServiceApi.saveCompetitiveDashboard(this.currentReport._id, currentSection)
      .subscribe(data => {
        this._snackBar.open('Selected Data saved to platform', 'Close', {
          duration: 2000,
        });
      }, (err) => {
        this._snackBar.open('Error occured while submitting to platform', 'Close', {
          duration: 2000,
        });
      });
  }

  onSubmit() {
    this.saveMetaInfo();
  }

  getFormInfo() {
    this.segmentService.getReportInfoByKey(this.currentReport._id, ConstantKeys.GEO_REGION_GET_KEY).subscribe(
      data => {
        this.getFormInfoSuccess(data);
      },
      error => {
        console.log(error);
      }
    );
  }

  getFormInfoSuccess(data) {
    if (data.me.geo_segment.length) {
      data.me.geo_segment.forEach(element => {
        this.colspans.push(element.region);
        if (element.countries) {
          this.cnt++;
          const name = this.cnt + element.region;
          this.data.allHeads[name] = [];
          element.countries.forEach(x => {
            this.data.allHeads[name].push(x.name);
          });
        }
      });
    }
    this.generateNewEntry();
  }

  getCompetitiveDashboard1() {
    let currentSection = this.localStorageService.get(ConstantKeys.CURRENT_SECTION)
    this.competitiveDashboardServiceApi.getCompetitorDashboardColumns(this.currentReport._id, currentSection.section_id, currentSection.main_section_id).subscribe(
      data => {
        this.getCompetitiveDashboardSuccess(data);
      },
      error => {
      }
    );
  }

  getCompetitiveDashBoardData() {
    let currentSection = this.localStorageService.get(ConstantKeys.CURRENT_SECTION)
    this.competitiveDashboardServiceApi.getCompetitorDashboardData(this.currentReport._id, currentSection.section_id, currentSection.main_section_id).subscribe(
      data => {
        this.getCompetitiveDashboardDataSuccess(data);
        this.generateNewEntry();
      },
      error => {
      }
    );
  }

  getCompetitiveDashboardSuccess(data) {
    this.rawData = data;
    var data1 = [];
    if (this.rawData.data[0]) {
      data1 = this.rawData.data[0].me.segment;
      data1.forEach(element => {
        if (element.pid == 1) {
          this.colspans.push(element);
        }
      });

      this.colspans.forEach(element => {
        this.cnt++;
        const name = this.cnt + element.name;
        this.data.allHeads[name] = [];
        data1.forEach(ele => {
          if (ele.pid != 1) {
            if (ele.pid == element.id) {
              this.data.allHeads[name].push(ele.name);
            }
            this.colspans.push(ele);
          }
        });
      });
    }
    this.getFormInfo();
  }

  getCompetitiveDashboardDataSuccess(data) {
    if (data.data[0] && data.data[0].toc && data.data[0].toc.content && data.data[0].toc.content.length) {
      this.existingSecData = data.data[0].toc.content;
      data.data[0].toc.content.forEach(item => {
        if (item.type == 'TABLE' && item.data && item.data.content) {
          this.data.allData = item.data.content;
        }
      });
    }
  }

  checkType(item) {
    return typeof (item) != 'boolean'
  }

  toPreviousPage() {
    this._location.back();
  }
}
