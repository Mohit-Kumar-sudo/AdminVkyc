import { Component, OnInit } from '@angular/core';
import { MasterReportData, RegionCountry, Country } from 'src/app/models/me-models';
import { Location } from '@angular/common';
import { LocalStorageService } from 'src/app/services/localsotrage.service';
import { ConstantKeys, MainSectionConstants } from 'src/app/constants/mfr.constants';
import { ReportMetadataService } from 'src/app/services/report-metadata.service';
import { Router } from '@angular/router';
import { GeoDataService } from 'src/app/services/geo-data.service';
import { MasterReportSecondarySection } from 'src/app/models/secondary-research-models';
import { MatSnackBar } from '@angular/material';
import { ReportService } from 'src/app/services/report.service';

export interface RegLandScapeRegCtryInfo {
  name: string;
  index_id: string;
}

@Component({
  selector: 'app-regulatory-landscape-new',
  templateUrl: './regulatory-landscape-new.component.html',
  styleUrls: ['./regulatory-landscape-new.component.scss']
})
export class RegulatoryLandscapeNewComponent implements OnInit {

  currentReport: MasterReportData = null;

  regionData: RegionCountry[];
  countryData: Country[] = [];

  regionCoutryList: RegLandScapeRegCtryInfo[] = [];

  regionCoutryInfo = {
    region: 'Select region',
    country: 'Select country'
  }

  constructor(private reportMetadataService: ReportMetadataService,
    private reportService: ReportService,
    private geoDataService: GeoDataService,
    private localStorageService: LocalStorageService,
    private router: Router,
    private _location: Location,
    private _snackBar: MatSnackBar) { }

  ngOnInit() {
    this.currentReport = this.localStorageService.get(ConstantKeys.CURRENT_REPORT);

    /* let mainSection = this.reportMetadataService.getMainSectionByKey(MainSectionConstants.REGULATORY_LANDSCAPE)
    this.localStorageService.set(ConstantKeys.CURRENT_SECTION, {
      main_section_id: mainSection.section_id,
      section_id: mainSection.section_id,
      section_name: mainSection.section_name,
      is_main_section_only: mainSection.is_main_section_only
    }) */

    this.geoDataService.getRegions()
      .subscribe(regionData => {
        this.regionData = regionData;
      })
  }

  onRegionSelection(regionId) {
    let regionObj = this.regionData.filter(ele => ele.id === regionId)[0];
    this.countryData = regionObj.countries;
  }
  getRegion(id) {
    return this.regionData.filter(ele => ele.id === id).map(ele => ele.region)[0];
  }
  getCountry(id) {
    return this.countryData.filter(ele => ele.id === id).map(ele => ele.name)[0];
  }

  onRegionContrySelection(regCountry: RegLandScapeRegCtryInfo) {
    let currentSection = this.localStorageService.get(ConstantKeys.CURRENT_SECTION)
    currentSection.actual_section_id = '1';
    currentSection.section_id = `${currentSection.main_section_id}.1.${regCountry.index_id}`;

    currentSection.section_pid = `${currentSection.main_section_id}`;
    currentSection.sub_section_name = regCountry.name;

    this.localStorageService.set(ConstantKeys.CURRENT_SECTION, currentSection);
    this.router.navigateByUrl(`/secondary-input`);
  }

  onKeyRegulationSelection() {
    let currentSection = this.localStorageService.get(ConstantKeys.CURRENT_SECTION);
    currentSection.actual_section_id = '2';
    currentSection.section_id = `${currentSection.main_section_id}.2`;
    currentSection.section_pid = `${currentSection.main_section_id}`;
    currentSection.sub_section_name = 'Key news related to regulations';
    this.localStorageService.set(ConstantKeys.CURRENT_SECTION, currentSection);
    this.router.navigateByUrl(`/secondary-input`);
  }

  addDetails() {
    let newSection: RegLandScapeRegCtryInfo = {
      name: `${this.getRegion(this.regionCoutryInfo.region)}-${this.getCountry(this.regionCoutryInfo.country)}`,
      index_id: `${this.regionCoutryList.length + 1}`
    }
    this.regionCoutryList.push(newSection);
    this.regionCoutryInfo = {
      region: 'Select region',
      country: 'Select country'
    }

    this.localStorageService.set(ConstantKeys.REG_CTRY_SECTION_REG_LANDSCPE_INFO, this.regionCoutryList);
  }

  toPreviousPage() {
    this._location.back();
  }

  removeElement(data){
    this.regionCoutryList = this.regionCoutryList.filter(ele=>ele.index_id !== data.index_id);
  }
  saveMetaInfo() {
    let currentSection: MasterReportSecondarySection = this.localStorageService.get(ConstantKeys.CURRENT_SECTION);
    let metaInfo = {
      type: `REGULATORY_LANDSCAPE`,
      data: this.regionCoutryList
    }
    currentSection.content = [];
    currentSection.meta = metaInfo;

    this.reportService.saveTocInfoByReportSection(this.currentReport, currentSection)
      .subscribe(data => {
        this._snackBar.open('Selected Data saved to platform', 'Close', {
          duration: 2000,
        });
      }, (err) => {
        // ENHANCE: Read ERR & show data
        this._snackBar.open('Error occured while submitting to platform', 'Close', {
          duration: 2000,
        });
      });

  }

}
