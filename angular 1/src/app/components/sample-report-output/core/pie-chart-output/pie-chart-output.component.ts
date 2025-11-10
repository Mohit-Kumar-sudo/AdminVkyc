import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { ChartOptions } from 'chart.js';
import * as pieConfig from '../../../core/pie-chart-input/pie-chart-sample-configs';

@Component({
  selector: 'app-pie-chart-output',
  templateUrl: './pie-chart-output.component.html',
  styleUrls: []
})
export class PieChartOutputComponent implements OnInit {

  pieChartType = pieConfig.pieChartSampleType;
  pieChartOptions: ChartOptions;
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
    let url = this.canvas.nativeElement.toDataURL()
    this.img.nativeElement.src = url
    this.canvas.nativeElement.hidden = true;
  }
}
