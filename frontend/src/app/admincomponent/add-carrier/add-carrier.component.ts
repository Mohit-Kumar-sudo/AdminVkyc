import { Component, OnInit } from '@angular/core';
import { HttpEventType } from '@angular/common/http';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AlertService } from '../../services/alert/alert.service';
import { CarriersService } from '../../services/carriers/carriers.service'; 

@Component({
  selector: 'app-add-carrier',
  templateUrl: './add-carrier.component.html',
  styleUrl: './add-carrier.component.scss'
})
export class AddCarrierComponent {
  myForm!: FormGroup;
  isLoading = false;
  image: File[] = [];

constructor(
    private carriersService: CarriersService,
    private fb: FormBuilder,
    private as: AlertService,
    private route : Router
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

  ngOnInit() {}

  onSubmit(frm: FormGroup) {
    if (frm.valid) {
      this.isLoading = true;
      this.carriersService.post('carriers', frm.value).subscribe(
        (res: any) => {
          this.isLoading = false;
          if (res) {
            this.route.navigate(['/admin/carriers']);
            this.as.successToast('Carriers created successfully!');
          } else {
            this.as.warningToast(res.error.message);
          }
        },
        (error) => {
          this.isLoading = false;
          this.as.errorToast(error.message);
        }
      );
    }
  }
  
}
