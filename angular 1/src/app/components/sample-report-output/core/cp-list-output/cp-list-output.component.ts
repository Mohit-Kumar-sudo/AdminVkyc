import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-cp-list-output',
  templateUrl: './cp-list-output.component.html',
  styleUrls: []
})
export class CpListOutputComponent {
  @Input() dataElement: any;
}
