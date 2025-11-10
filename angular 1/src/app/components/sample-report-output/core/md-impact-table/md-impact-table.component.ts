import { Component, Input, ViewChild, ElementRef } from '@angular/core';

@Component({
  selector: 'app-md-impact-table',
  templateUrl: './md-impact-table.component.html',
  styleUrls: []
})
export class MDImpactTableComponent {

  @Input() dataElement: any;
  @ViewChild('myTable') myTable: ElementRef;
  @ViewChild('img') img: ElementRef;

  ngAfterViewInit() {
    this.generateImage();
  }
  generateImage() {
    // @ts-ignore
    html2canvas(this.myTable.nativeElement).then(canvas => {
      this.img.nativeElement.src = canvas.toDataURL();
      this.myTable.nativeElement.remove();
    });
  }
}
