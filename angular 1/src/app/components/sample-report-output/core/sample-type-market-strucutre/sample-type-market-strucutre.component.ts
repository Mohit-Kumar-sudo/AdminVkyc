import { AfterViewInit, Component, ElementRef, Input, OnInit, TemplateRef, ViewChild } from '@angular/core';
import * as _ from 'lodash';
import * as html2canvas from 'html2canvas';
@Component({
  selector: 'app-sample-type-market-strucutre',
  templateUrl: './sample-type-market-strucutre.component.html',
  styleUrls: ['./sample-type-market-strucutre.component.scss']
})
export class SampleTypeMarketStrucutreComponent implements OnInit, AfterViewInit {
  @Input() dataElement: any;
  @ViewChild('marketStructure') marketStructure: ElementRef;
  @ViewChild('marketStructureImg') marketStructureImg: ElementRef;
  parents: any = [];
  regions: any = [];
  hide = true;

  ngOnInit() {
    if (this.dataElement) {
      this.generateMarketStructure()
    }
  }

  generateMarketStructure() {
    if (this.dataElement && this.dataElement.me) {
      this.parents = _.filter(this.dataElement.me.segment, ['pid', '1']);
      if (this.parents.length) {
        this.parents.forEach(d => {
          d.childrens = _.filter(this.dataElement.me.segment, ['pid', d.id])
          if (d.childrens && d.childrens.length) {
            d.childrens.forEach(dd => {
              dd.childrens = _.filter(this.dataElement.me.segment, ['pid', dd.id])
              dd.childrens.forEach(ddd => {
                ddd.name = ddd.name.split(dd.name + "_").join('');
              })
            })
          }
        })
      }
      this.regions = this.dataElement.me.geo_segment;
    }
  }
  ngAfterViewInit() {
    if (this.marketStructure.nativeElement) {
      this.generateImage();
    }
  }
  generateImage() {
    // @ts-ignore
    html2canvas(this.marketStructure.nativeElement).then(canvas => {
      this.marketStructureImg.nativeElement.src = canvas.toDataURL();
      this.hide = false;
    });
  }
}
