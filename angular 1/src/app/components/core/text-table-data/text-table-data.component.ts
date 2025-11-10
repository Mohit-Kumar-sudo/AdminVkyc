import { Component, OnInit, Input } from '@angular/core';

export interface TextTableData {
  title: string,
  text: string,
  custom_text: string,
  key: string,
  value: any[],
  rowHeader: string[],
}

@Component({
  selector: 'app-text-table-data',
  templateUrl: './text-table-data.component.html',
  styleUrls: ['./text-table-data.component.scss']
})
export class TextTableDataComponent implements OnInit {

  editorConfig = {
    editable: true,
    spellcheck: true,
    height: "26vh",
    minHeight: "0",
    width: "40vw",
    minWidth: "0",
    placeholder: 'Enter text here...',
    translate: 'no',
    toolbar: [
      ["bold", "italic", "underline", "strikeThrough", "superscript", "subscript"],
      ["link", "unlink"],
      ['unorderedList']
    ]
  };

  @Input('textTableData')
  data: TextTableData;

  constructor() { }

  ngOnInit() {
  }


}
