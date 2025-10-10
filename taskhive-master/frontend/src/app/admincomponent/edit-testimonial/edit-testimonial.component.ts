import { Component, OnInit, OnDestroy } from '@angular/core';
import { HttpEventType } from '@angular/common/http';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { ApiService } from '../../services/api/api.service';
import { FileService } from '../../services/file/file.service';
import { AlertService } from '../../services/alert/alert.service';
import { environment } from '../../../environments/environment';
import { Subscription, throwError } from 'rxjs';
import { timeout, finalize, catchError } from 'rxjs/operators';

@Component({
  selector: 'app-edit-testimonial',
  templateUrl: './edit-testimonial.component.html',
  styleUrls: ['./edit-testimonial.component.scss']
})
export class EditTestimonialComponent implements OnInit, OnDestroy {
  env: string = environment.url;
  selectedTestimonial: any = {};
  myForm!: FormGroup;

  // local preview file (only one image)
  image: File[] = [];

  // upload state
  uploading = false;
  uploadProgress = 0; // 0..100
  uploadedImagePath: string | null = null;

  // submit state
  isLoading = false;

  private uploadSub?: Subscription;
  private fetchSub?: Subscription;
  private updateSub?: Subscription;

  constructor(
    private testimonialService: ApiService,
    private fb: FormBuilder,
    private fileServ: FileService,
    private alertService: AlertService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.myForm = this.fb.group({
      image: [null], // allow null initially, validation handled on submit
      name: ['', Validators.required],
      profession: ['', Validators.required],
      comment: ['', [Validators.required, Validators.maxLength(600)]],
      rating: ['', Validators.required],
    });
  }

  ngOnInit() {
    const testimonialId = this.route.snapshot.paramMap.get('id');
    if (testimonialId) {
      this.fetchTestimonialById(testimonialId);
    } else {
      console.error('Testimonial ID is undefined on initialization');
      this.showError('Error: Testimonial ID is undefined on initialization');
    }
  }

  ngOnDestroy() {
    this.uploadSub?.unsubscribe();
    this.fetchSub?.unsubscribe();
    this.updateSub?.unsubscribe();
  }

  // Helper wrappers to use AlertService if available, otherwise fallback to alert()
  private showSuccess(msg: string) {
    try {
      if (this.alertService && typeof this.alertService.successToast === 'function') {
        this.alertService.successToast(msg);
      } else {
        alert(msg);
      }
    } catch {
      alert(msg);
    }
  }

  private showWarning(msg: string) {
    try {
      if (this.alertService && typeof this.alertService.warningToast === 'function') {
        this.alertService.warningToast(msg);
      } else {
        alert(msg);
      }
    } catch {
      alert(msg);
    }
  }

  private showError(msg: string) {
    try {
      if (this.alertService && typeof this.alertService.errorToast === 'function') {
        this.alertService.errorToast(msg);
      } else {
        alert(msg);
      }
    } catch {
      alert(msg);
    }
  }

  fetchTestimonialById(id: string) {
    this.fetchSub = this.testimonialService.get(`testimonials/${id}`, {}).subscribe(
      (res: any) => {
        if (res && res.data && res.data._id) {
          this.selectedTestimonial = res.data;

          // Normalize image path slashes for display if needed
          if (this.selectedTestimonial.image && !this.selectedTestimonial.image.startsWith('http')) {
            this.selectedTestimonial.image = this.selectedTestimonial.image.replace(/\\/g, '/');
          }

          this.populateForm();

          // set uploadedImagePath so update can send the existing path if user doesn't change
          this.uploadedImagePath = this.selectedTestimonial.image || null;
        } else {
          console.error('Testimonial data does not contain an _id:', res);
          this.showError('Error: Testimonial data is missing an ID.');
        }
      },
      (error) => {
        console.error(`Error fetching Testimonial with ID ${id}:`, error);
        this.showError(`Error fetching Testimonial: ${error?.message || error}`);
      }
    );
  }

  populateForm() {
    this.myForm.patchValue({
      name: this.selectedTestimonial.name || '',
      profession: this.selectedTestimonial.profession || '',
      comment: this.selectedTestimonial.comment || '',
      rating: this.selectedTestimonial.rating || '',
      image: null
    });
  }

