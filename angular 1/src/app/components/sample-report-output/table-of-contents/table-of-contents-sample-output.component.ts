import { Component, OnInit } from '@angular/core'
import * as _ from 'lodash';
import { SharedSampleTocService } from 'src/app/services/shared-sample-toc.service';

@Component({
  selector: 'app-table-of-contents-sample-output',
  templateUrl: './table-of-contents-sample-output.component.html',
  styleUrls: []
})
export class TableOfContentsSampleOutputComponent implements OnInit {
  heading = "Table of Contents"
  constructor(private sharedSampleTocService: SharedSampleTocService) { }
  tocContent = []
  ngOnInit() {
    this.tocContent = this.sharedSampleTocService.toc
  }
}