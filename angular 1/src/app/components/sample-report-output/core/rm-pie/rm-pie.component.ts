import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { ConstantKeys } from 'src/app/constants/mfr.constants';
import { LocalStorageService } from 'src/app/services/localsotrage.service';

@Component({
  selector: 'app-rm-pie',
  templateUrl: './rm-pie.component.html',
  styleUrls: []
})
export class RmPieComponent implements OnInit {
  @Input() dataElement: any;
  @ViewChild('rmPies') rmPies: ElementRef;
  @ViewChild('rmPiesImage') rmPiesImage: ElementRef;
  hidermPies: any;
  constructor(
    private localStorageService: LocalStorageService
  ) { }

  ngOnInit() {
    this.hidermPies = false;
    const currentReport = this.localStorageService.get(ConstantKeys.CURRENT_REPORT);
    if (this.dataElement) {
      this.dataElement.data.forEach(d => {
        d.data.metaDataValue.title = d.data.metaDataValue.title.toLowerCase().split(currentReport.title.trim().toLowerCase() + ",").join('');
      })
      setTimeout(()=>{
        this.generateImage();
      },3000)
    }
  }

  generateImage() {
    // @ts-ignore
    html2canvas(this.rmPies.nativeElement).then(canvas => {
      this.rmPiesImage.nativeElement.src = canvas.toDataURL('image/png',1.0);
      this.hidermPies = true;
    });
  }
}
