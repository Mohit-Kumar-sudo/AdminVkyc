import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { ChartOptions } from 'chart.js';
import * as pieConfig from '../../../core/pie-chart-input/pie-chart-sample-configs';
import _ from 'lodash';

@Component({
  selector: 'app-rm-pie-chart-output',
  templateUrl: './rm-pie-chart-output.component.html',
  styleUrls: []
})
export class RmPieChartOutputComponent implements OnInit {

  pieChartType = pieConfig.pieChartSampleType;
  // pieChartOptions: ChartOptions;
  pieChartOptions = pieConfig.pieChartSampleOptions;
  pieChartPlugins = pieConfig.pieChartSamplePlugins;
  pieChartColors = pieConfig.pieChartSampleColors;
  pieChartLegend = pieConfig.pieChartSampleLegend;
  pieLegend = pieConfig.legend;
  piePlugin = pieConfig.plugins;
  pieLayout = pieConfig.layout;
  url = ""

  @ViewChild('canvas') canvas: ElementRef;
  @ViewChild('img') img: ElementRef;
  @ViewChild('chartContainer') chartContainer: ElementRef;
  @Input() dataElement: any;

  ngOnInit() {
    this.pieChartOptions = {
      responsive: true,
      legend: this.pieLegend,
      plugins: this.piePlugin,
      layout: this.pieLayout,
      elements: {
        arc: {
          borderWidth: 0
        }
      },
      animation: {
        onComplete: (e) => this.onChartAnimationComplete(e)
      }
    }

  }
  onChartAnimationComplete(e) {
    var ctx = this.canvas.nativeElement.getContext("2d");
    var width = this.canvas.nativeElement.width,
      height = this.canvas.nativeElement.height;

    var fontSize = "10pt";
    ctx.font = fontSize + "Roboto Condensed";
    ctx.textBaseline = "middle";
    ctx.fillStyle = "#000";

    var text = _.startCase(this.dataElement.data.metaDataValue.title),
      textX = Math.round((width - ctx.measureText(text).width) / 2) - 40,
      textY = height - 10;

    ctx.fillText(text, textX, textY);
    ctx.restore();
    this.img.nativeElement.src = this.canvas.nativeElement.toDataURL()
    this.canvas.nativeElement.hidden = true;
  }
}
