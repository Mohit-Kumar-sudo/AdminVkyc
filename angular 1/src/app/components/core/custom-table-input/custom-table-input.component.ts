import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormBuilder } from '@angular/forms';

@Component({
  selector: 'app-custom-table-input',
  templateUrl: './custom-table-input.component.html',
  styleUrls: ['./custom-table-input.component.scss']
})
export class CustomTableInputComponent implements OnInit {

  tableData = {
    title: "",
    data: []
  }

  constructor(public dialogRef: MatDialogRef<CustomTableInputComponent>, private fb: FormBuilder, @Inject(MAT_DIALOG_DATA) public data: any) {
  }

  ngOnInit() {
    if (this.data) {
      if (this.data.title) {
        this.tableData.title = this.data.title
      }
      if (this.data.data && this.data.data.length) {
        this.data.data.forEach(element => {
          if(typeof element.title == 'string' ){
            element.title = [{title:element.title}]
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
      title: [{title:''}],
      data: [
        { data: '' }
      ]
    }
    this.tableData.data.push(newRow)
  }
  addBullet(i) {
    if (this.tableData && this.tableData.data[i] && this.tableData.data[i].data) {
      this.tableData.data[i].data.push({ data: '' })
    }
  }
  deleteEle(ele, index, row) {
    row = row.filter(obj => obj.data !== ele.data)
    if (this.tableData && this.tableData.data[index] && this.tableData.data[index].data) {
      this.tableData.data[index].data = row
    }
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

  addTitle(i){
    if (this.tableData && this.tableData.data[i] && this.tableData.data[i].title) {
      this.tableData.data[i].title.push({ title: '' })
    }
  }

  deleteTitle(ele, index, row) {
    if (this.tableData && this.tableData.data[index] && this.tableData.data[index].title) {
      this.tableData.data[index].title = row.filter(obj => obj.title !== ele.title);
    }
  }

}
