import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import {CdkDragDrop, moveItemInArray} from "@angular/cdk/drag-drop";


@Component({
  selector: 'app-text-input',
  templateUrl: './modules-sequence.component.html',
  styleUrls: ['./modules-sequence.component.scss']
})
export class ModulesSequenceComponent implements OnInit {

  constructor(public dialogRef: MatDialogRef<ModulesSequenceComponent>
    , @Inject(MAT_DIALOG_DATA) public data: any) { }

  ngOnInit() {
  }

  drop(event: CdkDragDrop<string[]>) {
    moveItemInArray(this.data, event.previousIndex, event.currentIndex);
    this.data.forEach((item, index) => {
      item.sequenceNo = index + 1;
    });
  }

  doClose() {
    this.dialogRef.close();
  }
}
