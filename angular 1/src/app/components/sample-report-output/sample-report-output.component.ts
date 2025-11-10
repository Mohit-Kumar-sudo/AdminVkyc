import { Component, OnInit } from '@angular/core'
import { ReportMetadataService } from 'src/app/services/report-metadata.service';
import { MasterReportData, TocSectionData } from 'src/app/models/me-models';
import * as _ from 'lodash';
import { LocalStorageService } from 'src/app/services/localsotrage.service';
import { ConstantKeys } from 'src/app/constants/mfr.constants';
import { SharedSampleTocService } from 'src/app/services/shared-sample-toc.service';
import { HeaderService } from 'src/app/services/header.service';
import { ActivatedRoute, NavigationStart, Router } from '@angular/router';
import { ReportService } from 'src/app/services/report.service';

@Component({
  selector: 'app-sample-report-output',
  templateUrl: './sample-report-output.component.html',
  styleUrls: []
})
export class SampleReportOutputComponent implements OnInit {
  menuInputList: TocSectionData[] = [];
  selectedModule = "";
  tocModules = [];
  currentReport: MasterReportData = null;
  private routeSub: any;
  defaultToc = ['EXECUTIVE_SUMMARY', 'MARKET_INTRODUCTION', 'RESEARCH_METHODOLOGY',
    'MARKET_DYNAMICS', 'MARKET_FACTOR_ANALYSIS', 'MARKET_ESTIMATION', 'COMPETITIVE_LANDSCAPE',
    'COMPANY_PROFILES', 'APPENDIX']

  constructor(
    private localStorageService: LocalStorageService,
    private reportMetadataService: ReportMetadataService,
    private sharedSampleTocService: SharedSampleTocService,
    private headerService: HeaderService,
    private activatedRoute: ActivatedRoute,
    private reportService: ReportService,
    private router: Router
  ) { }

  ngOnInit() {
    this.routeSub = this.router.events.subscribe((event) => {
      if (event instanceof NavigationStart) {
        this.headerService.hide()
      }
    });
    this.activatedRoute.params.subscribe(params => {
      if (params['id']) {
        let reportid = params['id']
        this.reportService.getById(reportid).subscribe(data => {
          if (data) {
            this.localStorageService.set(ConstantKeys.CURRENT_REPORT, data);
            this.currentReport = this.localStorageService.get(ConstantKeys.CURRENT_REPORT);
            this.viewSampleData();
          }
        });
      } else {
        this.currentReport = this.localStorageService.get(ConstantKeys.CURRENT_REPORT);
        this.localStorageService.remove(ConstantKeys.CURRENT_SECTION);
        this.viewSampleData();
      }
    });

  }
  viewSampleData() {
    if (this.currentReport) {
      this.headerService.hide()
      this.reportMetadataService.getTocSectionListByReportId(this.currentReport._id).subscribe(data => {
        this.menuInputList = data;
        this.menuInputList.forEach(item => {
          item.section_name = _.startCase(_.toLower(item.section_name));
        });
        this.tocModules = [];
        if (this.menuInputList && this.menuInputList[0] && this.menuInputList[0].hasOwnProperty('deleted')) {
          this.menuInputList.forEach(obj => {
            if (obj.hasOwnProperty('deleted')) {
                this.sharedSampleTocService.addToc(obj)
                this.tocModules.push(obj)
            }
          })
        } else {
          this.defaultToc.forEach(e => {
            this.menuInputList.forEach(obj => {
              if (obj.section_key == e) {
                  this.sharedSampleTocService.addToc(obj)
                  this.tocModules.push(obj);
              }
            })
          })
        }
      });
    }
  }
  public ngOnDestroy() {
    this.headerService.show();
    this.sharedSampleTocService.refreshService();
    this.routeSub.unsubscribe();
  }
}