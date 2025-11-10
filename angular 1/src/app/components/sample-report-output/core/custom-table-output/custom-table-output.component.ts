import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-custom-table-output',
  templateUrl: './custom-table-output.component.html',
  styleUrls: []
})
export class CustomTableOutputComponent {
  @Input() dataElement: any;
}
