import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-sub-heading-output',
  templateUrl: './sub-heading-output.component.html',
  styleUrls: []
})
export class SubHeadingOutputComponent {
  @Input() dataElement: any;
}
