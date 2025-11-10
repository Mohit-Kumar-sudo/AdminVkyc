import {Component, Inject, OnInit} from '@angular/core';
import {FormGroup, FormBuilder, FormControl, Validators, FormArray} from '@angular/forms';
import {Label} from 'ng2-charts';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material';
import {pieChartOptions, pieChartType, pieChartLegend, pieChartPlugins, pieChartColors} from './pie-chart-configs';

@Component({
  selector: 'app-pie-chart-input',
  templateUrl: './pie-chart-input.component.html',
  styleUrls: ['./pie-chart-input.component.scss']
})
export class PieChartInputComponent implements OnInit {

  pieChartForm: FormGroup;

  constructor(private _formBuilder: FormBuilder,
              public dialogRef: MatDialogRef<PieChartInputComponent>, @Inject(MAT_DIALOG_DATA) public data: any) {
  }

  ngOnInit() {
    this.pieChartForm = new FormGroup({
      title: new FormControl('', [Validators.required]),
      source: new FormControl('', [Validators.required]),
      calType: new FormControl('', [Validators.required]),
      columnData: this._formBuilder.array([this._formBuilder.group({header: '', value: 0})])
    });
    if (this.data) {
      this.pieChartForm.controls.title.setValue(this.data.metaDataValue.title);
      this.pieChartForm.controls.source.setValue(this.data.metaDataValue.source);
      this.pieChartForm.controls.calType.setValue(this.data.metaDataValue.calType);
      this.pieChartForm.setControl('columnData', this.setColumnsData(this.data.metaDataValue.columns));
      this.onSubmitPieInfo();
    }
  }

  removePieHeader(i) {
    this.columns.removeAt(i);
  }

  setColumnsData(columns): FormArray {
    const formArray = new FormArray([]);
    columns.forEach(item => {
      formArray.push(this._formBuilder.group({
        header: item.header,
        value: item.value
      }));
    });
    return formArray;
  }

  get title() {
    return this.pieChartForm.get('title');
  }

  get source() {
    return this.pieChartForm.get('source');
  }

  get calType() {
    return this.pieChartForm.get('calType');
  }

  get columns() {
    return this.pieChartForm.get('columnData') as FormArray;
  }

  addColumn(): void {
    this.columns.push(this._formBuilder.group({header: '', value: 0}));
  }

  isSubmit = false;
  chartOptions = pieChartOptions;
  chartType = pieChartType;
  chartLegend = pieChartLegend;
  chartPlugins = pieChartPlugins;
  chartColors = pieChartColors;

  chartLabels: Label[] = [];
  chartData: number[] = [];


  onSubmitPieInfo() {
    let stragegy = this.calType.value;
    let dataList = this.columns.value;

    let totalSum = 0;
    if (stragegy == 'BY_PERCENTAGE') {
      totalSum = dataList.map(ele => Number(ele.value)).reduce((a, b) => a + b, 0);
    }

    let data = this.pieChartForm.value;
    this.chartLabels = [];
    this.chartData = [];
    for (let element of dataList) {
      this.chartLabels.push(element.header);
      this.chartData.push(element.value);
    }
    this.isSubmit = true;
  }

  submitPieChartInput() {
    const data = {
      metaDataValue: {
        source: this.source.value,
        title: this.title.value,
        calType: this.calType.value,
        columns: this.columns.value
      },
      chartLabels: this.chartLabels,
      chartData: this.chartData
    };
    this.dialogRef.close(data);
  }

  doClose() {
    this.dialogRef.close();
  }

}
