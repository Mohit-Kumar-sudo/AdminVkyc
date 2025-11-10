import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-heading-output',
  templateUrl: './heading-output.component.html',
  styleUrls: []
})
export class HeadingOutputComponent {
  @Input() dataElement: any;
  @Input() counter: any;
  @Input() level: any;
}
