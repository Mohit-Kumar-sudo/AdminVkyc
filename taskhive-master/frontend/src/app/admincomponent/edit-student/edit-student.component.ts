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
  selector: 'app-edit-student',
  templateUrl: './edit-student.component.html',
  styleUrl: './edit-student.component.scss'
})
export class EditStudentComponent implements OnInit, OnDestroy {
env: string = environment.url;
  selectedStudent: any = {};
  myForm!: FormGroup;

  // preview local file
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
    private studentService: ApiService,
    private fb: FormBuilder,
    private fileServ: FileService,
    private alertService: AlertService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.myForm = this.fb.group({
      image: [null],
      name: ['', Validators.required],
      company: ['', Validators.required],
      college: ['', [Validators.required, Validators.maxLength(600)]],
    });
  }

  ngOnInit() {
    const studentId = this.route.snapshot.paramMap.get('id');
    if (studentId) {
      this.fetchStudentById(studentId);
    } else {
      console.error('Student Member ID is undefined on initialization');
      this.showError('Error: Student Member ID is undefined on initialization');
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

  fetchStudentById(id: string) {
    this.fetchSub = this.studentService.get(`students/${id}`, {}).subscribe(
      (res: any) => {
        if (res && res.data && res.data._id) {
          this.selectedStudent = res.data;

          // normalize existing image path
          if (this.selectedStudent.image && !this.selectedStudent.image.startsWith('http')) {
            this.selectedStudent.image = this.selectedStudent.image.replace(/\\/g, '/');
          }

          this.populateForm();

          // keep uploadedImagePath set to current image so update sends it if user doesn't change
          this.uploadedImagePath = this.selectedStudent.image || null;
        } else {
          console.error('Student Member data does not contain an _id:', res);
          this.showError('Error: Student Member data is missing an ID.');
        }
      },
      (error) => {
        console.error(`Error fetching Student Member with ID ${id}:`, error);
        this.showError(`Error fetching Student Member: ${error?.message || error}`);
      }
    );
  }

  populateForm() {
    this.myForm.patchValue({
      name: this.selectedStudent.name || '',
      company: this.selectedStudent.company || '',
      college: this.selectedStudent.college || '',
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

    // merge form values to selectedStudent
    this.selectedStudent.name = this.myForm.value.name;
    this.selectedStudent.company = this.myForm.value.company;
    this.selectedStudent.college = this.myForm.value.college;

    // If a new image was selected but not uploaded yet -> upload first
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
            this.uploadedImagePath = imagePath.replace(/\\/g, '/');
            this.selectedStudent.image = this.uploadedImagePath;
            // automatically continue to update after upload finishes
            this.updateStudent();
          } else {
            console.error('Image upload response does not contain a valid path');
            this.showError('Error: Image upload failed.');
          }
        }
      });

      return;
    }

    // no new image selected (or already uploaded) => update directly
    this.updateStudent();
  }

  updateStudent() {
    // ensure correct image path is present
    if (this.uploadedImagePath) {
      this.selectedStudent.image = this.uploadedImagePath;
    }

    if (!this.selectedStudent._id) {
      console.error('Missing Student id for update', this.selectedStudent);
      this.showError('Error: Missing Student id.');
      return;
    }

    if (this.isLoading) return; // prevent double submits

    this.isLoading = true;

    this.updateSub = this.studentService.put('students', this.selectedStudent._id, this.selectedStudent).pipe(
      timeout(10000),
      catchError(err => {
        return throwError(err);
      }),
      finalize(() => {
        this.isLoading = false;
      })
    ).subscribe(
      (res: any) => {
        this.showSuccess('Student Member updated successfully');
        alert('Student Member updated successfully');
        this.router.navigate(['/admin/students']);
      },
      (error) => {
        const errMsg = (error?.name === 'TimeoutError') ?
          'Server is taking too long to respond. Please try again later.' :
          (error?.message || 'Error updating Student Member');
        console.error('Error updating Student Member:', error);
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
          this.selectedStudent.image = this.uploadedImagePath;
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
      this.uploadedImagePath = this.selectedStudent?.image || null;
      this.myForm.patchValue({ image: this.uploadedImagePath });
      this.myForm.get('image')?.updateValueAndValidity();
    }
  }
}
