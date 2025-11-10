import { ChartLayoutOptions, ChartLegendOptions, ChartOptions, ChartPluginsOptions, ChartType } from 'chart.js';
import * as pluginDataLabels from 'chartjs-plugin-datalabels';

export const plugins: ChartPluginsOptions = {
  datalabels: {
    color:'#fff',
    formatter: (value, ctx) => {
      return 'XX%';
    },
    font: {
      size: 10,
      family:'Roboto Condensed'
    }
  }
}
export const legend: ChartLegendOptions = {
  position: 'right',
  labels: {
    fontColor: "#000",
    fontFamily: 'Roboto Condensed',
    fontSize: 12,
    usePointStyle: true
  }
}

export const pieChartSampleOptions: ChartOptions = {
  cutoutPercentage: 80,
  responsive: false,
  legend: legend,
  plugins: plugins,
};
export const layout : ChartLayoutOptions = {
  padding: {
      left: 0,
      right: 0,
      top: 20,
      bottom: 20
  }
}

export const pieChartSampleType: ChartType = 'doughnut';
export const pieChartSampleLegend = true;
export const pieChartSamplePlugins = [pluginDataLabels];
export const pieChartSampleColors = [
  {
    backgroundColor: [
      'rgb(226,83,101)',
      'rgb(21,117, 168)',
      'rgb(226, 175, 50)',
      'rgb(37,169, 130)',
      'rgb(3, 191, 193)',
      'rgb(113,32,123)',
      'rgb(159,27,43)'
    ]
  },
];
