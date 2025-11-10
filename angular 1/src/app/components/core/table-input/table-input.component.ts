import {Component, Inject, OnInit} from '@angular/core';
import {FormGroup, FormControl, Validators, FormArray, FormBuilder} from '@angular/forms';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material';

export interface TableInputColumnMetaData {
  name: string,
  header: string,
  type: 'text' | 'number',
}

@Component({
  selector: 'app-table-input',
  templateUrl: './table-input.component.html',
  styleUrls: ['./table-input.component.scss']
})
export class TableInputComponent implements OnInit {

  tableInfoForm: FormGroup;
  isEdit: boolean = false;

  constructor(private _formBuilder: FormBuilder,
              private dialogRef: MatDialogRef<TableInputComponent>, @Inject(MAT_DIALOG_DATA) public data: any) {
  }

  ngOnInit() {
    this.tableInfoForm = new FormGroup({
      title: new FormControl('', [Validators.required]),
      source: new FormControl('', [Validators.required]),
      rows: new FormControl('', [Validators.required]),
      columnData: this._formBuilder.array([this._formBuilder.group({header: ''})])
    });
    if (this.data) {
      this.tableInfoForm.controls.title.setValue(this.data.metaDataValue.title);
      this.tableInfoForm.controls.source.setValue(this.data.metaDataValue.source);
      this.tableInfoForm.controls.rows.setValue(this.data.metaDataValue.rows);
      this.tableInfoForm.setControl('columnData', this.setColumnsData(this.data.metaDataValue.columns));
      // tslint:disable-next-line:prefer-for-of
      for (let i = 0; i < this.data.metaDataValue.rows.length; i++) {
        this.addColumn();
      }
      this.isEdit = true;
      this.onSubmitTableInfo();
    }
  }

  removeTableHeader(i) {
    this.columns.removeAt(i);
  }

  setColumnsData(columns): FormArray {
    const formArray = new FormArray([]);
    columns.forEach(item => {
      formArray.push(this._formBuilder.group({
        header: item.header
      }));
    });
    return formArray;
  }

  get title() {
    return this.tableInfoForm.get('title');
  }

  get source() {
    return this.tableInfoForm.get('source');
  }

  get rows() {
    return this.tableInfoForm.get('rows');
  }

  get columns() {
    return this.tableInfoForm.get('columnData') as FormArray;
  }

  addColumn(): void {
    this.columns.push(this._formBuilder.group({header: ''}));
  }

  // Editable Grid Input
  colMetaData: TableInputColumnMetaData[] = [];
  dataStore: any[] = [];
  isSubmitted = false;

  onSubmitTableInfo() {
    // Initialize to Empty State
    let dummyObject = {};
    this.colMetaData = [];
    this.dataStore = [];

    for (let element of this.columns.value) {
      this.colMetaData.push({
        name: element.header,
        header: element.header,
        type: 'text'
      });
      dummyObject[element.header] = '';
    }
    for (let i = 0; i < this.rows.value; i++) {
      this.dataStore.push(Object.assign({}, dummyObject));
    }
    if (this.isEdit) {
      this.dataStore = this.data.dataStore;
    }
    this.isSubmitted = true;
  }

  submitTableInput() {
    const data = {
      metaDataValue: {
        source: this.source.value,
        title: this.title.value,
        rows: this.rows.value,
        columns: this.columns.value
      },
      dataStore: this.dataStore
    };
    this.dialogRef.close(data);
  }

  doClose() {
    this.dialogRef.close();
  }
}
