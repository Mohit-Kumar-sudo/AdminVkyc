import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-non-secondary-text-output',
  templateUrl: './non-secondary-text-output.component.html',
  styleUrls: []
})
export class NonSecondaryTextOutputComponent {
  @Input() dataElement: any;
}
