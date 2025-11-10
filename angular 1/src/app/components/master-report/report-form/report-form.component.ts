import {Component, OnInit} from '@angular/core';
import {FormGroup, FormControl, Validators} from '@angular/forms';
import {Router} from '@angular/router';
import {ReportService} from 'src/app/services/report.service';
import {VerticalData, TocSectionData, MasterReportData, TocSectionDataWrapper} from 'src/app/models/me-models';
import {ReportMetadataService} from 'src/app/services/report-metadata.service';
import {ConstantKeys} from '../../../constants/mfr.constants';
import {MatSnackBar} from '@angular/material';
import {LocalStorageService} from 'src/app/services/localsotrage.service';
import {Ng4LoadingSpinnerService} from 'ng4-loading-spinner';

@Component({
  selector: 'app-report-form',
  templateUrl: './report-form.component.html',
  styleUrls: ['./report-form.component.scss']
})
export class ReportFormComponent implements OnInit {

  reportForm: FormGroup;

  verticalList: VerticalData[] = [];
  tocModuleList: TocSectionData[] = [];
  tocModuleAllDataList: TocSectionDataWrapper[] = [];
  minYear = '1990';
  currentYear = '';
  maxYear = '';
  title_prefix = ['Global','None']
  constructor(
    private reportMetaDataService: ReportMetadataService,
    private reportService: ReportService,
    private localStorageService: LocalStorageService,
    private spinner: Ng4LoadingSpinnerService,
    private router: Router,
    private _snackBar: MatSnackBar) {
    const d = new Date();
    const currentY = d.getFullYear();
    const maxY = currentY + 10;
    this.currentYear = currentY + '';
    this.maxYear = maxY + '';
  }

  ngOnInit() {
    this.spinner.show();
    // Setting up dropdowns
    this.reportMetaDataService.getVerticalList()
      .subscribe(dataList => {
        this.verticalList = dataList;
        this.reportMetaDataService.getTocSectionList()
          .subscribe(dataListItem => {
            this.tocModuleAllDataList = dataListItem;
            if (dataListItem.length > 0) {
              this.tocModuleList = dataListItem[0].toc;
            }
            // this.onChange('tech');
            this.spinner.hide();
          });
      });

    this.reportForm = new FormGroup({
      title: new FormControl('', [Validators.required]),
      category: new FormControl('', [Validators.required]),
      vertical: new FormControl(''),
      newVertical: new FormControl(''),
      toc: new FormControl(''),
      fromYear: new FormControl('', [Validators.required]),
      toYear: new FormControl('', [Validators.required]),
      baseYear: new FormControl('', [Validators.required]),
      titlePrefix:new FormControl('', [Validators.required]),
    });
  }

  get title() {
    return this.reportForm.get('title');
  }

  get category() {
    return this.reportForm.get('category');
  }

  get vertical() {
    return this.reportForm.get('vertical');
  }

  get toc() {
    return this.reportForm.get('toc');
  }

  get newVertical() {
    return this.reportForm.get('newVertical');
  }

  get fromYear() {
    return this.reportForm.get('fromYear');
  }

  get toYear() {
    return this.reportForm.get('toYear');
  }

  get baseYear() {
    return this.reportForm.get('baseYear');
  }

  get titlePrefix() {
    return this.reportForm.get('titlePrefix');
  }
  /* onChange(selectedCategoryValue) {
      let tocdefaultModules = this.tocModuleAllDataList.filter((ele) => {
          if (ele.hasOwnProperty("category")
              && ele["category"].toLowerCase() == selectedCategoryValue.toLowerCase()) {
              return true;
          }
      });
      if (tocdefaultModules) {
          this.tocModuleList = tocdefaultModules[0].toc;
      }
  } */

  onSubmit() {
    this.spinner.show();
    let selectedTocIds = this.toc.value;
    let selectedTocList: TocSectionData[] = null;
    if (this.vertical.value !== '') {
      selectedTocList = this.vertical.value['toc'];
    } else {
      selectedTocList = this.tocModuleList.filter(tocEle => selectedTocIds.includes(tocEle._id));
    }

    let masterReportData: MasterReportData = {
      title: this.title.value,
      category: this.category.value,
      vertical: this.vertical.value['name'] ? this.vertical.value['name'] : this.newVertical.value,
      me: {
        start_year: this.fromYear.value.getFullYear(),
        end_year: this.toYear.value.getFullYear(),
        base_year: this.baseYear.value.getFullYear(),
      },
      tocList: selectedTocList,
      title_prefix:this.titlePrefix.value == 'None'?null:this.titlePrefix.value
    };

    // localStorage.setItem(ConstantKeys.REPORT_NAME, masterReportData.title);

    this.reportService.createBasicReport(masterReportData).subscribe(
      resp => {
        this._snackBar.open('Report generated successfully', 'Close', {
          duration: 2000,
        });
        this.localStorageService.set(ConstantKeys.CURRENT_REPORT, resp);
        this.spinner.hide();
        this.router.navigateByUrl(`/me-report/${resp._id}/global-info`);
      },
      err => {
        // ENHANCE: Read ERR & show data
        this._snackBar.open('Error occured while saving Report', 'Close', {
          duration: 2000,
        });
        this.spinner.hide();
      }
    );
  }

}
