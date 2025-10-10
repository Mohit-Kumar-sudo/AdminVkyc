import { Component, OnInit, OnDestroy } from '@angular/core';
import { HttpEventType } from '@angular/common/http';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { ApiService } from '../../services/api/api.service';
import { FileService } from '../../services/file/file.service';
import { environment } from '../../../environments/environment';
import { Subscription, throwError } from 'rxjs';
import { timeout, finalize, catchError } from 'rxjs/operators';

@Component({
  selector: 'app-edit-courses',
  templateUrl: './edit-courses.component.html',
  styleUrls: ['./edit-courses.component.scss']
})
export class EditCoursesComponent implements OnInit, OnDestroy {
  env: string = environment.url;
  selectedCourse: any = {};
  myForm!: FormGroup;
  image: File[] = [];
  image1: File[] = [];

  // upload / submit state
  uploading = false;
  uploading1 = false;
  uploadProgress = 0;
  uploadProgress1 = 0;
  uploadedImagePath: string | null = null;
  uploadedImage1Path: string | null = null;
  isLoading = false;

  // Time options for dropdowns
  hours: string[] = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12'];
  sessions: string[] = ['AM', 'PM'];

  private uploadSub?: Subscription;
  private uploadSub1?: Subscription;
  private fetchSub?: Subscription;
  private updateSub?: Subscription;

  constructor(
    private _courseService: ApiService,
    private fb: FormBuilder,
    private fileServ: FileService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.initializeForm();
  }

  private initializeForm() {
    this.myForm = this.fb.group({
      // Existing fields
      image: [null],
      image1: [null],
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
      // ADD THESE NEW FIELDS:
      has_sale: [false],
      original_price: [''],
      sale_end_date: [''],
      sale_duration_minutes: [10, [Validators.min(1), Validators.max(1440)]],

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
      status: ['']
    });
    this.setupSaleValidators();
  }

  private isBrowser(): boolean {
    return typeof window !== 'undefined';
  }

  ngOnInit() {
    const courseId = this.route.snapshot.paramMap.get('id');
    if (courseId) {
      this.fetchCourseById(courseId);
    } else {
      console.error('course ID is undefined on initialization');
      this.showError('Error: course ID is undefined on initialization');
    }
  }

  ngOnDestroy() {
    this.uploadSub?.unsubscribe();
    this.uploadSub1?.unsubscribe();
    this.fetchSub?.unsubscribe();
    this.updateSub?.unsubscribe();
  }

  private showSuccess(msg: string) {
    if (this.isBrowser()) {
      (window as any).alert ? (window as any).alert(msg) : console.log(msg);
    } else {
      console.log('[SSR SUCCESS]', msg);
    }
  }

  private showWarning(msg: string) {
    if (this.isBrowser()) {
      (window as any).alert ? (window as any).alert(msg) : console.warn(msg);
    } else {
      console.warn('[SSR WARNING]', msg);
    }
  }

  private showError(msg: string) {
    if (this.isBrowser()) {
      (window as any).alert ? (window as any).alert(msg) : console.error(msg);
    } else {
      console.error('[SSR ERROR]', msg);
    }
  }

  private setupSaleValidators() {
  this.myForm.get('has_sale')?.valueChanges.subscribe(hasSale => {
    const originalPriceControl = this.myForm.get('original_price');
    const saleDurationControl = this.myForm.get('sale_duration_minutes');
    
    if (hasSale) {
      originalPriceControl?.setValidators([Validators.required, Validators.min(0)]);
      saleDurationControl?.setValidators([Validators.required, Validators.min(1), Validators.max(1440)]);
    } else {
      originalPriceControl?.clearValidators();
      saleDurationControl?.clearValidators();
    }
    
    originalPriceControl?.updateValueAndValidity();
    saleDurationControl?.updateValueAndValidity();
  });
}

