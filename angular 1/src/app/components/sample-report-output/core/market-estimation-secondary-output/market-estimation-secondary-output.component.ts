import { Component, Input } from '@angular/core'
import * as _ from 'lodash';
import { ReportDataElement } from 'src/app/models/secondary-research-models';

@Component({
  selector: 'app-market-estimation-secondary-output',
  templateUrl: './market-estimation-secondary-output.component.html',
  styleUrls: []
})
export class MarketEstimationSecondaryOutputComponent {
  @Input() secondaryInputData: ReportDataElement[]
  @Input() subHeading: any;
}