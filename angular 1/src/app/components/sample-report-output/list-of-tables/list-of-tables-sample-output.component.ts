import { Component, OnInit } from '@angular/core'
import * as _ from 'lodash';
import { SharedSampleTocService } from 'src/app/services/shared-sample-toc.service';

@Component({
  selector: 'app-list-of-tables-sample-output',
  templateUrl: './list-of-tables-sample-output.component.html',
  styleUrls: []
})
export class ListOfTablesSampleOutputComponent implements OnInit {
  heading = "List of Tables"
  constructor(private sharedSampleTocService: SharedSampleTocService) { }
  listofTables = []
  ngOnInit() {
    this.listofTables = this.sharedSampleTocService.tableList
  }
}