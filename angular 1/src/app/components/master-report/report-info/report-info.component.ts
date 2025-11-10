import {Component, OnInit} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {ReportService} from 'src/app/services/report.service';
import {LocalStorageService} from 'src/app/services/localsotrage.service';
import {ConstantKeys} from 'src/app/constants/mfr.constants';
import {Ng4LoadingSpinnerService} from 'ng4-loading-spinner';
import {NgxSpinnerService} from "ngx-spinner";

@Component({
  selector: 'app-report-info',
  templateUrl: './report-info.component.html',
  styleUrls: ['./report-info.component.scss']
})
export class ReportInfoComponent implements OnInit {
  reportId: any = ''
  reportData: any;

  constructor(private routes: ActivatedRoute,
              private spinner: NgxSpinnerService,
              private localStorageService: LocalStorageService,
              private reportService: ReportService) {
    // this.spinner.show();
    this.reportId = this.routes.snapshot.params['id'];
    this.getReportInfo();
  }


  getReportInfo() {
    this.reportService.getById(this.reportId).subscribe(
      data => {
        this.getReportInfoSuccess(data)
      },
      error => {
        console.log(error);
      }
    );
  }

  getReportInfoSuccess(data) {
    if (data) {
      this.reportData = data;
      this.localStorageService.set(ConstantKeys.CURRENT_REPORT, data);
    }
    this.spinner.hide();
  }

  ngOnInit() {
  }

}
