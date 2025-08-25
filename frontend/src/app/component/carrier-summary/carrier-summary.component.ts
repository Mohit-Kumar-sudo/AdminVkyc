import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { environment } from '../../../environments/environment';

interface CarrierData {
  _id: string;
  jobTitle: string;
  jobRole: string;
  jobDuration: number;
  jobLocation: string;
  jobSkills: string;
  jobExperience: number;
  jobType: string;
  jobPreference: string;
  jobDescription: string;
  jobSalary: number;
  is_active: boolean;
  status: string;
  created_at: Date;
  // Other fields as needed
}

@Component({
  selector: 'app-carrier-summary',
  templateUrl: './carrier-summary.component.html',
  styleUrls: ['./carrier-summary.component.scss']
})
export class CarrierSummaryComponent implements OnInit {
  carrierId: string = '';
  carrierData: CarrierData | null = null;
  loading: boolean = false;
  errorMessage: string = '';

  constructor(
    private http: HttpClient,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    // Get the carrier ID from the route parameters
    this.route.params.subscribe(params => {
      this.carrierId = params['id'];
      if (this.carrierId) {
        this.fetchCarrierData(this.carrierId);
      }
    });
  }

  fetchCarrierData(carrierId: string): void {
    if (!carrierId) {
      this.errorMessage = 'Unable to load carrier data: Missing ID';
      return;
    }
  
    this.loading = true;
    this.http.get<{success: boolean, data: CarrierData}>(`${environment.url}/carriers/get/${carrierId}`)
      .subscribe({
        next: (response) => {
          this.carrierData = response.data;
          this.loading = false;
        },
        error: (error) => {
          console.error('Error fetching carrier data:', error);
          this.errorMessage = 'Unable to load carrier data. Please try again later.';
          this.loading = false;
        }
      });
  }

  viewAllDetails(): void {
    // Placeholder function - implement navigation logic if needed
    console.log('View all details clicked');
  }
}