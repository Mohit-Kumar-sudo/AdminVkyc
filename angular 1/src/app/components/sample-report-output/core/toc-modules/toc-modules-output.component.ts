import { Component, Input, OnInit } from '@angular/core';
import _ from 'lodash';
import { SharedSampleTocService } from 'src/app/services/shared-sample-toc.service';

@Component({
  selector: 'app-toc-modules-output',
  templateUrl: './toc-modules-output.component.html',
  styleUrls: []
})
export class TocModulesOutputComponent implements OnInit {
  tocModules = []
  constructor(private sharedSampleTocService: SharedSampleTocService) { }
  ngOnInit() {
    this.tocModules = this.sharedSampleTocService.currentTocs;
  }
}