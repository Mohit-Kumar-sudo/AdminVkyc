import { Component, OnInit } from '@angular/core';
declare var bootstrap: any;
import { CarriersService, Carrier } from '../../services/carriers/carriers.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-carrier-details',
  templateUrl: './carrier-details.component.html',
  styleUrls: ['./carrier-details.component.scss']
})
export class CarrierDetailsComponent implements OnInit {

  jobListings: {
    id: string;
    title: string;
    description: string;
    location: string;
    experienceLevel: string;
    employmentType: string;
    status: string;
    daysAgo: number;
  }[] = [];

  // Pagination controls
  currentPage = 1;
  itemsPerPage = 10;
  totalItems = 0;
  totalPages = 0;

  error: string | null = null;
  isLoading = true;
  showMobileFilters = false;
  isMobile = false;

  // Filter states
  filters = {
    employmentType: {
      FullTime: false,
      contract: false
    },
    location: {
      onsite: false,
      remote: false
    },
    experienceLevel: {
      zeroToOne: false,
      oneToThree: false,
      threeToFive: false,
      fiveToEight: false, 
      tenPlus: false
    }
  };

  constructor(private carriersService: CarriersService, private router: Router) {}

  ngOnInit(): void {
    this.checkMobileView();
    window.addEventListener('resize', () => this.checkMobileView());
    this.fetchJobs();
  }

    checkMobileView(): void {
    this.isMobile = window.innerWidth < 992; // Bootstrap's lg breakpoint
    if (!this.isMobile) {
      this.showMobileFilters = false;
    }
  }

  fetchJobs(): void {
    this.isLoading = true;
    this.error = null;
    
    // Create the query parameters for pagination and filtering
    const queryParams: any = {
      page: this.currentPage,
      limit: this.itemsPerPage
    };
    
    // Add filtering parameters based on the current filter state
    this.addFilterParams(queryParams);
    
    this.carriersService.getCarriersWithFilters(queryParams).subscribe({
      next: (response: any) => {
        if (response && response.success && Array.isArray(response.data)) {
          // Process job data and store it
          this.jobListings = response.data.map((job: Carrier) => ({
            id: job._id,
            title: job.jobTitle,
            description: job.jobDescription,
            location: job.jobLocation,
            experienceLevel: `${job.jobExperience} Yrs`,
            employmentType: job.jobType,
            status: 'Open',
            daysAgo: this.calculateDaysAgo(job.created_at)
          }));
          
          // Update pagination data
          if (response.pagination) {
            this.totalItems = response.pagination.total;
            this.totalPages = Math.ceil(this.totalItems / this.itemsPerPage);
          }
        } else {
          this.error = 'Invalid data format from server';
        }
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading jobs', err);
        this.error = 'Unable to fetch job listings.';
        this.isLoading = false;
      }
    });
  }

  addFilterParams(queryParams: any): void {
    // Employment Type filters
    if (this.filters.employmentType.FullTime) {
      queryParams.jobType = 'full';
    }
    if (this.filters.employmentType.contract) {
      queryParams.jobType = this.filters.employmentType.FullTime ? 
        queryParams.jobType + ',contract' : 'contract';
    }
    
    // Location filters
    if (this.filters.location.onsite) {
      queryParams.jobPreference = 'office';
    }
    if (this.filters.location.remote) {
      queryParams.jobPreference = this.filters.location.onsite ? 
        queryParams.jobPreference + ',remote' : 'remote';
    }
    
    // Experience Level filters
    const expRanges = [];
    if (this.filters.experienceLevel.zeroToOne) {
      expRanges.push('0-1');
    }
    if (this.filters.experienceLevel.oneToThree) {
      expRanges.push('1-3');
    }
    if (this.filters.experienceLevel.threeToFive) {
      expRanges.push('3-5');
    }
    if (this.filters.experienceLevel.fiveToEight) {
      expRanges.push('5-8');
    }
    if (this.filters.experienceLevel.tenPlus) {
      expRanges.push('10+');
    }
    
    if (expRanges.length > 0) {
      queryParams.expRanges = expRanges.join(',');
    }
  }

  calculateDaysAgo(created_at?: string): number {
    if (!created_at) return 0;
    const createdDate = new Date(created_at);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - createdDate.getTime());
    return Math.floor(diffTime / (1000 * 60 * 60 * 24)); // days difference
  }
  
  viewJobDetails(id: string): void {
    console.log('Navigate to job detail with ID:', id);
    // you can navigate to details page or set selected job, etc.
  }

    viewDetails(id: string): void {
    if (id) {
      this.router.navigate(['/carrier-summary', id]);
    }
  }

  // Method to apply filters
  applyFilters(): void {
    // Reset to first page when applying new filters
    this.currentPage = 1;
    // Fetch jobs with the new filters
    this.fetchJobs();
  }

  // Method to clear all filters
  clearFilters(): void {
    this.filters = {
      employmentType: { FullTime: false, contract: false },
      location: { onsite: false, remote: false },
      experienceLevel: {
        zeroToOne: false,
        oneToThree: false,
        threeToFive: false,
        fiveToEight: false,
        tenPlus: false
      }
    };
    
    // Reset to first page
    this.currentPage = 1;
    // Fetch all jobs without filters
    this.fetchJobs();
  }
  
  // Pagination methods
  goToPage(page: number): void {
    if (page < 1 || page > this.totalPages) {
      return;
    }
    this.currentPage = page;
    this.fetchJobs();
  }
  
  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.fetchJobs();
    }
  }
  
  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.fetchJobs();
    }
  }
  
  // Helper method to create array for pagination display
  getPaginationArray(): number[] {
    const pages: number[] = [];
    
    // Show at most 5 pages in pagination
    let startPage = Math.max(1, this.currentPage - 2);
    let endPage = Math.min(this.totalPages, startPage + 4);
    
    // Adjust if we're at the end
    if (endPage - startPage < 4 && startPage > 1) {
      startPage = Math.max(1, endPage - 4);
    }
    
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    
    return pages;
  }
}