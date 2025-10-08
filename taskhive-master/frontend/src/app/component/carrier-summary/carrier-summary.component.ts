import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CarriersService, Carrier } from '../../services/carriers/carriers.service';
import { Title, Meta } from '@angular/platform-browser';

@Component({
  selector: 'app-carrier-summary',
  templateUrl: './carrier-summary.component.html',
  styleUrls: ['./carrier-summary.component.scss']
})
export class CarrierSummaryComponent implements OnInit {
  carrierId: string = '';
  carrierData: Carrier | null = null;
  loading: boolean = false;
  errorMessage: string = '';

  constructor(
    private carriersService: CarriersService,
    private route: ActivatedRoute,
    private titleService: Title,
    private metaService: Meta
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.carrierId = params['id'];
      if (this.carrierId) {
        this.fetchCarrierData(this.carrierId);
      } else {
          this.errorMessage = 'Unable to load career data: Missing ID';
           this.titleService.setTitle('Career Not Found | TaskHive');
      }
    });
  }

  fetchCarrierData(carrierId: string): void {
    this.loading = true;
    this.carriersService.onCarriersFindOne(carrierId)
      .subscribe({
        next: (response: any) => {
          if (response && response.data) {
            this.carrierData = response.data;
            // Set dynamic SEO tags
            this.titleService.setTitle(`${this.carrierData?.jobTitle} | TaskHive Careers`);
            this.metaService.updateTag({ name: 'description', content: `Apply for the ${this.carrierData?.jobTitle} position at TaskHive. Location: ${this.carrierData?.jobLocation}.` });
          } else {
            this.errorMessage = 'Career data not found.';
            this.titleService.setTitle('Career Not Found | TaskHive');
          }
          this.loading = false;
        },
        error: (error) => {
          console.error('Error fetching career data:', error);
          this.errorMessage = 'Unable to load career data. Please try again later.';
          this.titleService.setTitle('Error Loading Career | TaskHive');
          this.loading = false;
        }
      });
  }

  viewAllDetails(): void {
    // This could navigate to a full application form, for example.
    console.log('View all details clicked for:', this.carrierId);
  }
}