  // Called when user clicks Update — handles validation & possibly uploads first
  uploadImage() {
    // mark fields touched to show validation errors
    this.myForm.markAllAsTouched();

    if (!this.myForm.valid) {
      this.showWarning('Please fill all required fields');
      return;
    }

    // merge form values to selectedTestimonial
    this.selectedTestimonial.name = this.myForm.value.name;
    this.selectedTestimonial.profession = this.myForm.value.profession;
    this.selectedTestimonial.comment = this.myForm.value.comment;
    this.selectedTestimonial.rating = this.myForm.value.rating;

    // If a new image was selected but not uploaded -> upload first
    if (this.image.length > 0 && !this.uploadedImagePath) {
      this.uploading = true;
      this.uploadProgress = 0;
      const file = this.image[0];

      this.uploadSub = this.fileServ.uploadFile(file).pipe(
        catchError(err => {
          this.uploading = false;
          this.uploadProgress = 0;
          this.showError(`Image upload failed: ${err?.message || err}`);
          return throwError(err);
        }),
        finalize(() => {
          this.uploading = false;
        })
      ).subscribe((event: any) => {
        if (event.type === HttpEventType.UploadProgress && event.total) {
          this.uploadProgress = Math.round((event.loaded / event.total) * 100);
        } else if (event.type === HttpEventType.Response) {
          const body: any = event.body;
          const imagePath = body?.file?.path || body?.path || null;
          if (imagePath) {
            const normalized = imagePath.replace(/\\/g, '/');
            this.uploadedImagePath = normalized;
            this.selectedTestimonial.image = normalized;
            // automatically proceed to update once upload finishes
            this.updateTestimonial();
          } else {
            console.error('Image upload response does not contain a valid path');
            this.showError('Error: Image upload failed.');
          }
        }
      });

      return;
    }

    // no new image selected (or already uploaded) => update directly
    this.updateTestimonial();
  }

  updateTestimonial() {
    // ensure correct image path is present
    if (this.uploadedImagePath) {
      this.selectedTestimonial.image = this.uploadedImagePath;
    }

    if (!this.selectedTestimonial._id) {
      console.error('Missing testimonial id for update', this.selectedTestimonial);
      this.showError('Error: Missing testimonial id.');
      return;
    }

    if (this.isLoading) return; // prevent double submits

    this.isLoading = true;

    this.updateSub = this.testimonialService.put('testimonials', this.selectedTestimonial._id, this.selectedTestimonial).pipe(
      timeout(10000),
      catchError(err => {
        return throwError(err);
      }),
      finalize(() => {
        this.isLoading = false;
      })
    ).subscribe(
      (res: any) => {
        this.showSuccess('Testimonial updated successfully');
        alert('Testimonial updated successfully');
        this.router.navigate(['/admin/testimonials']);
      },
      (error) => {
        const errMsg = (error?.name === 'TimeoutError') ?
          'Server is taking too long to respond. Please try again later.' :
          (error?.message || 'Error updating testimonial');
        console.error('Error updating Testimonial:', error);
        this.showError(errMsg);
      }
    );
  }

  // Upload immediately on selection (preferred)
  onSelect(event: any): void {
    const file: File = event.addedFiles[0];
    if (!file) return;

    // set preview and reset uploaded path
    this.image = [file];
    this.uploading = true;
    this.uploadProgress = 0;
    this.uploadedImagePath = null;
    this.myForm.patchValue({ image: null });
    this.myForm.get('image')?.updateValueAndValidity();

    // Start upload immediately so Update is fast later
    this.uploadSub = this.fileServ.uploadFile(file).pipe(
      catchError(err => {
        this.uploading = false;
        this.uploadProgress = 0;
        this.showError(`Image upload failed: ${err?.message || err}`);
        return throwError(err);
      }),
      finalize(() => {
        this.uploading = false;
      })
    ).subscribe((event: any) => {
      if (event.type === HttpEventType.UploadProgress && event.total) {
        this.uploadProgress = Math.round((event.loaded / event.total) * 100);
      } else if (event.type === HttpEventType.Response) {
        const body: any = event.body;
        const imagePath = body?.file?.path || body?.path || null;
        if (imagePath) {
          this.uploadedImagePath = imagePath.replace(/\\/g, '/');
          this.myForm.patchValue({ image: this.uploadedImagePath });
          this.selectedTestimonial.image = this.uploadedImagePath;
          this.myForm.get('image')?.updateValueAndValidity();
          this.showSuccess('Image uploaded');
        } else {
          this.showWarning('Upload succeeded but server did not return image path');
        }
      }
    });
  }

  onRemove(file: File): void {
    if (this.image.includes(file)) {
      // cancel upload if running
      this.uploadSub?.unsubscribe();
      this.uploadSub = undefined;

      this.image = [];
      this.uploading = false;
      this.uploadProgress = 0;
      this.uploadedImagePath = this.selectedTestimonial?.image || null;
      this.myForm.patchValue({ image: this.uploadedImagePath });
      this.myForm.get('image')?.updateValueAndValidity();
    }
  }
}