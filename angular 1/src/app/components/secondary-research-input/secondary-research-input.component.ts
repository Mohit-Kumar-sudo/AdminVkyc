import { Component, OnInit } from '@angular/core';
import { MasterReportData } from 'src/app/models/me-models';
import { LocalStorageService } from 'src/app/services/localsotrage.service';
import { ConstantKeys } from 'src/app/constants/mfr.constants';

@Component({
  selector: 'app-secondary-research-input',
  templateUrl: './secondary-research-input.component.html',
  styleUrls: ['./secondary-research-input.component.scss']
})
export class SecondaryResearchInputComponent implements OnInit {

  currentReport: MasterReportData = null;

  constructor(private localStorageService: LocalStorageService,) { }

  ngOnInit() {
    this.currentReport = this.localStorageService.get(ConstantKeys.CURRENT_REPORT);
  }

}
