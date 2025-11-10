import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-text-output',
  templateUrl: './text-output.component.html',
  styleUrls: []
})
export class TextOutputComponent implements OnInit {

  @Input() dataElement: any;
  heading = ""
  isList = false;

  ngOnInit() {
    if (this.dataElement) {
      this.dataElement = this.dataElement.replace(/<br>/gi, ' ')
      if (this.dataElement.includes("<li>") && this.dataElement.includes("</li>")) {
        this.isList = true;
        this.dataElement = this.dataElement.replace(/<li>/gi, '<li><div><p style="color:#000000;font-family: Roboto Condensed;font-size:10pt;text-align: justify;">')
        this.dataElement = this.dataElement.replace(/<\/li>/gi, '</div></p></li>')
      } else if (this.dataElement.includes("<b>") && this.dataElement.includes("</b>")) {
        this.heading = this.dataElement.replace(/<b>/gi, '')
        this.heading = this.heading.replace(/<\/b>/gi, '')
      }
    }
  }
}
