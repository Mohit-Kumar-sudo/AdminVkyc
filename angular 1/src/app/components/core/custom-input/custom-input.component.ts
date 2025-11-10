import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormBuilder } from '@angular/forms';

@Component({
  selector: 'app-custom-input',
  templateUrl: './custom-input.component.html',
  styleUrls: ['./custom-input.component.scss']
})
export class CustomInputComponent implements OnInit {

  tableData = {
    title: "",
    data: []
  }
  editorConfig = {
    editable: true,
    spellcheck: true,
    height: "70px",
    minHeight: "0",
    width: "400px",
    minWidth: "0",
    placeholder: 'Enter text here...',
    translate: 'no',
    toolbar: [
      ["bold", "italic", "underline", "strikeThrough", "superscript", "subscript"],
      ["link", "unlink"],
      ['unorderedList']
    ]
  };

  constructor(public dialogRef: MatDialogRef<CustomInputComponent>, 
              private fb: FormBuilder, 
              @Inject(MAT_DIALOG_DATA) public data: any) { }

  ngOnInit() {
    if (this.data) {
      if (this.data && this.data.title) {
        this.tableData.title = this.data.title
      }
      if (this.data && this.data.data && this.data.data.length) {
        this.data.data.forEach(element => {
          if (typeof element.title == 'string') {
            element.title = [{ title: element.title }]
          }
          this.tableData.data.push(element);
        });
      }
    }
  }
  save() {
    this.doClose(this.tableData);
  }
  addRow() {
    let newRow = {
      title: [{ title: '' }],
      data: [
        { data: '' }
      ]
    }
    this.tableData.data.push(newRow)
  }
  deleteRow(row) {
    this.tableData.data = this.tableData.data.filter(obj => obj != row)
  }

  doClose(tableData) {
    if (tableData) {
      if (tableData.data && tableData.data.length == 0) {
        this.dialogRef.close();
      } else {
        this.dialogRef.close(tableData);
      }
    } else {
      this.dialogRef.close();
    }
  }

  addTitle(i) {
    if (this.tableData && this.tableData.data[i] && this.tableData.data[i].title) {
      this.tableData.data[i].title.push({ title: '' })
    }
  }

  deleteTitle(ele, index, row) {
    row = row.filter(obj => obj.title !== ele.title)
    if (this.tableData && this.tableData.data[index] && this.tableData.data[index].title) {
      this.tableData.data[index].title = row
    }
  }
}