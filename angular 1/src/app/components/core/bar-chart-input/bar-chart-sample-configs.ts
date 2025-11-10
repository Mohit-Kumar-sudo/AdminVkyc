import { ChartLayoutOptions, ChartLegendOptions, ChartOptions, ChartPluginsOptions, ChartScales, ChartType } from 'chart.js';
import * as pluginDataLabels from 'chartjs-plugin-datalabels';

export const scales : ChartScales= {
      xAxes: [{
      stacked: false,
      scaleLabel: {
        display: true,
      },
      gridLines: {
        display:false
    },
    ticks: {
      fontColor: "#000", // this here
      fontSize: 10,
      fontFamily:'Roboto Condensed'
    }
    }],
    yAxes: [{
      stacked: false,
      scaleLabel: {
        display: true,
        labelString: 'Market Size(USD Mn)'
      },
      gridLines: {
        display:false
    },
      ticks: {
        beginAtZero: true,
        fontColor: '#000',
        fontSize: 10,
        fontFamily:'Roboto Condensed'
      }
    }]
}
export const layout : ChartLayoutOptions = {
  padding: {
      left: 0,
      right: 0,
      top: 30,
      bottom: 0
  }
}
export const plugins : ChartPluginsOptions = {
  datalabels: {
    color: "#000",
    anchor: 'end',
    align: 'end',
    formatter: (value, ctx) => {
      return 'XX';
    },
    font: {
      size: 10,
      family:'Roboto Condensed',
    }
  },paddingBelowLegends: true
}
export const legend : ChartLegendOptions = {
  // display: true,
  position: 'bottom',
  labels: {
    fontColor: "#000",
    // padding:2,
    usePointStyle: true,
    fontSize:10,
    fontFamily:'Roboto Condensed',
  },
}
export const barChartOptions: ChartOptions = {
  responsive: true,
  scales: scales,
  plugins: plugins,
  legend: legend
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