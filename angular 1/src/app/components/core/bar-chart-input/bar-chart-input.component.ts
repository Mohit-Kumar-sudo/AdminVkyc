import {Component, Inject, OnInit} from '@angular/core';
import {FormGroup, FormBuilder, FormControl, Validators, FormArray} from '@angular/forms';
import {TableInputColumnMetaData} from '../table-input/table-input.component';

import {barChartOptions, barChartType, barChartLegend, barChartPlugins, getChartOptions} from './bar-chart-configs';
import {ChartDataSets} from 'chart.js';
import {Label} from 'ng2-charts';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material';

@Component({
  selector: 'app-bar-chart-input',
  templateUrl: './bar-chart-input.component.html',
  styleUrls: ['./bar-chart-input.component.scss']
})
export class BarChartInputComponent implements OnInit {

  barChartInfoForm: FormGroup;
  isEdit: boolean;

  constructor(private _formBuilder: FormBuilder,
              public dialogRef: MatDialogRef<BarChartInputComponent>, @Inject(MAT_DIALOG_DATA) public data: any) {
  }

  removeBarHeader(i) {
    this.stacks.removeAt(i);
  }

  ngOnInit() {
    this.barChartInfoForm = new FormGroup({
      title: new FormControl('', [Validators.required]),
      source: new FormControl('', [Validators.required]),
      labelX: new FormControl('', [Validators.required]),
      labelY: new FormControl('', [Validators.required]),
      bars: new FormControl('', [Validators.required]),
      stacks: this._formBuilder.array([this._formBuilder.group({header: ''})])
    });
    if (this.data) {
      this.barChartInfoForm.controls.title.setValue(this.data.metaDataValue.title);
      this.barChartInfoForm.controls.source.setValue(this.data.metaDataValue.source);
      this.barChartInfoForm.controls.labelX.setValue(this.data.metaDataValue.labelX);
      this.barChartInfoForm.controls.labelY.setValue(this.data.metaDataValue.labelY);
      this.barChartInfoForm.controls.bars.setValue(this.data.dataStore.length);
      this.barChartInfoForm.setControl('stacks', this.setStackData(this.data.chartData));
      this.isEdit = true;
      this.onSubmitBarChartInfo();
      this.rederBarChart();
    }
  }

  setStackData(stacks): FormArray {
    const formArray = new FormArray([]);
    stacks.forEach(item => {
      formArray.push(this._formBuilder.group({
        header: item.label
      }));
    });
    return formArray;
  }

  get title() {
    return this.barChartInfoForm.get('title');
  }

  get source() {
    return this.barChartInfoForm.get('source');
  }

  get labelX() {
    return this.barChartInfoForm.get('labelX');
  }

  get labelY() {
    return this.barChartInfoForm.get('labelY');
  }

  get bars() {
    return this.barChartInfoForm.get('bars');
  }

  get stacks() {
    return this.barChartInfoForm.get('stacks') as FormArray;
  }

  addColumn(): void {
    this.stacks.push(this._formBuilder.group({header: ''}));
  }


  colMetaData: TableInputColumnMetaData[] = [];
  dataStore: any[] = [];
  renderTable = false;

  onSubmitBarChartInfo() {
    this.dataStore = [];
    let dummyObject: { rowHeader?: string } = {};
    this.colMetaData = [];

    let mainHeader = this.labelX.value + '/' + this.labelY.value;

    this.colMetaData.push({header: mainHeader, name: 'rowHeader', type: 'text'});

    console.log('this.stacks.value', this.stacks.value);
    let blankHeaderCount = 0;
    for (let element of this.stacks.value) {
      if (element.header) {
        this.colMetaData.push({
          name: element.header,
          header: element.header,
          type: 'number'
        });
        dummyObject[element.header] = '';
      } else {
        blankHeaderCount++;
      }
    }
    if (blankHeaderCount == this.stacks.value.length) {
      this.colMetaData.push({
        name: 'Values',
        header: 'Values',
        type: 'number'
      });
    }
    for (let i = 0; i < this.bars.value; i++) {
      dummyObject['rowHeader'] = this.labelX.value + '-' + i;
      this.dataStore.push(Object.assign({}, dummyObject));
    }
    if (this.isEdit) {
      this.dataStore = this.data.dataStore;
    }
    this.renderTable = true;
  }

  chartOptions = barChartOptions;
  chartType = barChartType;
  chartLegend = barChartLegend;
  chartPlugins = barChartPlugins;

  chartLabels: Label[] = [];
  chartData: ChartDataSets[] = [];
  renderBar = false;

  rederBarChart() {
    const rowNames = this.dataStore.map(ele => ele.rowHeader);
    const colNames = this.colMetaData.map(col => col.name);

    const expectedFormat = colNames.filter(col => col != 'rowHeader').map(col => {
      const valList = this.dataStore.map(ele => ele[col]);
      return {
        label: col,
        data: valList
      };
    });

    this.chartLabels = rowNames;
    this.chartData = expectedFormat;
    this.chartOptions = getChartOptions(this.labelX.value, this.labelY.value);
    this.renderBar = true;
  }


  submitBarChartInput() {
    const data = {
      metaDataValue: {
        source: this.source.value,
        title: this.title.value,
        labelX: this.labelX.value,
        labelY: this.labelY.value
      },
      colMetaData: this.colMetaData,
      dataStore: this.dataStore,
      chartLabels: this.chartLabels,
      chartData: this.chartData
    };
    this.dialogRef.close(data);
  }

  doClose() {
    this.dialogRef.close();
  }
}
