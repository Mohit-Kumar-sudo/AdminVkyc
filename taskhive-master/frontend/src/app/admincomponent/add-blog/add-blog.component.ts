import { HttpEventType } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AlertService } from '../../services/alert/alert.service';
import { ApiService } from '../../services/api/api.service';
import { FileService } from '../../services/file/file.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-add-blog',
  templateUrl: './add-blog.component.html',
  styleUrls: ['./add-blog.component.scss']
})
export class AddBlogComponent implements OnInit {
  myForm!: FormGroup;
  isLoading = false;

  // local file(s) chosen (for preview)
  image: File[] = [];

  // upload state
  uploading = false;
  uploadProgress = 0; // 0..100
  uploadedImagePath: string | null = null; // path returned by server after upload
  private uploadSub?: Subscription;

  constructor(
    private fb: FormBuilder,
    private fileServ: FileService,
    private api: ApiService,
    private as: AlertService,
    private route: Router
  ) {
    this.myForm = this.fb.group({
      image: [null, Validators.required],
      title: ['', Validators.required],
      description: ['', [Validators.required, Validators.maxLength(1500)]],
    });
  }

  ngOnInit() {}

  // Called when user clicks Add — at this point image is already uploaded (if user selected one earlier)
  uploadImage(frm: FormGroup) {
    // If image already uploaded (we have uploadedImagePath) -> submit directly
    if (this.uploadedImagePath) {
      this.myForm.patchValue({ image: this.uploadedImagePath });
      this.onSubmit(frm);
      return;
    }

    // If user selected a file but for some reason we haven't uploaded yet -> upload now
    if (this.image.length > 0 && !this.uploading) {
      this.uploading = true;
      this.uploadProgress = 0;
      const file = this.image[0];

      // start upload
      this.uploadSub = this.fileServ.uploadFile(file).subscribe(
        (event: any) => {
          if (event.type === HttpEventType.UploadProgress && event.total) {
            // Calculate and show the % done
            this.uploadProgress = Math.round((event.loaded / event.total) * 100);
          } else if (event.type === HttpEventType.Response) {
            this.uploading = false;
            const body: any = event.body;
            const imagePath = body?.file?.path || body?.path || null;
            if (imagePath) {
              this.uploadedImagePath = imagePath;
              this.myForm.patchValue({ image: imagePath });
              this.onSubmit(frm);
            } else {
              this.as.errorToast('Upload succeeded but server did not return image path.');
            }
          }
        },
        (error) => {
          this.uploading = false;
          this.isLoading = false;
          this.uploadProgress = 0;
          this.as.errorToast(`Error uploading image: ${error?.message || error}`);
        }
      );
    } else {
      // nothing selected
      this.as.warningToast('Please select an image');
    }
  }

  onSubmit(frm: FormGroup) {
    if (!frm.valid) {
      this.as.warningToast('Please fill required fields');
      return;
    }

    this.isLoading = true;
    this.api.post('blogs', frm.value).subscribe(
      (res: any) => {
        this.isLoading = false;
        if (res) {
          this.as.successToast('Blog created successfully!');
          alert('Blog created successfully!');
          this.route.navigate(['/admin/blogs']);
          // optional browser alert removed for better UX (you can keep it if you want)
        } else {
          // handle server-side error shape defensively
          const msg = res?.error?.message || 'Unknown error creating blog';
          this.as.warningToast(msg);
        }
      },
      (error) => {
        this.isLoading = false;
        this.as.errorToast(error?.message || 'Error creating blog');
      }
    );
  }

  // When user selects image — upload right away
  onSelect(event: any): void {
    const file: File = event.addedFiles[0];
    if (!file) return;

    // reset previous upload state
    this.image = [file];
    this.uploadProgress = 0;
    this.uploading = true;
    this.uploadedImagePath = null;

    // start upload immediately so submit is fast later
    this.uploadSub = this.fileServ.uploadFile(file).subscribe(
      (event: any) => {
        if (event.type === HttpEventType.UploadProgress && event.total) {
          this.uploadProgress = Math.round((event.loaded / event.total) * 100);
        } else if (event.type === HttpEventType.Response) {
          this.uploading = false;
          const body: any = event.body;
          const imagePath = body?.file?.path || body?.path || null;
          if (imagePath) {
            this.uploadedImagePath = imagePath;
            this.myForm.patchValue({ image: imagePath });
            this.myForm.get('image')?.updateValueAndValidity();
            this.as.successToast('Image uploaded');
          } else {
            this.as.warningToast('Image uploaded but response missing path');
          }
        }
      },
      (error) => {
        this.uploading = false;
        this.uploadProgress = 0;
        this.as.errorToast(`Image upload failed: ${error?.message || error}`);
      }
    );
  }

  onRemove(file: File): void {
    if (this.image.includes(file)) {
      // cancel ongoing upload if any
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
}