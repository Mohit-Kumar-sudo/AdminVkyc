import { HttpEventType } from '@angular/common/http';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AlertService } from '../../services/alert/alert.service';
import { ApiService } from '../../services/api/api.service';
import { FileService } from '../../services/file/file.service';
import { Subscription, throwError } from 'rxjs';
import { timeout, finalize, catchError } from 'rxjs/operators';

@Component({
  selector: 'app-add-team',
  templateUrl: './add-team.component.html',
  styleUrls: ['./add-team.component.scss']
})
export class AddTeamComponent implements OnInit, OnDestroy {
  myForm!: FormGroup;
  isLoading = false;

  // preview files chosen
  image: File[] = [];

  // upload state
  uploading = false;
  uploadProgress = 0; // 0..100
  uploadedImagePath: string | null = null;

  private uploadSub?: Subscription;
  private postSub?: Subscription;

  constructor(
    private fb: FormBuilder,
    private fileServ: FileService,
    private api: ApiService,
    private as: AlertService,
    private route : Router
  ) {
    this.myForm = this.fb.group({
      image: [null, Validators.required],
      name: ['', Validators.required],
      designation: ['', Validators.required],
      detail: ['', [Validators.required, Validators.maxLength(1500)]],
    });
  }

  ngOnInit() {}

  ngOnDestroy() {
    this.uploadSub?.unsubscribe();
    this.postSub?.unsubscribe();
  }

  // Called when user clicks Add — if image already uploaded, submit quickly
  uploadImage(frm: FormGroup) {
    // mark touched to show validation
    frm.markAllAsTouched();

    if (!frm.valid) {
      this.as?.warningToast?.('Please fill all required fields');
      return;
    }

    // If image already uploaded -> patch and submit
    if (this.uploadedImagePath) {
      this.myForm.patchValue({ image: this.uploadedImagePath });
      this.onSubmit(frm);
      return;
    }

    // If file selected but not uploaded -> upload now
    if (this.image.length > 0 && !this.uploading) {
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
            this.uploadedImagePath = imagePath.replace(/\\/g, '/');
            this.myForm.patchValue({ image: this.uploadedImagePath });
            this.myForm.get('image')?.updateValueAndValidity();
            this.as?.successToast?.('Image uploaded');
            // automatically submit now that image is uploaded
            this.onSubmit(frm);
          } else {
            this.as?.warningToast?.('Upload succeeded but server did not return image path.');
          }
        }
      });
    } else {
      this.as?.warningToast?.('Please select an image');
    }
  }

  onSubmit(frm: FormGroup) {
    if (!frm.valid) {
      this.as?.warningToast?.('Please fill all required fields');
      return;
    }

    if (this.isLoading) return; // prevent double submit

    this.isLoading = true;

    // ensure image path is sent (defensive)
    if (this.uploadedImagePath) {
      this.myForm.patchValue({ image: this.uploadedImagePath });
    }

    // add a timeout so client doesn't wait indefinitely (10s)
    this.postSub = this.api.post('teams', this.myForm.value).pipe(
      timeout(10000),
      catchError(err => {
        return throwError(err);
      }),
      finalize(() => {
        this.isLoading = false;
      })
    ).subscribe(
      (res: any) => {
        if (res) {
          this.as?.successToast?.('Team Member Added successfully!');
          // keep the browser alert if you like — toasts are preferable
          alert('Team Member Added successfully!');
          this.route.navigate(['/admin/teams']);
        } else {
          this.as?.warningToast?.(res?.error?.message || 'Error creating team member');
        }
      },
      (error) => {
        const errMsg = (error?.name === 'TimeoutError') ?
          'Server is taking too long to respond. Please try again later.' :
          (error?.message || 'Error creating team member');
        this.as?.errorToast?.(errMsg);
      }
    );
  }

  // upload immediately when user selects an image (preferred)
  onSelect(event: any): void {
    const file: File = event.addedFiles[0];
    if (!file) return;

    // reset state
    this.image = [file];
    this.uploading = true;
    this.uploadProgress = 0;
    this.uploadedImagePath = null;
    this.myForm.patchValue({ image: null });
    this.myForm.get('image')?.updateValueAndValidity();

    // start upload
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
          this.uploadedImagePath = imagePath.replace(/\\/g, '/');
          this.myForm.patchValue({ image: this.uploadedImagePath });
          this.myForm.get('image')?.updateValueAndValidity();
          this.as?.successToast?.('Image uploaded');
        } else {
          this.as?.warningToast?.('Upload succeeded but response missing path');
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
      this.uploadedImagePath = null;
      this.myForm.patchValue({ image: null });
      this.myForm.get('image')?.updateValueAndValidity();
    }
  }
}