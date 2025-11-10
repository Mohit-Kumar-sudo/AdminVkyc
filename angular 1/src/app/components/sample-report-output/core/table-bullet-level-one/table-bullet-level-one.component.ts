import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-table-bullet-level-one',
  templateUrl: './table-bullet-level-one.component.html',
  styleUrls: []
})
export class TableBulletLevelOneComponent {
  @Input() dataElement: any;
}
