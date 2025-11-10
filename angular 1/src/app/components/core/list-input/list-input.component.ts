import {Component, OnInit, Inject} from '@angular/core';
import {MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';
import {FormBuilder, FormArray, FormGroup} from '@angular/forms';

@Component({
  selector: 'app-list-input',
  templateUrl: './list-input.component.html',
  styleUrls: ['./list-input.component.scss']
})
export class ListInputComponent implements OnInit {

  content: any = '';
  listData: any = [];

  constructor(public dialogRef: MatDialogRef<ListInputComponent>, private fb: FormBuilder, @Inject(MAT_DIALOG_DATA) public data: any) {
  }

  ngOnInit() {
    if (this.data) {
      if(this.data && this.data.length){
        this.data.forEach(element => {
          this.listData.push(element);
          if(!this.content){
            this.content = element;
          }else{
            this.content = this.content + '_'  + element;
          }
          
        });
      }
    }
  }

  stringToList(){
    let list = this.content.split('_');
    this.listData = [];
    if(list && list.length){
      if(list[0] != ""){
        list.forEach(element => {
          this.listData.push(element);
        });
      }
    }
    this.doClose(this.listData);
  }

  doClose(listData) {
    this.dialogRef.close(listData);
  }
}
