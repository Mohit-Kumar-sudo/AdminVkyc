import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-table-th-output',
  templateUrl: './table-th-output.component.html',
  styleUrls: []
})
export class TableThOutputComponent implements OnInit {
  @Input() dataElement: any;
  ngOnInit() {
    if (typeof this.dataElement == 'string')
      this.dataElement = [{ title: this.dataElement }]
  }
}
