import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';


@Component({
  selector: 'app-text-input',
  templateUrl: './text-input.component.html',
  styleUrls: ['./text-input.component.scss']
})
export class TextInputComponent implements OnInit {

  content: string = '';

  editorConfig = {
    editable: true,
    spellcheck: true,
    height: "200px",
    minHeight: "0",
    width: "730px",
    minWidth: "0",
    placeholder: 'Enter text here...',
    translate: 'no',
    toolbar: [
      ["bold", "italic", "underline", "strikeThrough", "superscript", "subscript"],
      ["link", "unlink"],
      ['unorderedList']
    ]
  };

  constructor(public dialogRef: MatDialogRef<TextInputComponent>
    , @Inject(MAT_DIALOG_DATA) public data: any) { }

  ngOnInit() {
    if (this.data) {
      this.content = this.data;
    }
  }

  doClose() {
    this.dialogRef.close();
  }
}
