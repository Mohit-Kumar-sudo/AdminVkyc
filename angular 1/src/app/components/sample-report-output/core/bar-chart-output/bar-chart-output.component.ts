import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { ChartOptions } from 'chart.js';
import * as barConfig from '../../../core/bar-chart-input/bar-chart-sample-configs';

@Component({
  selector: 'app-bar-chart-output',
  templateUrl: './bar-chart-output.component.html',
  styleUrls: []
})
export class BarChartOutputComponent implements OnInit {

  barChartType = barConfig.barChartType;
  barChartOptions: ChartOptions
  barChartColors = barConfig.barChartColors;
  barChartPlugins = barConfig.barChartPlugins;
  barLegend = barConfig.legend;
  barScales = barConfig.scales;
  barPlugins = barConfig.plugins;
  barLayout = barConfig.layout;

  @ViewChild('canvas') canvas: ElementRef;
  @ViewChild('img') img: ElementRef;
  @Input() dataElement: any;

  ngOnInit() {
    this.dataElement.data.chartData.forEach((e, i) => {
      e.backgroundColor = this.barChartColors[0].backgroundColor[i]
      e.borderWidth = 0
    });
    this.barChartOptions = {
      responsive: true,
      scales: this.barScales,
      plugins: this.barPlugins,
      legend: this.barLegend,
      layout: this.barLayout,
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
