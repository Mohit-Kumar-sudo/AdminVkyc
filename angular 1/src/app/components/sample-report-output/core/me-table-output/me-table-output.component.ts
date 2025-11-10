import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-me-table-output',
  templateUrl: './me-table-output.component.html',
  styleUrls: []
})
export class METableOutputComponent {
  @Input() dataElement: any;
}
