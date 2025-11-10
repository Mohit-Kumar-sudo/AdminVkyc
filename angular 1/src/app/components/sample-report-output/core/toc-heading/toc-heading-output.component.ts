import { Component, Input, OnInit } from '@angular/core';
import _ from 'lodash';

@Component({
  selector: 'app-toc-heading-output',
  templateUrl: './toc-heading-output.component.html',
  styleUrls: []
})
export class TocHeadingOutputComponent implements OnInit {

  @Input() dataElement: any;
  @Input() level: any;
  @Input() counter: any;

  ngOnInit() {
    this.dataElement = this.toTitleCase(this.dataElement);
  }
  toTitleCase(str) {
    return str.replace(/\w\S*/g, function (txt) {
      return txt.charAt(0).toUpperCase() + txt.substr(1);
    });
  }
}