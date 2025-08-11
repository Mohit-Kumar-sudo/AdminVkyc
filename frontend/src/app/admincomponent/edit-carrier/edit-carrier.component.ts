import { Component, OnInit } from '@angular/core';
import { HttpEventType } from '@angular/common/http';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { CarriersService } from '../../services/carriers/carriers.service'; 
import { environment } from '../../../environments/environment';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-edit-carrier',
  templateUrl: './edit-carrier.component.html',
  styleUrl: './edit-carrier.component.scss'
})
export class EditCarrierComponent implements OnInit {

  env: string = environment.url;
  selectedCarriers: any = {};
  myForm!: FormGroup;
  image: File[] = [];

  constructor(
      private carriersService: CarriersService,
      private fb: FormBuilder,
      private router : Router,
      private route: ActivatedRoute
    ) {
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
    }

    ngOnInit() {
      const carrierId = this.route.snapshot.paramMap.get('id');
      if (carrierId) {
        this.fetchCarriersById(carrierId);
      } else {
        console.error('Carriers ID is undefined on initialization');
        alert('Error: Carriers ID is undefined on initialization');
      }
    }

    fetchCarriersById(id: string) {
      this.carriersService.get(`carriers/${id}`, {}).subscribe(
        (res) => {
          if (res && res.data && res.data._id) {
            this.selectedCarriers = res.data;            
            this.populateForm();
          } else {
            console.error('Carriers data does not contain an _id:', res);
            alert('Error: Carriers data is missing an ID.');
          }
        },
        (error) => {
          console.error(`Error fetching Carriers with ID ${id}:`, error);
          alert(`Error fetching Carriers: ${error.message}`);
        }
      );
    }

    populateForm() {
      this.myForm.patchValue({
        jobTitle: this.selectedCarriers.jobTitle,
        jobRole: this.selectedCarriers.jobRole,
        jobDuration: this.selectedCarriers.jobDuration,
        jobLocation: this.selectedCarriers.jobLocation,
        jobSkills: this.selectedCarriers.jobSkills,
        jobExperience: this.selectedCarriers.jobExperience,
        jobType: this.selectedCarriers.jobType,
        jobPreference: this.selectedCarriers.jobPreference,
        jobDescription: this.selectedCarriers.jobDescription,
        jobSalary: this.selectedCarriers.jobSalary
      });
    }

    updateCarriers() {

      this.selectedCarriers.jobTitle = this.myForm.value.jobTitle;
      this.selectedCarriers.jobRole = this.myForm.value.jobRole;
      this.selectedCarriers.jobDuration = this.myForm.value.jobDuration;
      this.selectedCarriers.jobLocation = this.myForm.value.jobLocation;
      this.selectedCarriers.jobSkills = this.myForm.value.jobSkills;
      this.selectedCarriers.jobExperience = this.myForm.value.jobExperience;
      this.selectedCarriers.jobType = this.myForm.value.jobType;
      this.selectedCarriers.jobPreference = this.myForm.value.jobPreference;
      this.selectedCarriers.jobDescription = this.myForm.value.jobDescription;
      this.selectedCarriers.jobSalary = this.myForm.value.jobSalary;


      this.carriersService.put('carriers', this.selectedCarriers._id, this.selectedCarriers).subscribe(
        () => {
          alert('Career updated successfully');
          this.router.navigate(['/admin/carriers']);
        },
        (error) => {
          console.error('Error updating Career:', error);
          alert(`Error updating Career: ${error.message}`);
        }
      );
    }

}
