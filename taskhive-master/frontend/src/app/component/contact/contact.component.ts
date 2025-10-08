import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ContactService } from '../../services/contact/contact.service';
import { SsrService } from '../../services/ssr/ssr.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-contact',
  templateUrl: './contact.component.html',
  styleUrl: './contact.component.scss'
})
export class ContactComponent implements OnInit {
  myForm!: FormGroup;
  isLoading = false;

  constructor(
    private fb: FormBuilder,
    private _contactService: ContactService,
    private ssrService: SsrService
  ) {}

  async ngOnInit() {
    this.myForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      countryCode: ['', Validators.required],
      number: ['', Validators.required],
      message: ['', Validators.required]
    });

    if (this.ssrService.isBrowser()) {
      const AOS = await this.ssrService.loadAOS();
      AOS.init({
        offset: 200,
        duration: 1000,
        easing: 'ease',
        delay: 100,
        once: true
      });
    }
  }

  onSubmit() {
    if (this.myForm.valid) {
      this.isLoading = true;
      this._contactService.onContactSave(this.myForm.value).subscribe(
        (response) => {
          console.log(response);
          Swal.fire({
            title: 'Success!',
            text: 'Thank you for contacting us. We will get back to you soon.',
            icon: 'success',
            confirmButtonText: 'OK'
          });
          this.myForm.reset();
          this.isLoading = false;
        },
        (error) => {
          console.error(error);
          Swal.fire({
            title: 'Error!',
            text: 'Error sending contact data. Please try again.',
            icon: 'error',
            confirmButtonText: 'OK'
          });
          this.isLoading = false;
        }
      );
    } else {
      Swal.fire({
        title: 'Validation Error!',
        text: 'Please fill all the required fields.',
        icon: 'warning',
        confirmButtonText: 'OK'
      });
      this.isLoading = false;
    }
  }
}
