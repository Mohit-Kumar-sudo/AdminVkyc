import {Component, Input, OnInit} from '@angular/core';
import * as pieConfig from '../../core/pie-chart-input/pie-chart-configs';
import * as barConfig from '../../core/bar-chart-input/bar-chart-configs';

@Component({
  selector: 'app-shared-data-element',
  templateUrl: './shared-data-element.component.html',
  styleUrls: ['./shared-data-element.component.scss']
})
export class SharedDataElementComponent implements OnInit {
  @Input()
  inputData: any = [];
  currentReport: any;

  pieChartType = pieConfig.pieChartType;
  pieChartOptions = pieConfig.pieChartOptions;
  pieChartPlugins = pieConfig.pieChartPlugins;
  pieChartColors = pieConfig.pieChartColors;
  pieChartLegend = pieConfig.pieChartLegend;

  barChartType = barConfig.barChartType;
  barChartOptions = barConfig.barChartOptions;
  barChartPlugins = barConfig.barChartPlugins;
  barChartLegend = barConfig.barChartLegend;

  constructor() {
  }

  ngOnInit() {
  }
}
