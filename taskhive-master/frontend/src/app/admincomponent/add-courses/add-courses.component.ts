import { Component, OnInit, OnDestroy } from '@angular/core';
import { HttpEventType } from '@angular/common/http';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AlertService } from '../../services/alert/alert.service';
import { ApiService } from '../../services/api/api.service';
import { FileService } from '../../services/file/file.service';
import { Subscription, throwError } from 'rxjs';
import { timeout, finalize, catchError } from 'rxjs/operators';

@Component({
  selector: 'app-add-courses',
  templateUrl: './add-courses.component.html',
  styleUrls: ['./add-courses.component.scss']
})
export class AddCoursesComponent implements OnInit, OnDestroy {
  myForm!: FormGroup;
  isLoading = false;

  // local file(s) chosen for preview
  image: File[] = [];
  image1: File[] = [];

  // upload state
  uploading = false;
  uploading1 = false;
  uploadProgress = 0; // 0..100
  uploadProgress1 = 0; // 0..100
  uploadedImagePath: string | null = null;
  uploadedImage1Path: string | null = null;
  private uploadSub?: Subscription;
  private uploadSub1?: Subscription;
  private postSub?: Subscription;

  // Time options for dropdowns
  hours: string[] = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12'];
  sessions: string[] = ['AM', 'PM'];

  constructor(
    private fb: FormBuilder,
    private fileServ: FileService,
    private _courseService: ApiService,
    private as: AlertService,
    private route: Router
  ) {
    this.initializeForm();
  }

  ngOnInit() {}

  ngOnDestroy() {
    if (this.uploadSub) this.uploadSub.unsubscribe();
    if (this.uploadSub1) this.uploadSub1.unsubscribe();
    if (this.postSub) this.postSub.unsubscribe();
  }

  initializeForm() {
    this.myForm = this.fb.group({
      // Existing fields
      image: [null, Validators.required],
      image1: [null], // Optional second image
      title: ['', Validators.required],
      skill: [''],
      duration: [''],
      price: [''],
      heading: [''],
      heading0: [''],
      heading1: [''],
      description: [''],
      description0: [''],
      description1: [''],

      // New fields from model
      tdescription: [''],
      pointer: [''],
      pointer0: [''],
      pointer1: [''],
      pointer2: [''],
      pointer3: [''],
      pointer4: [''],
      pointer5: [''],
      pointer6: [''],
      pointer7: [''],
      pointer8: [''],
      pointer9: [''],
      cdate: [''],
      ctime: [''],
      chour: [''],
      csession: [''],
      status: [''],

      // ADD THESE NEW FIELDS:
      has_sale: [false],
      original_price: [''],
      sale_end_date: [''],
    });
    this.setupSaleValidators();
  }

  // ADD THIS NEW METHOD:
setupSaleValidators() {
  this.myForm.get('has_sale')?.valueChanges.subscribe(hasSale => {
    const originalPriceControl = this.myForm.get('original_price');
    const saleEndDateControl = this.myForm.get('sale_end_date');
    
    if (hasSale) {
      originalPriceControl?.setValidators([Validators.required, Validators.min(0)]);
      saleEndDateControl?.setValidators([Validators.required, this.futureDateValidator()]);
    } else {
      originalPriceControl?.clearValidators();
      saleEndDateControl?.clearValidators();
    }
    
    originalPriceControl?.updateValueAndValidity();
    saleEndDateControl?.updateValueAndValidity();
  });
}

// ADD THIS CUSTOM VALIDATOR:
futureDateValidator() {
  return (control: any) => {
    if (!control.value) return null;
    
    const selectedDate = new Date(control.value);
    const now = new Date();
    
    if (selectedDate <= now) {
      return { pastDate: true };
    }
    return null;
  };
}

  // Called by the form submit button. If image already uploaded, submit fast.
  uploadImage(frm: FormGroup) {
    // mark touched to show validation errors immediately
    frm.markAllAsTouched();

    if (!frm.valid) {
      this.as?.warningToast?.('Please fill all required fields');
      return;
    }

    // If we already uploaded the images earlier, just submit
    if (this.uploadedImagePath) {
      this.myForm.patchValue({ image: this.uploadedImagePath });
      
      // If second image was uploaded, include it too
      if (this.uploadedImage1Path) {
        this.myForm.patchValue({ image1: this.uploadedImage1Path });
      }
      
      this.onSubmit(frm);
      return;
    }

    // If an image is selected but not uploaded yet, upload now
    if (this.image.length > 0 && !this.uploading) {
      this.uploadMainImage(frm);
    } else {
      // no image selected
      this.as?.warningToast?.('Please select an image');
    }
  }

