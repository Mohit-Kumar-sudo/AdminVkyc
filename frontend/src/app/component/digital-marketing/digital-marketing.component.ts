import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CourseService } from '../../services/course/course.service';

@Component({
  selector: 'app-digital-marketing',
  templateUrl: './digital-marketing.component.html',
  styleUrl: './digital-marketing.component.scss'
})
export class DigitalMarketingComponent {
  myForm!: FormGroup;
  isLoading=false;
  constructor(private fb: FormBuilder, private _courseService:CourseService) {}
  ngOnInit() {
    this.myForm = this.fb.group({
     email: ['', [Validators.required, Validators.email]],
     name: ['', Validators.required],
     countryCode: ['', Validators.required],
     number: ['', [Validators.required, Validators.pattern('^[0-9]{10}$')]],
     course: ['', Validators.required],
     price: [{ value: '499', disabled: true }, Validators.required],
    });
 }

 onSubmit() {
   if (this.myForm.valid) {
     this.isLoading = true;

     // Enable price field before submitting
     this.myForm.get('price')?.enable();

     this._courseService.onCourseSave(this.myForm.value).subscribe(
       (response) => {
         console.log(response);
         alert("Thank you for contacting us. We will get back to you soon.");
         this.myForm.reset();
         this.isLoading = false;

         // Re-disable price after submission
         this.myForm.get('price')?.disable();
       },
       (error) => {
         console.error(error);
         alert("Error sending contact data. Please try again.");
         this.isLoading = false;

         // Re-disable price even if there's an error
         this.myForm.get('price')?.disable();
       }
     );
   } else {
     alert("Please fill all the fields");
     this.isLoading = false;
   }
 }
}
