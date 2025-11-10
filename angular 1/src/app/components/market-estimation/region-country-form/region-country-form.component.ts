import {Component, OnInit} from '@angular/core';
import {FormControl, FormGroup, Validators, FormBuilder, FormArray} from '@angular/forms';
import {RegionCountry, MasterReportData} from 'src/app/models/me-models';
import {ActivatedRoute, Router} from '@angular/router';
import {Location} from '@angular/common';
import {GeoDataService} from 'src/app/services/geo-data.service';
import {ConstantKeys} from 'src/app/constants/mfr.constants';
import {LocalStorageService} from 'src/app/services/localsotrage.service';
import {ReportService} from 'src/app/services/report.service';
import * as _ from 'lodash';
import {SegmentService} from 'src/app/services/segment.service';
import {MatSnackBar} from '@angular/material';
import {NgxSpinnerService} from 'ngx-spinner';

@Component({
  selector: 'app-region-country-form',
  templateUrl: './region-country-form.component.html',
  styleUrls: ['./region-country-form.component.scss']
})
export class RegionCountryFormComponent implements OnInit {

  currentReport: MasterReportData = null;
  regions: any = [];
  regionData: RegionCountry[];
  regionForm: FormGroup;
  showCoutryEle = false;
  allRegions: any = [];

  selectedDataCountryMap: RegionCountry[] = [];

  dataToBeSaved: RegionCountry[] = [];

  constructor(private localStorageService: LocalStorageService,
              private geoDataService: GeoDataService,
              private segmentService: SegmentService,
              private _formBuilder: FormBuilder,
              private router: Router,
              private route: ActivatedRoute,
              private spinner: NgxSpinnerService,
              private reportService: ReportService,
              private _location: Location,
              private _snackBar: MatSnackBar) {
  }

  ngOnInit() {
    this.spinner.show();
    this.currentReport = this.localStorageService.get(ConstantKeys.CURRENT_REPORT);
    this.regionForm = this._formBuilder.group({
      regions: new FormControl([], [Validators.required]),
    });
    this.geoDataService.getRegions()
      .subscribe(regionData => {
        this.regionData = regionData;
        this.getFormInfo();
      });
  }

  getFormInfo() {
    this.segmentService.getReportInfoByKey(this.currentReport._id, 'me,title').subscribe(
      data => {
        this.getFormInfoSuccess(data);
      },
      error => {
        this.spinner.hide();
      }
    );
  }

  getFormInfoSuccess(data) {
    this.regionData.forEach(item => {
      item.countriesValues = [];
    });
    if (data && data.me && data.me.geo_segment && data.me.geo_segment) {
      let regData = data.me.geo_segment;
      if (regData.length) {
        this.regions = _.map(regData, 'region');
        this.allRegions = [... this.regions];        
        if (regData.length) {
          this.showCoutryEle = true;
          this.onRegionSubmit();
          regData.forEach(reg => {
            this.selectedDataCountryMap.forEach(item => {
              if (reg.region == item.region) {
                item.countriesValues = reg.countries;
              }
            });
          });
        }
      }
    }
    this.spinner.hide();
  }

  changeRegionSelected(event) {
    let eventVal = event.value;
    if (eventVal.length) {
      if (eventVal.length > this.regions.length) {
        eventVal.forEach(element => {
          if (!this.regions.includes(element)) {
            this.regions.push(element);
          }
        });
      } else if (eventVal.length < this.regions.length) {
        this.regions.forEach(element => {
          if (!eventVal.includes(element)) {
            this.regions = this.regions.filter(item => item != element);
          }
        });
      }
    } else {
      this.regions = [];
    }
    this.onRegionSubmit();
  }
  onRegionSubmit() {
    this.selectedDataCountryMap = [];
    if (this.regions.length) {
      this.regions.forEach(item => {
        this.regionData.forEach(item1 => {
          if (item1.region == item && !this.selectedDataCountryMap.includes(item1)) {
            this.selectedDataCountryMap.push(item1);
          }
        });
      });
      this.regions.forEach(item => {
        this.regionData.forEach(item1 => {
          if (item1.countriesValues && item1.countriesValues.length > 0) {
            if (!this.selectedDataCountryMap.includes(item1)) {
              item1.countriesValues = [];
            }
          }
        })
      });
      this.showCoutryEle = true;
    } else {
      this.regionData.forEach(e => {
        e.countriesValues = [];
      })
    }
  }

  countrySelected(previousVal, newVal) {
    if (newVal.length > 0) {
      if (previousVal.countriesValues.length > newVal.length) {
        previousVal.countriesValues.forEach(element => {
          if (!newVal.includes(element.name)) {
            previousVal.countriesValues = previousVal.countriesValues.filter(item => item.name !== element.name);
          }
        });
      } else if (previousVal.countriesValues.length < newVal.length) {

        let allElements = previousVal.countriesValues.map(item => item.name);

        newVal.forEach(element => {
          if (!allElements.includes(element)) {
            let country = previousVal.countries.filter(country => country.name === element);
            if (country && country.length) {
              previousVal.countriesValues.push(country[0]);
            }
          }
        });
      }
    } else {
      previousVal.countriesValues = []
    }
  }

  disableSaveButton(){
    let disable = true;
    this.selectedDataCountryMap.forEach(item => {
      if (item.countriesValues && item.countriesValues.length) {
        disable = false;
        return disable;
      }
    });
    return disable;
  }

  checkAllFields() {

    let disable = [];
    this.selectedDataCountryMap.forEach(item => {
      if (item.countriesValues && !item.countriesValues.length) {
        disable.push(true);
      }
    });
    if(disable && disable.length){
      return true;
    }else{
      return false;
    }


  }

  saveData() {
    if(!this.checkAllFields()){
      this.spinner.show();
      this.dataToBeSaved = this.selectedDataCountryMap;
      this.dataToBeSaved.forEach(item => {
        item.countries = item.countriesValues;
        delete item.countriesValues;
      });
      this.segmentService.saveGeoInfo(this.currentReport._id, this.selectedDataCountryMap).subscribe(
        resp => {
          this._snackBar.open('Segment Geo Information Saved successfully', 'Close', {
            duration: 2000,
          });
          this.spinner.hide();
          this.router.navigateByUrl(`/me-report/${this.currentReport._id}/global-info/market-estimation/segment-creation`);
        },
        err => {
          // ENHANCE: Read ERR & show data
          this.spinner.hide();
          this._snackBar.open('Error occured while saving Segment Geo information', 'Close', {
            duration: 2000,
          });
        }
      );
    }else{
      this._snackBar.open("Regions can't be blank", 'Close', {
        duration: 2000,
      });
    }
  }

  toPreviousPage() {
    this._location.back();
  }
}