  uploadMainImage(frm: FormGroup) {
    this.uploading = true;
    this.uploadProgress = 0;
    const file = this.image[0];

    this.uploadSub = this.fileServ.uploadFile(file).pipe(
      catchError(err => {
        this.uploading = false;
        this.uploadProgress = 0;
        this.as?.errorToast?.(`Image upload failed: ${err?.message || err}`);
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
          this.uploadedImagePath = imagePath;
          this.myForm.patchValue({ image: imagePath });
          this.myForm.get('image')?.updateValueAndValidity();
          this.as?.successToast?.('Main image uploaded');
          
          // If second image exists, upload it too, then submit
          if (this.image1.length > 0) {
            this.uploadSecondImage(frm);
          } else {
            this.onSubmit(frm);
          }
        } else {
          this.as?.warningToast?.('Upload succeeded but server did not return image path.');
        }
      }
    });
  }

  uploadSecondImage(frm: FormGroup) {
    this.uploading1 = true;
    this.uploadProgress1 = 0;
    const file = this.image1[0];

    this.uploadSub1 = this.fileServ.uploadFile(file).pipe(
      catchError(err => {
        this.uploading1 = false;
        this.uploadProgress1 = 0;
        this.as?.errorToast?.(`Second image upload failed: ${err?.message || err}`);
        return throwError(err);
      }),
      finalize(() => {
        this.uploading1 = false;
      })
    ).subscribe((event: any) => {
      if (event.type === HttpEventType.UploadProgress && event.total) {
        this.uploadProgress1 = Math.round((event.loaded / event.total) * 100);
      } else if (event.type === HttpEventType.Response) {
        const body: any = event.body;
        const imagePath = body?.file?.path || body?.path || null;
        if (imagePath) {
          this.uploadedImage1Path = imagePath;
          this.myForm.patchValue({ image1: imagePath });
          this.myForm.get('image1')?.updateValueAndValidity();
          this.as?.successToast?.('Second image uploaded');
        } else {
          this.as?.warningToast?.('Second image upload succeeded but server did not return image path.');
        }
        // Submit regardless of second image success
        this.onSubmit(frm);
      }
    });
  }

  onSubmit(frm: FormGroup) {
    // ensure form touched / validated
    frm.markAllAsTouched();

    if (!frm.valid) {
      this.as?.warningToast?.('Please fill all required fields');
      return;
    }

    if (this.isLoading) return; // prevent double-submits

    this.isLoading = true;

    // set a timeout so the UI doesn't hang forever (10s here)
    this.postSub = this._courseService.post('courses', frm.value).pipe(
      timeout(10000),
      catchError(err => {
        // rethrow so subscriber error handler runs
        return throwError(err);
      }),
      finalize(() => {
        this.isLoading = false;
      })
    ).subscribe(
      () => {
        this.as?.successToast?.('Course added successfully');
        alert('Course added successfully');
        this.route.navigate(['/admin/courses']);
      },
      (error) => {
        const errMsg = (error?.name === 'TimeoutError') ?
          'Server is taking too long to respond. Please try again later.' :
          (error?.message || 'Error adding course');
        this.as?.errorToast?.(errMsg);
      }
    );
  }

  // Upload as soon as user selects main image file
  onSelect(event: any): void {
    const file: File = event.addedFiles[0];
    if (!file) return;

    // reset previous
    this.image = [file];
    this.uploading = true;
    this.uploadProgress = 0;
    this.uploadedImagePath = null;
    this.myForm.patchValue({ image: null });
    this.myForm.get('image')?.updateValueAndValidity();

    // start immediate upload
    this.uploadSub = this.fileServ.uploadFile(file).pipe(
      catchError(err => {
        this.uploading = false;
        this.uploadProgress = 0;
        this.as?.errorToast?.(`Image upload failed: ${err?.message || err}`);
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
          this.uploadedImagePath = imagePath;
          this.myForm.patchValue({ image: imagePath });
          this.myForm.get('image')?.updateValueAndValidity();
          this.as?.successToast?.('Main image uploaded');
        } else {
          this.as?.warningToast?.('Upload succeeded but response missing path');
        }
      }
    });
  }

  // Upload as soon as user selects second image file
  onSelect1(event: any): void {
    const file: File = event.addedFiles[0];
    if (!file) return;

    // reset previous
    this.image1 = [file];
    this.uploading1 = true;
    this.uploadProgress1 = 0;
    this.uploadedImage1Path = null;
    this.myForm.patchValue({ image1: null });
    this.myForm.get('image1')?.updateValueAndValidity();

    // start immediate upload
    this.uploadSub1 = this.fileServ.uploadFile(file).pipe(
      catchError(err => {
        this.uploading1 = false;
        this.uploadProgress1 = 0;
        this.as?.errorToast?.(`Second image upload failed: ${err?.message || err}`);
        return throwError(err);
      }),
      finalize(() => {
        this.uploading1 = false;
      })
    ).subscribe((event: any) => {
      if (event.type === HttpEventType.UploadProgress && event.total) {
        this.uploadProgress1 = Math.round((event.loaded / event.total) * 100);
      } else if (event.type === HttpEventType.Response) {
        const body: any = event.body;
        const imagePath = body?.file?.path || body?.path || null;
        if (imagePath) {
          this.uploadedImage1Path = imagePath;
          this.myForm.patchValue({ image1: imagePath });
          this.myForm.get('image1')?.updateValueAndValidity();
          this.as?.successToast?.('Second image uploaded');
        } else {
          this.as?.warningToast?.('Second image upload succeeded but response missing path');
        }
      }
    });
  }

  onRemove(file: File): void {
    if (this.image.includes(file)) {
      if (this.uploadSub) {
        this.uploadSub.unsubscribe();
        this.uploadSub = undefined;
      }

      this.image = [];
      this.uploading = false;
      this.uploadProgress = 0;
      this.uploadedImagePath = null;
      this.myForm.patchValue({ image: null });
      this.myForm.get('image')?.updateValueAndValidity();
    }
  }

  onRemove1(file: File): void {
    if (this.image1.includes(file)) {
      if (this.uploadSub1) {
        this.uploadSub1.unsubscribe();
        this.uploadSub1 = undefined;
      }

      this.image1 = [];
      this.uploading1 = false;
      this.uploadProgress1 = 0;
      this.uploadedImage1Path = null;
      this.myForm.patchValue({ image1: null });
      this.myForm.get('image1')?.updateValueAndValidity();
    }
  }
}