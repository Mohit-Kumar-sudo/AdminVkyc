import { Component, ViewChild } from '@angular/core';
import { HttpEventType } from '@angular/common/http';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { environment } from '../../../environments/environment';
import { CarriersService, Carrier } from '../../services/carriers/carriers.service';

@Component({
  selector: 'app-carriers',
  templateUrl: './carriers.component.html',
  styleUrls: ['./carriers.component.scss']
})
export class CarriersComponent {
  p: number = 1;
  itemsPerPage: number = 10;
  env: any;
  selectedCarrier: any = {};
  carriers: Carrier[] = []; // Initialize as empty array with the correct type
  myForm!: FormGroup;
  carrierToDeleteId: string | null = null;
  collection: any = [];
  isLoading: boolean = false;

  @ViewChild('confirmDeleteModal') confirmDeleteModal: any;

  constructor(
    private carriersService: CarriersService,
    private fb: FormBuilder,
    private modalService: NgbModal
  ) {
    this.env = environment.url
    this.myForm = this.fb.group({
      jobTitle: ['', Validators.required],
      jobRole: ['', Validators.required],
      jobDuration: ['', Validators.required],
      jobLocation: ['', Validators.required],
      jobSkills: ['', Validators.required],
      jobExperience: ['', Validators.required],
      jobType: ['', Validators.required],
      jobPreference: ['', Validators.required],
      jobDescription: ['', Validators.required],
      jobSalary: ['', Validators.required]
    });
    for (let i = 1; i <= 100; i++) {
      this.collection.push(`item ${i}`);
    }
  }

  ngOnInit() {
    this.fetchAllCarriers();
  }

  fetchAllCarriers() {
    this.isLoading = true;
    this.carriersService.get('carriers', {}).subscribe({
      next: (res) => {
        // Check if res has a data property that contains the array
        if (res && typeof res === 'object') {
          // Handle the case where the API returns { data: [...], success: true } format
          if (Array.isArray(res.data)) {
            this.carriers = res.data;
          } 
          // Handle the case where the API returns the array directly
          else if (Array.isArray(res)) {
            this.carriers = res;
          }
          // If it's a non-array object, log it for debugging and set carriers to empty array
          else {
            console.log('API response structure:', res);
            // Try to find any property that might contain the array
            for (const key in res) {
              if (Array.isArray(res[key])) {
                console.log(`Found array in property: ${key}`);
                this.carriers = res[key];
                break;
              }
            }
            
            // If no array found, set to empty array
            if (!Array.isArray(this.carriers)) {
              console.error('Could not find array in API response');
              this.carriers = [];
            }
          }
        } else {
          // Fallback to empty array
          this.carriers = [];
        }
        
        console.log('Carriers data loaded:', this.carriers);
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error fetching carriers:', err);
        this.carriers = []; // Set to empty array on error
        this.isLoading = false;
      }
    });
  }

  getSNo(index: number): number {
    return (this.p - 1) * this.itemsPerPage + index + 1;
  }

  editCarriers(carrier: Carrier, content: any) {
    this.selectedCarrier = { ...carrier }; 
    this.modalService.open(content, { ariaLabelledBy: 'modal-basic-title' });
  }

  onDelete(id: any) {
    this.carrierToDeleteId = id;  
    const modalRef = this.modalService.open(this.confirmDeleteModal, { ariaLabelledBy: 'modal-basic-title' });
    modalRef.result.then((result) => {
      if (result === 'Delete' && this.carrierToDeleteId) {
        // Fixed from 'courses' to 'carriers'
        this.carriersService.delete('carriers', this.carrierToDeleteId).subscribe({
          next: (res) => {
            console.log('Carrier deleted successfully:', res);
            this.fetchAllCarriers();
          },
          error: (err) => {
            console.error('Error deleting carrier:', err);
          }
        });
      }
    });
  }

  confirmDelete(modal: any) {
    modal.close('Delete'); 
  }
}