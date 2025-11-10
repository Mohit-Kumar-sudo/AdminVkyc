import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-table-output',
  templateUrl: './table-output.component.html',
  styleUrls: []
})
export class TableOutputComponent {
  @Input() dataElement: any;
}
