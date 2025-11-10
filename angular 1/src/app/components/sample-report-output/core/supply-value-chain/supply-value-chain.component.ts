import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import * as mermaid from 'mermaid';
import * as html2canvas from 'html2canvas';
@Component({
  selector: 'app-supply-value-chain',
  templateUrl: './supply-value-chain.component.html',
  styleUrls: []
})
export class SupplyValueChainComponent implements OnInit {
  @ViewChild('mermaidId') mermaidId: ElementRef;
  @ViewChild('mermaidImg') mermaidImg: ElementRef;
  @Input() dataElement: any;
  chartText: string;

  ngOnInit() {
    if(this.dataElement){      
      this.generateChart();
    }
  }

  generateChart() {
    this.chartText = '';
    let text = 'graph LR;';
    for (let i = 0; i < this.dataElement.paths.length; i++) {
      text += this.dataElement.paths[i].from.order_id + '[' + this.dataElement.paths[i].from.title + '] -->'
        + this.dataElement.paths[i].to.order_id + '[' + this.dataElement.paths[i].to.title + '];';
    }
    this.chartText = text;
    if (!this.chartText) {
      this.chartText = 'graph TD;';
    }

    if (document.getElementById('graphDiv')) {
      document.getElementById('graphDiv').remove();
    }
    const element: any = this.mermaidId.nativeElement;
    mermaid.render('graphDiv', this.chartText, (svgCode, bindFunctions) => {
      element.innerHTML = svgCode;
      document.getElementById('graphDiv').style.maxWidth = "800";
      document.getElementById('graphDiv').style.width = "600";
      document.getElementById('graphDiv').style.maxHeight = "180";
      if (document.getElementById('graphDiv')) {
        this.generateImage();
      }
    });
  }
  generateImage() {
    // @ts-ignore
    html2canvas(this.mermaidId.nativeElement).then(canvas => {
      this.mermaidImg.nativeElement.src = canvas.toDataURL();
      this.mermaidId.nativeElement.remove();
    });
  }
}
