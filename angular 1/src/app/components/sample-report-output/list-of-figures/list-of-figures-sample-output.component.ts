import { Component, OnInit } from '@angular/core'
import * as _ from 'lodash';
import { SharedSampleTocService } from 'src/app/services/shared-sample-toc.service';

@Component({
  selector: 'app-list-of-figures-sample-output',
  templateUrl: './list-of-figures-sample-output.component.html',
  styleUrls: []
})
export class ListOfFiguresSampleOutputComponent implements OnInit {
  heading = "List of Figures"
  constructor(private sharedSampleTocService: SharedSampleTocService) { }
  listofFigures = []
  ngOnInit() {
    this.listofFigures = this.sharedSampleTocService.figureList
  }
}