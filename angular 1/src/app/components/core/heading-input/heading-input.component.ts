import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';


@Component({
  selector: 'app-heading-input',
  templateUrl: './heading-input.component.html',
  styleUrls: []
})
export class HeadingInputComponent {

  constructor(public dialogRef: MatDialogRef<HeadingInputComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any) { }

  doClose() {
    this.dialogRef.close();
  }
}
