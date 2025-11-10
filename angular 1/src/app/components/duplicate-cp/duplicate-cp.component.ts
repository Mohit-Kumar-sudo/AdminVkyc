import { Component, OnInit } from '@angular/core';
import { FormArray, FormControl } from '@angular/forms';
import { MatTableDataSource } from '@angular/material';
import { NgxSpinnerService } from 'ngx-spinner';
import { DuplicatesService } from 'src/app/services/duplicates.service';
import * as _ from 'lodash';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-duplicate-cp',
  templateUrl: './duplicate-cp.component.html',
  styleUrls: ['./duplicate-cp.component.scss']
})
export class DuplicateCpComponent implements OnInit {
  duplicateCps: any;
  element = new FormArray([])
  actualData: any;
  searchCp = new FormControl();
  fcIndex: any = [];
  constructor(
    private dcpService: DuplicatesService,
    private spinner: NgxSpinnerService,
    private ngxToaster:ToastrService
  ) { }

  ngOnInit() {
    this.spinner.show();
    this.dcpService.getAllDuplicateCompanies().subscribe(data => {
      if (data && data.length) {
        this.spinner.hide()
        this.duplicateCps = new MatTableDataSource(data)
        this.actualData = data
        this.duplicateCps.filteredData.forEach((d,i) => {
          let val = _.compact(_.map(d.duplicates, dd => { if (dd.selected) { return dd } }))          
          this.element.push(new FormControl(val))
          this.fcIndex.push(i)
        })
      }
    }, err => {
      console.log(err);
      this.spinner.hide();
    })
    this.searchCp.valueChanges.pipe(debounceTime(1000), distinctUntilChanged()).subscribe(d => {
      this.applyFilter(d)
    })
  }

  applyFilter(value) {
    this.fcIndex = [];
    this.duplicateCps.filter = value.trim().toLowerCase()
    this.duplicateCps.filteredData.forEach(d => {
      let i = _.findIndex(this.actualData, dd => { return dd.cp_id == d.cp_id });
      this.fcIndex.push(i)      
    })
  }

  selection(index,fcIndex) {
    let deSelect = _.differenceWith(this.duplicateCps.filteredData[index].duplicates,this.element.value[fcIndex],_.isEqual);   
    let selected = this.element.value[fcIndex];
    deSelect.forEach(d=>{d["selected"]=0})  
    selected.forEach(d=>{d["selected"]=1})     
    this.duplicateCps.filteredData[index].duplicates = _.concat(selected,deSelect);   
    this.duplicateCps.filteredData[index].isCompleted = false
  }

  updateCp(event, index){
    this.duplicateCps.filteredData[index].isCompleted = event
    let objects = {
      duplicates:this.duplicateCps.filteredData[index].duplicates,
      isCompleted:this.duplicateCps.filteredData[index].isCompleted
    }
    this.dcpService.updateDuplicateCp(objects,this.duplicateCps.filteredData[index].cp_id).subscribe(d=>{
      if(d){
        this.ngxToaster.success(this.duplicateCps.filteredData[index].cp_name+" updated!!!")
      }      
    },err=>{
      console.log(err);      
    }) 
  }
}
