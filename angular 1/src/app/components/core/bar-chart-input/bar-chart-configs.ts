import {ChartOptions, ChartType} from 'chart.js';
import * as pluginDataLabels from 'chartjs-plugin-datalabels';

export const barChartOptions: ChartOptions = {
  responsive: true,
  scales: {
    xAxes: [{
      stacked: true,
      scaleLabel: {
        display: true,
      }
    }],
    yAxes: [{
      stacked: true,
      scaleLabel: {
        display: true,
      },
      ticks: {
        beginAtZero: true
      }
    }]
  },
  plugins: {
    datalabels: {
      anchor: 'end',
      align: 'end',
    }
  }
};

export function getChartOptions(xLabel: string, yLabel: string) {
  let objCopy: ChartOptions = JSON.parse(JSON.stringify(barChartOptions));
  objCopy.scales.xAxes[0].scaleLabel.labelString = xLabel;
  objCopy.scales.yAxes[0].scaleLabel.labelString = yLabel;
  return objCopy;
}

export const barChartType: ChartType = 'bar';
export const barChartLegend = true;
export const barChartPlugins = [pluginDataLabels];
export const barChartColors = [
  {
    backgroundColor: [
      'rgba(255,0,0,0.5)',
      'rgba(0,255,0,0.5)',
      'rgba(255,0,255,0.5)',
      'rgba(155,191,224,0.5)',
      'rgba(232,160,154,0.5)',
      'rgba(251,226,159,0.51)',
      '#C6D68F',
      '#AADEA7',
      '#64C2A6',
      '#A5C1DC',
      '#E9F6FA',
      '#A9A9A9'
    ]
  },
];
