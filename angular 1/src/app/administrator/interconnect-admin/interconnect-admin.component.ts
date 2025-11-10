import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { CompanyProfileService } from 'src/app/services/company-profile.service';
import { Location } from '@angular/common';
import { NgxSpinnerService } from 'ngx-spinner';

@Component({
  selector: 'app-interconnect-admin',
  templateUrl: './interconnect-admin.component.html',
  styleUrls: ['./interconnect-admin.component.scss']
})

export class InterconnectAdminComponent implements OnInit {
  selectedFile: any;
  disabled: any = true;
  updated: any = [];

  @ViewChild('csvfile')
  fileVari:ElementRef;
  constructor(
    private companyService: CompanyProfileService,
    private _location: Location,
    private spinner : NgxSpinnerService
  ) { }

  ngOnInit() {
  }

  onFileChanged(event) {
    this.selectedFile = event.target.files[0]
    if (this.selectedFile && this.selectedFile.type == 'text/csv')
      this.disabled = false;
    else
      this.disabled = true;
  }

  uploadCSV() {
    this.spinner.show();
    if (this.selectedFile && this.selectedFile.type == 'text/csv') {
      let formData = new FormData();
      formData.append("csv_file", this.selectedFile, this.selectedFile.name);
      this.companyService.uploadCSVFile(formData).subscribe(d => {                
        if (d && d.temp && d.temp.length) {
          this.updated = d.temp;
          this.fileVari.nativeElement.value = "";
          this.disabled = true;
          this.spinner.hide();
        }else if(d && d.error){
          this.updated = d;
          this.spinner.hide();
        }
      }, err => {
        console.log(err);
        this.spinner.hide();
      })
    } else {
      this.disabled = true;
    }
  }
  back() {
    this._location.back();
  }
}

