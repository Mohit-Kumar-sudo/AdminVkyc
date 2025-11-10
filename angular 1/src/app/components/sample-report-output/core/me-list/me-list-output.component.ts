import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-me-list-output',
  templateUrl: './me-list-output.component.html',
  styleUrls: []
})
export class MEListOutputComponent {
  @Input() dataElement: any;
}
