import { Component, OnInit } from '@angular/core';
import { SsrService } from '../../services/ssr/ssr.service';

@Component({
  selector: 'app-pricing',
  templateUrl: './pricing.component.html',
  styleUrl: './pricing.component.scss'
})
export class PricingComponent implements OnInit {
  constructor(private ssrService: SsrService) {}

  async ngOnInit() {
    if (this.ssrService.isBrowser()) {
      const AOS = await this.ssrService.loadAOS();
      AOS.init({
        offset: 200, // offset (in px) from the original trigger point
        duration: 1000, // values from 0 to 3000, with step 50ms
        easing: 'ease', // default easing for AOS animations
        delay: 100, // values from 0 to 3000, with step 50ms
        once: true // Animation occurs only once when scrolling down
      });
    }
  }
}