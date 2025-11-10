import { Component, OnInit, Input } from '@angular/core';
import { TableInputColumnMetaData } from '../table-input.component';

@Component({
  selector: 'app-editable-grid',
  templateUrl: './editable-grid.component.html',
  styleUrls: ['./editable-grid.component.scss']
})
export class EditableGridComponent implements OnInit {

  @Input()
  columnsMetaData: TableInputColumnMetaData[];

  @Input()
  dataStore: any[] = [];

  constructor() { }

  ngOnInit() {
  }

  get displayedColumns() {
    return this.columnsMetaData.map(item => item.name);
  }
}
