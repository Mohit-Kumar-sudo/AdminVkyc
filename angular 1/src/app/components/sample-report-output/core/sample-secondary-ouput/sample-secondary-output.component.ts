import { Component, Input } from '@angular/core'
import * as _ from 'lodash';
import { ReportDataElement } from 'src/app/models/secondary-research-models';

@Component({
  selector: 'app-sample-secondary-output',
  templateUrl: './sample-secondary-output.component.html',
  styleUrls: []
})
export class SampleSecondaryOutputComponent {
  @Input() secondaryInputData: ReportDataElement[]
  @Input() subHeading: any;
}