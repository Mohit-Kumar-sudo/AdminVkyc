import {Component, OnInit, Input, Output, EventEmitter} from '@angular/core';
import {FormControl} from '@angular/forms';
import * as _ from 'lodash';

@Component({
  selector: 'app-kv-multi-select',
  templateUrl: './kv-multi-select.component.html',
  styleUrls: ['./kv-multi-select.component.scss']
})
export class KvMultiSelectComponent implements OnInit {

  dataEle = new FormControl();

  previousValues: any = [];

  @Input()
  header: string;

  @Input()
  dataList: any[];

  @Input()
  inputValues: any;

  @Output()
  elementSelectionChange: EventEmitter<any[]> = new EventEmitter<any[]>();

  constructor() {
  }

  ngOnInit() {
    this.previousValues = _.map(this.inputValues, 'name')
    this.dataEle.setValue(this.previousValues);
  }

  selectionChanged(event) {
    let values = event.value;
    if(values && values.length){
      if(this.previousValues.length > values.length){
        this.previousValues.forEach(element => {
          if(!values.includes(element)){
            this.previousValues = this.previousValues.filter(item => item !== element);
          }
        });
      }else if(this.previousValues.length < values.length){
        values.forEach(element => {
          if(!this.previousValues.includes(element)){
            this.previousValues.push(element);
          }
        });
      }
    }else{
      this.previousValues = [];
    }
    this.elementSelectionChange.emit(this.previousValues);
  }
}
