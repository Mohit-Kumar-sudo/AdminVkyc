import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-image-output',
  templateUrl: './image-output.component.html',
  styleUrls: []
})
export class ImageOutputComponent {
  @Input() dataElement: any;
}
