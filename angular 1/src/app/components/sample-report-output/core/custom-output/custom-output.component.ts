import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-custom-output',
  templateUrl: './custom-output.component.html',
  styleUrls: []
})
export class CustomOutputComponent {
  @Input() dataElement: any;
}