import { Component, Input, OnInit, ViewChild, ElementRef } from '@angular/core';
import { SharedSampleTocService } from 'src/app/services/shared-sample-toc.service';

@Component({
  selector: 'app-notes-output',
  templateUrl: './notes-output.component.html',
  styleUrls: []
})
export class NotesOutputComponent implements OnInit {

  @Input() dataElement: any;

  constructor(public sharedSampleTocService: SharedSampleTocService) { }

  ngOnInit() { }
}
