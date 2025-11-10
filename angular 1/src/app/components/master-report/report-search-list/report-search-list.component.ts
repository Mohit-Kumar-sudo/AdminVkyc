import {Component, OnInit} from '@angular/core';
import {VerticalData} from 'src/app/models/me-models';
import {ReportService} from 'src/app/services/report.service';
import {ReportMetadataService} from 'src/app/services/report-metadata.service';
import {Router} from '@angular/router';
import {LocalStorageService} from 'src/app/services/localsotrage.service';
import {ConstantKeys} from 'src/app/constants/mfr.constants';
import {NgxSpinnerService} from 'ngx-spinner';
import {StatusService} from '../../../services/status.service';
import * as _ from 'lodash';

@Component({
  selector: 'app-report-search-list',
  templateUrl: './report-search-list.component.html',
  styleUrls: ['./report-search-list.component.scss']
})
export class ReportSearchListComponent implements OnInit {

  reportDataList: any = [];
  verticalList: VerticalData[] = [];
  searchText: any = '';
  reportData: any = [];
  currentReport: any;
  isVisible: any = false;
  reportModules: any = [];
  started: any = [];
  notStarted: any = [];
  finished: any = [];
  domain: any;

  constructor(
    private spinner: NgxSpinnerService,
    private reportMetaDataService: ReportMetadataService,
    private reportService: ReportService,
    private localStorageService: LocalStorageService,
    private statusService: StatusService) {
  }

  ngOnInit() {
    this.spinner.show();
    this.currentReport = this.localStorageService.get(ConstantKeys.CURRENT_REPORT);
    this.reportMetaDataService.getVerticalList()
      .subscribe(dataList => {
        this.verticalList = dataList;
        // this.getAllReports();
        this.spinner.hide();
      });
  }

  getAllReports() {
    this.reportService.getAll().subscribe(data => {
      this.reportDataList = data;
      this.reportDataList.forEach(item => {
        item.title = item.title + ' Market';
      });
      if (this.currentReport && this.currentReport._id) {
        this.getReportInfo(this.currentReport._id);
      } else {
        this.spinner.hide();
      }
    }, error => {
      this.spinner.hide();
    });
  }

  reset() {
    this.spinner.show();
    this.searchText = '';
    this.getAllReports();
  }

  searchReport() {
    if (this.searchText.trim()) {
      this.spinner.show();
      this.reportService.searchReportByName(this.searchText).subscribe(data => {
        if (data) {
          this.reportDataList = data;
          this.reportDataList.forEach(item => {
            item.title = item.title + ' Market';
          });
        }
        this.spinner.hide();
      }, error => {
        console.log(error);
        this.spinner.hide();
      });
    }
  }

  getReportInfo(reportId) {
    this.spinner.show();
    this.reportService.getById(reportId).subscribe(
      data => {
        this.getReportInfoSuccess(data);
      },
      error => {
        this.spinner.hide();
        console.log(error);
      }
    );
  }

  getReportInfoSuccess(data) {
    if (data) {
      this.reportData = data;
      this.addStatus();
      this.localStorageService.set(ConstantKeys.CURRENT_REPORT, data);
    } else {
      this.spinner.hide();
    }
    this.isVisible = true;
  }

  addStatus() {
    this.statusService.addStatus(this.reportData._id)
      .then(response => response.json())
      .then(data => {
        if (data) {
          this.statusService.getStatus(this.reportData._id)
            .then(response => response.json())
            .then(data => {
              this.statusData(data);

            }).catch(err => {
            console.log(err);

          });
        }
      }).catch(err => {
      console.log(err);

    });
  }

  statusData(data) {
    let objs;
    if (data) {
      objs = data.data.status;
      objs = _.uniqBy(data.data.status, function (e) {
        return e.main_section_id;
      });

      if (this.reportData.tocList && this.reportData.tocList.length) {
        this.reportData.tocList.forEach((d, i) => {
          this.reportModules[i] = {
            section_id: d.section_id,
            section_name: d.section_name,
            status: 'not started'
          };
          objs.forEach(s => {
            if (s.main_section_id == d.section_id) {
              this.reportModules[i] = {
                section_id: s.main_section_id,
                section_name: s.section_name,
                status: s.status
              };
            }
          });
        });
      }
      if (this.reportModules && this.reportModules.length) {
        this.notStarted = [];
        this.started = [];
        this.finished = [];
        this.reportModules.forEach(r => {
          this.reportData.tocList.forEach(d => {
            if (r.section_id === d.section_id && r.status == 'started') {
              this.started.push(d);
            } else if (r.section_id === d.section_id && r.status == 'Finished') {
              this.finished.push(d);
            }
          });
          if (r.status === 'not started') {
            this.notStarted.push(r);
          }
        });
        this.notStarted = _.uniqBy(this.notStarted, function (e) {
          return e.section_name;
        });
        this.started = _.uniqBy(this.started, function (e) {
          return e.section_name;
        });
        this.finished = _.uniqBy(this.finished, function (e) {
          return e.section_name;
        });
      }
    }
    this.spinner.hide();
  }

  getFilteredReport() {
    console.log('domain', this.domain);

  }
}