  private futureDateValidator() {
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

  fetchCourseById(id: string) {
    this.fetchSub = this._courseService.get(`courses/${id}`, {}).subscribe(
      (res: any) => {
        if (res && res.data && res.data._id) {
          this.selectedCourse = res.data;

          // Process image paths
          if (this.selectedCourse.image && !this.selectedCourse.image.startsWith('http')) {
            this.selectedCourse.image = this.selectedCourse.image.replace(/\\/g, '/');
          }
          if (this.selectedCourse.image1 && !this.selectedCourse.image1.startsWith('http')) {
            this.selectedCourse.image1 = this.selectedCourse.image1.replace(/\\/g, '/');
          }

          this.populateForm();

          // set uploadedImagePath so if no change is made we still send the existing path
          this.uploadedImagePath = this.selectedCourse.image || null;
          this.uploadedImage1Path = this.selectedCourse.image1 || null;
        } else {
          console.error('course data does not contain an _id:', res);
          this.showError('Error: course data is missing an ID.');
        }
      },
      (error) => {
        console.error(`Error fetching course with ID ${id}:`, error);
        this.showError(`Error fetching course: ${error?.message || error}`);
      }
    );
  }

  populateForm() {
    // Convert sale_end_date to datetime-local format if it exists
  let saleEndDateValue = '';
  if (this.selectedCourse.sale_end_date) {
    const date = new Date(this.selectedCourse.sale_end_date);
    // Format to datetime-local input format: YYYY-MM-DDTHH:mm
    saleEndDateValue = date.toISOString().slice(0, 16);
  }
    this.myForm.patchValue({
      title: this.selectedCourse.title,
      skill: this.selectedCourse.skill,
      duration: this.selectedCourse.duration,
      price: this.selectedCourse.price,
      // ADD THESE:
      has_sale: this.selectedCourse.has_sale || false,
      original_price: this.selectedCourse.original_price || '',
      sale_end_date: saleEndDateValue,
      sale_duration_minutes: this.selectedCourse.sale_duration_minutes || 10,

      heading: this.selectedCourse.heading,
      heading0: this.selectedCourse.heading0,
      heading1: this.selectedCourse.heading1,
      description: this.selectedCourse.description,
      description0: this.selectedCourse.description0,
      description1: this.selectedCourse.description1,
      tdescription: this.selectedCourse.tdescription,
      pointer: this.selectedCourse.pointer,
      pointer0: this.selectedCourse.pointer0,
      pointer1: this.selectedCourse.pointer1,
      pointer2: this.selectedCourse.pointer2,
      pointer3: this.selectedCourse.pointer3,
      pointer4: this.selectedCourse.pointer4,
      pointer5: this.selectedCourse.pointer5,
      pointer6: this.selectedCourse.pointer6,
      pointer7: this.selectedCourse.pointer7,
      pointer8: this.selectedCourse.pointer8,
      pointer9: this.selectedCourse.pointer9,
      cdate: this.selectedCourse.cdate,
      ctime: this.selectedCourse.ctime,
      chour: this.selectedCourse.chour,
      csession: this.selectedCourse.csession,
      status: this.selectedCourse.status,
      image: null,
      image1: null
    });
  }

  getSaleStatusText(): string {
  if (!this.myForm.get('has_sale')?.value) {
    return 'Sale is disabled';
  }
  
  const duration = this.myForm.get('sale_duration_minutes')?.value || 5;
  const originalPrice = this.myForm.get('original_price')?.value;
  const currentPrice = this.myForm.get('price')?.value;
  
  let status = `Sale active - ${duration} minute auto-renewing timer`;
  
  if (originalPrice && currentPrice) {
    const discount = Math.round(((originalPrice - currentPrice) / originalPrice) * 100);
    status += ` | ${discount}% off`;
  }
  
  return status;
}

  // Called by form submit
  uploadImage() {
    // mark touched to show validators
    this.myForm.markAllAsTouched();

    if (!this.myForm.valid) {
      this.showWarning('Please fill all required fields');
      return;
    }

    // merge form values into selectedCourse
    this.selectedCourse.title = this.myForm.value.title;
    this.selectedCourse.skill = this.myForm.value.skill;
    this.selectedCourse.duration = this.myForm.value.duration;
    this.selectedCourse.price = this.myForm.value.price;
    // ADD THESE LINES:
    this.selectedCourse.has_sale = this.myForm.value.has_sale;
    this.selectedCourse.original_price = this.myForm.value.original_price;
    // Convert datetime-local to ISO date string for backend
    if (this.myForm.value.sale_end_date) {
      this.selectedCourse.sale_end_date = new Date(this.myForm.value.sale_end_date).toISOString();
    } else {
      this.selectedCourse.sale_end_date = null;
    }

    this.selectedCourse.heading = this.myForm.value.heading;
    this.selectedCourse.heading0 = this.myForm.value.heading0;
    this.selectedCourse.heading1 = this.myForm.value.heading1;
    this.selectedCourse.description = this.myForm.value.description;
    this.selectedCourse.description0 = this.myForm.value.description0;
    this.selectedCourse.description1 = this.myForm.value.description1;
    this.selectedCourse.tdescription = this.myForm.value.tdescription;
    this.selectedCourse.pointer = this.myForm.value.pointer;
    this.selectedCourse.pointer0 = this.myForm.value.pointer0;
    this.selectedCourse.pointer1 = this.myForm.value.pointer1;
    this.selectedCourse.pointer2 = this.myForm.value.pointer2;
    this.selectedCourse.pointer3 = this.myForm.value.pointer3;
    this.selectedCourse.pointer4 = this.myForm.value.pointer4;
    this.selectedCourse.pointer5 = this.myForm.value.pointer5;
    this.selectedCourse.pointer6 = this.myForm.value.pointer6;
    this.selectedCourse.pointer7 = this.myForm.value.pointer7;
    this.selectedCourse.pointer8 = this.myForm.value.pointer8;
    this.selectedCourse.pointer9 = this.myForm.value.pointer9;
    this.selectedCourse.cdate = this.myForm.value.cdate;
    this.selectedCourse.ctime = this.myForm.value.ctime;
    this.selectedCourse.chour = this.myForm.value.chour;
    this.selectedCourse.csession = this.myForm.value.csession;
    this.selectedCourse.status = this.myForm.value.status;

    // if new main image has been selected but not uploaded yet -> upload first
    if (this.image.length > 0 && !this.uploadedImagePath) {
      this.uploadMainImage();
      return;
    }

    // if new second image has been selected but not uploaded yet -> upload first
    if (this.image1.length > 0 && !this.uploadedImage1Path) {
      this.uploadSecondImage();
      return;
    }

    // No new images — proceed to update
    this.updateCourse();
  }

  uploadMainImage() {
    this.uploading = true;
    this.uploadProgress = 0;

    const file = this.image[0];

    this.uploadSub = this.fileServ.uploadFile(file).pipe(
      catchError(err => {
        this.uploading = false;
        this.uploadProgress = 0;
        console.error('Error uploading main image:', err);
        this.showError(`Error uploading main image: ${err?.message || err}`);
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
        if (body && body.file && body.file.path) {
          const imagePath = body.file.path.replace(/\\/g, '/');
          this.uploadedImagePath = imagePath;
          this.selectedCourse.image = imagePath;
          
          // Check if second image also needs uploading
          if (this.image1.length > 0 && !this.uploadedImage1Path) {
            this.uploadSecondImage();
          } else {
            this.updateCourse();
          }
        } else {
          console.error('Main image upload response does not contain a valid path');
          this.showError('Error: Main image upload failed.');
        }
      }
    });
  }

  uploadSecondImage() {
    this.uploading1 = true;
    this.uploadProgress1 = 0;

    const file = this.image1[0];

    this.uploadSub1 = this.fileServ.uploadFile(file).pipe(
      catchError(err => {
        this.uploading1 = false;
        this.uploadProgress1 = 0;
        console.error('Error uploading second image:', err);
        this.showError(`Error uploading second image: ${err?.message || err}`);
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
        if (body && body.file && body.file.path) {
          const imagePath = body.file.path.replace(/\\/g, '/');
          this.uploadedImage1Path = imagePath;
          this.selectedCourse.image1 = imagePath;
        } else {
          console.error('Second image upload response does not contain a valid path');
          this.showError('Error: Second image upload failed.');
        }
        // Proceed to update regardless
        this.updateCourse();
      }
    });
  }

  updateCourse() {
    // ensure correct image paths are present
    if (this.uploadedImagePath) {
      this.selectedCourse.image = this.uploadedImagePath;
    }
    if (this.uploadedImage1Path) {
      this.selectedCourse.image1 = this.uploadedImage1Path;
    }

    if (!this.selectedCourse._id) {
      console.error('Missing course id for update', this.selectedCourse);
      this.showError('Error: Missing course id.');
      return;
    }

    if (this.isLoading) return; // prevent double submits

    this.isLoading = true;

    this.updateSub = this._courseService.put('courses', this.selectedCourse._id, this.selectedCourse).pipe(
      timeout(10000),
      catchError(err => {
        return throwError(err);
      }),
      finalize(() => {
        this.isLoading = false;
      })
    ).subscribe(
      (res: any) => {
        this.showSuccess('Course updated successfully');
        alert('Course updated successfully');
        this.router.navigate(['/admin/courses']);
      },
      (error) => {
        const msg = (error?.name === 'TimeoutError') ?
          'Server timed out. Please try again later.' :
          (error?.message || 'Error updating course');
        console.error('Error updating Course:', error);
        this.showError(msg);
      }
    );
  }

  // Helper method to check if sale is still active
isSaleActive(): boolean {
  const saleEndDate = this.myForm.get('sale_end_date')?.value;
  if (!saleEndDate) return false;
  
  const endDate = new Date(saleEndDate);
  const now = new Date();
  return endDate > now;
}

// Helper method to format date for display
formatDate(dateString: string): string {
  if (!dateString) return '';
  
  const date = new Date(dateString);
  return date.toLocaleString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

  // Upload immediately on selection for main image
  onSelect(event: any): void {
    const file: File = event.addedFiles[0];
    if (!file) return;

    this.image = [file];
    this.uploading = true;
    this.uploadProgress = 0;
    this.uploadedImagePath = null;
    this.myForm.patchValue({ image: null });
    this.myForm.get('image')?.updateValueAndValidity();

    this.uploadSub = this.fileServ.uploadFile(file).pipe(
      catchError(err => {
        this.uploading = false;
        this.uploadProgress = 0;
        this.showError(`Main image upload failed: ${err?.message || err}`);
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
        if (body && body.file && body.file.path) {
          const imagePath = body.file.path.replace(/\\/g, '/');
          this.uploadedImagePath = imagePath;
          this.myForm.patchValue({ image: imagePath });
          this.selectedCourse.image = imagePath;
          this.myForm.get('image')?.updateValueAndValidity();
        } else {
          console.error('Main image upload succeeded but response missing path');
          this.showError('Main image upload succeeded but server did not return image path');
        }
      }
    });
  }

  // Upload immediately on selection for second image
  onSelect1(event: any): void {
    const file: File = event.addedFiles[0];
    if (!file) return;

    this.image1 = [file];
    this.uploading1 = true;
    this.uploadProgress1 = 0;
    this.uploadedImage1Path = null;
    this.myForm.patchValue({ image1: null });
    this.myForm.get('image1')?.updateValueAndValidity();

    this.uploadSub1 = this.fileServ.uploadFile(file).pipe(
      catchError(err => {
        this.uploading1 = false;
        this.uploadProgress1 = 0;
        this.showError(`Second image upload failed: ${err?.message || err}`);
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
        if (body && body.file && body.file.path) {
          const imagePath = body.file.path.replace(/\\/g, '/');
          this.uploadedImage1Path = imagePath;
          this.myForm.patchValue({ image1: imagePath });
          this.selectedCourse.image1 = imagePath;
          this.myForm.get('image1')?.updateValueAndValidity();
        } else {
          console.error('Second image upload succeeded but response missing path');
          this.showError('Second image upload succeeded but server did not return image path');
        }
      }
    });
  }

  onRemove(file: File): void {
    if (this.image.includes(file)) {
      this.uploadSub?.unsubscribe();
      this.uploadSub = undefined;

      this.image = [];
      this.uploading = false;
      this.uploadProgress = 0;
      this.uploadedImagePath = this.selectedCourse?.image || null;
      this.myForm.patchValue({ image: this.uploadedImagePath });
      this.myForm.get('image')?.updateValueAndValidity();
    }
  }

  onRemove1(file: File): void {
    if (this.image1.includes(file)) {
      this.uploadSub1?.unsubscribe();
      this.uploadSub1 = undefined;

      this.image1 = [];
      this.uploading1 = false;
      this.uploadProgress1 = 0;
      this.uploadedImage1Path = this.selectedCourse?.image1 || null;
      this.myForm.patchValue({ image1: this.uploadedImage1Path });
      this.myForm.get('image1')?.updateValueAndValidity();
    }
  }
}