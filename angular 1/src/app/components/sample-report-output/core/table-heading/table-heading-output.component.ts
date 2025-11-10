import { Component, Input, OnInit } from '@angular/core';
import { SharedSampleTocService } from 'src/app/services/shared-sample-toc.service';

@Component({
  selector: 'app-table-heading-output',
  templateUrl: './table-heading-output.component.html',
  styleUrls: []
})
export class TableHeadingOutputComponent implements OnInit {

  @Input() dataElement: any;
  count:any

  constructor(private sharedSampleTocService: SharedSampleTocService) { }

  ngOnInit() {
    if (this.dataElement) {
      let listOfTables = this.sharedSampleTocService.tableList
      this.count = listOfTables.length + 1
      this.sharedSampleTocService.createTableList(this.count, this.dataElement)
    }
  }
}
