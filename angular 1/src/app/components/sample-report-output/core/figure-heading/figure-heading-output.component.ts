import { Component, Input, OnInit } from '@angular/core';
import { SharedSampleTocService } from 'src/app/services/shared-sample-toc.service';

@Component({
  selector: 'app-figure-heading-output',
  templateUrl: './figure-heading-output.component.html',
  styleUrls: []
})
export class FigureHeadingOutputComponent implements OnInit {

  @Input() dataElement: any;
  count:any

  constructor(private sharedSampleTocService: SharedSampleTocService) { }

  ngOnInit() { 
    if (this.dataElement) {
      let listOfFigures = this.sharedSampleTocService.figureList
      this.count = listOfFigures.length + 1
      this.sharedSampleTocService.createFigureList(this.count, this.dataElement)
    }
  }
}