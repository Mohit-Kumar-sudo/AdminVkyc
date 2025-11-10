import {Component, OnInit, Inject} from '@angular/core';
import {MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';
import * as _ from 'lodash';
import {ToastrService} from "ngx-toastr";

@Component({
  selector: 'app-sub-module-app',
  templateUrl: './add-sub-module.component.html',
  styleUrls: ['./add-sub-module.component.scss']
})
export class AddSubModuleComponent implements OnInit {
  subModule: string = '';
  allMenu = [];
  currentMenu: any;

  constructor(public dialogRef: MatDialogRef<AddSubModuleComponent>,
              private toastr: ToastrService,
              @Inject(MAT_DIALOG_DATA) public data: any) {
  }

  ngOnInit() {
    console.log(this.data)
    if (this.data && this.data.allMenu) {
      this.allMenu = this.data.allMenu;
      this.currentMenu = this.data.menu;
    }
  }

  addSubModule() {
    if (this.subModule.trim()) {
      const key = this.subModule.toLowerCase().split(' ').join('_');
      this.allMenu.forEach(item => {
        if (this.currentMenu.section_id == item.section_id) {
          item.subSections = item.subSections ? item.subSections : [];
          if (_.find(item.subSections, ['key', key])) {
            this.toastr.error('Entered submodule already exists.', 'Message');
          } else {
            item.subSections.push({
              id: item.subSections.length + 1,
              key: key,
              value: this.subModule
            });
          }
        }
      });
      this.subModule = '';
    }
  }
}
