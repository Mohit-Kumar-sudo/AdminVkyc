import { Component, OnInit, OnDestroy } from '@angular/core';
import { CarriersService, Carrier } from '../../services/carriers/carriers.service';
import { Router } from '@angular/router';
import { SsrService } from '../../services/ssr/ssr.service';
import { Title, Meta } from '@angular/platform-browser';

@Component({
  selector: 'app-carrier-details',
  templateUrl: './carrier-details.component.html',
  styleUrls: ['./carrier-details.component.scss']
})
export class CarrierDetailsComponent implements OnInit, OnDestroy {

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
  
  // Define the listener function so it can be removed later
  private resizeListener: () => void;

  constructor(
    private carriersService: CarriersService, 
    private router: Router,
    private ssrService: SsrService,
    private titleService: Title,
    private metaService: Meta
    ) {
        this.resizeListener = () => this.checkMobileView();
    }

  ngOnInit(): void {
    this.titleService.setTitle('Current Openings | TaskHive Careers');
    this.metaService.updateTag({ name: 'description', content: 'Find your next career opportunity at TaskHive. Browse our open job listings.' });
    
    if (this.ssrService.isBrowser()) {
      this.checkMobileView();
      window.addEventListener('resize', this.resizeListener);
    }
    this.fetchJobs();
  }
  
  ngOnDestroy(): void {
      if (this.ssrService.isBrowser()) {
          window.removeEventListener('resize', this.resizeListener);
      }
  }

  checkMobileView(): void {
    if(this.ssrService.isBrowser()){
        this.isMobile = window.innerWidth < 992; // Bootstrap's lg breakpoint
        if (!this.isMobile) {
            this.showMobileFilters = false;
        }
    }
  }

  fetchJobs(): void {
    this.isLoading = true;
    this.error = null;
    
    const queryParams: any = {
      page: this.currentPage,
      limit: this.itemsPerPage
    };
    
    this.addFilterParams(queryParams);
    
    this.carriersService.getCarriersWithFilters(queryParams).subscribe({
      next: (response: any) => {
        if (response && response.success && Array.isArray(response.data)) {
          this.jobListings = response.data.map((job: Carrier) => ({
            id: job._id,
            title: job.jobTitle,
            description: job.jobDescription,
            location: job.jobLocation,
            experienceLevel: `${job.jobExperience} Yrs`,
            employmentType: job.jobType,
            status: job.status,
            daysAgo: this.calculateDaysAgo(job.created_at)
          }));
          
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
    if (this.filters.employmentType.FullTime) {
      queryParams.jobType = 'full';
    }
    if (this.filters.employmentType.contract) {
      queryParams.jobType = this.filters.employmentType.FullTime ? 
        queryParams.jobType + ',contract' : 'contract';
    }
    
    if (this.filters.location.onsite) {
      queryParams.jobPreference = 'office';
    }
    if (this.filters.location.remote) {
      queryParams.jobPreference = this.filters.location.onsite ? 
        queryParams.jobPreference + ',remote' : 'remote';
    }
    
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
    return Math.floor(diffTime / (1000 * 60 * 60 * 24));
  }
  
  viewJobDetails(id: string): void {
    console.log('Navigate to job detail with ID:', id);
  }

  viewDetails(id: string): void {
    if (id) {
      this.router.navigate(['/career-summary', id]);
    }
  }

  applyFilters(): void {
    this.currentPage = 1;
    this.fetchJobs();
  }

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
    
    this.currentPage = 1;
    this.fetchJobs();
  }
  
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
  
  getPaginationArray(): number[] {
    const pages: number[] = [];
    
    let startPage = Math.max(1, this.currentPage - 2);
    let endPage = Math.min(this.totalPages, startPage + 4);
    
    if (endPage - startPage < 4 && startPage > 1) {
      startPage = Math.max(1, endPage - 4);
    }
    
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    
    return pages;
  }
}