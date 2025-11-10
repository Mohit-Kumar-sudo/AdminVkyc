import {Component, OnInit} from '@angular/core';
import {Location} from '@angular/common';
import {LocalStorageService} from 'src/app/services/localsotrage.service';
import {ConstantKeys} from 'src/app/constants/mfr.constants';
import {ReportMetadataService} from 'src/app/services/report-metadata.service';
import {Router} from '@angular/router';
import {Ng4LoadingSpinnerService} from 'ng4-loading-spinner';
import {MasterReportSecondarySectionData} from '../../models/secondary-research-models';
import {ReportService} from '../../services/report.service';
import {ReportSectionService} from '../../services/report-section.service';
import * as pieConfig from '../core/pie-chart-input/pie-chart-configs';
import * as barConfig from '../core/bar-chart-input/bar-chart-configs';
import * as _ from 'lodash';
import {NgxSpinnerService} from 'ngx-spinner';

@Component({
  selector: 'app-full-review-report',
  templateUrl: './full-review-report.component.html',
  styleUrls: ['./full-review-report.component.scss']
})
export class FullReviewReportComponent implements OnInit {

  currentReport: any;
  reportData: any;
  reportAllData: any = [];

  pieChartType = pieConfig.pieChartType;
  pieChartOptions = pieConfig.pieChartOptions;
  pieChartPlugins = pieConfig.pieChartPlugins;
  pieChartColors = pieConfig.pieChartColors;
  pieChartLegend = pieConfig.pieChartLegend;

  barChartType = barConfig.barChartType;
  barChartOptions = barConfig.barChartOptions;
  barChartPlugins = barConfig.barChartPlugins;
  barChartLegend = barConfig.barChartLegend;

  constructor(private reportMetadataService: ReportMetadataService,
              private localStorageService: LocalStorageService,
              private spinner: NgxSpinnerService,
              private router: Router,
              private reportSectionService: ReportSectionService,
              private reportService: ReportService,
              private location: Location) {
  }

  navigateToTop() {
    window.scrollTo(0, 0);
  }

  checkRating(e) {
    return !!(e.rating && Array.isArray(e.rating));
  }

  ngOnInit() {
    this.spinner.show();
    this.currentReport = this.localStorageService.get(ConstantKeys.CURRENT_REPORT);
    this.getReportDetails();
  }

  getReportDetails() {
    const currentReport = this.localStorageService.get(ConstantKeys.CURRENT_REPORT);
    this.reportService.getAllTocContentByReportId(currentReport._id).subscribe(data => {
      this.getAllTocContentByReportIdSuccess(data);
    }, error => {
      this.spinner.hide();
      console.log('error', error);
    });
  }

  getAllTocContentByReportIdSuccess(data: any) {
    console.log(data);
    for (let [key, value] of Object.entries(data.data)) {
      if (key == 'MARKET DYNAMICS') {
        value = _.orderBy(value, 'section_id', 'asc');
        // @ts-ignore
        value.forEach(ve => {
          ve.content = this.reportSectionService.convertToReportDataElement(ve.content);
        });
        this.reportAllData.push({section_name: key, data: value});
      } else if (key == 'MARKET FACTOR ANALYSIS') {
        console.log('MARKET FACTOR ANALYSIS', value);
        if (value['meta'] && value['meta'].type == 'SUPPLY_CHAIN') {

        }
      } else {
        console.log('value =>', value);
        this.reportAllData.push({
          section_name: key,
          data: value[0] ? this.reportSectionService.convertToReportDataElement(value[0].content) : []
        });
      }
    }
    console.log('this.reportAllData', this.reportAllData);
    this.spinner.hide();
  }

  toPreviousPage() {
    this.router.navigate(['/me-report/' + this.currentReport._id + '/global-info']);
  }
}
