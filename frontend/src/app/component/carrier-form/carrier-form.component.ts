import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CarrierForm, CarrierQueryService } from '../../services/carrier-query/carrier-query.service';
import { FileService } from '../../services/file/file.service';
import { HttpEventType } from '@angular/common/http';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-carrier-form',
  templateUrl: './carrier-form.component.html',
  styleUrls: ['./carrier-form.component.scss']
})
export class CarrierFormComponent implements OnInit {
  applicationForm!: FormGroup;
  selectedFile: File | null = null;
  selectedFileName: string | null = null;
  isSubmitting = false;
  uploadProgress: number | null = null;
  uploadError: string | null = null;

  constructor(
    private fb: FormBuilder,
    private carrierQueryService: CarrierQueryService,
    private fileService: FileService
  ) {}

  ngOnInit(): void {
    this.applicationForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      countryCode: ['+91'],
      number: ['', [Validators.required, Validators.pattern(/^[0-9]{10}$/)]],
      linkedin: [''],
      category: ['IT'],
      experience: ['', Validators.required],
      resume: ['']
    });
  }

  onFileSelected(event: any): void {
    const file: File = event.target.files[0];
    if (file) {
      // Reset upload state
      this.uploadProgress = null;
      this.uploadError = null;
      
      // Check file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        this.uploadError = 'File size should not exceed 5MB';
        return;
      }
      
      // Check file type
      const allowedTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      ];
      
      if (!allowedTypes.includes(file.type)) {
        this.uploadError = 'Only PDF and Word documents are allowed';
        return;
      }
      
      this.selectedFile = file;
      this.selectedFileName = file.name;
    }
  }

  async submitApplication(): Promise<void> {
    if (this.applicationForm.invalid) {
      this.markFormGroupTouched(this.applicationForm);
      return;
    }

    if (this.isSubmitting) return;
    this.isSubmitting = true;
    this.uploadError = null;

    try {
      let resumePath = '';
      
      // Upload file if selected
      if (this.selectedFile) {
        try {
          const uploadResponse: any = await this.uploadFile(this.selectedFile);
          resumePath = uploadResponse.file.path || uploadResponse.fileName;
          //console.log(uploadResponse.file.path);
        } catch (error) {
          console.error('File upload error:', error);
          this.uploadError = 'File upload failed. Please try again.';
          throw error;
        }
      }

      // Prepare form data
      const formData: CarrierForm = {
        ...this.applicationForm.value,
        resume: resumePath
      };

      // Submit form
      this.carrierQueryService.onCarrierFormSave(formData).subscribe({
        next: (response) => {
          alert('Application submitted successfully!');
          this.resetForm();
        },
        error: (error) => {
          console.error('Submission error:', error);
          this.uploadError = 'Submission failed. Please try again.';
        }
      });

    } catch (error) {
      console.error('Error:', error);
    } finally {
      this.isSubmitting = false;
    }
  }

  private uploadFile(file: File): Promise<any> {
    return new Promise((resolve, reject) => {
      this.uploadProgress = 0;
      
      this.fileService.uploadFile(file).pipe(
        finalize(() => this.uploadProgress = null)
      ).subscribe({
        next: (event: any) => {
          if (event.type === HttpEventType.UploadProgress) {
            this.uploadProgress = Math.round(100 * event.loaded / event.total);
          } else if (event.type === HttpEventType.Response) {
            resolve(event.body);
          }
        },
        error: (error) => {
          reject(error);
          this.uploadError = 'Upload failed. Please try again.';
        }
      });
    });
  }

  private markFormGroupTouched(formGroup: FormGroup) {
    Object.values(formGroup.controls).forEach(control => {
      control.markAsTouched();

      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }

  resetForm(): void {
    this.applicationForm.reset({
      countryCode: '+91',
      category: 'IT'
    });
    this.selectedFile = null;
    this.selectedFileName = null;
    this.uploadProgress = null;
    this.uploadError = null;
    this.isSubmitting = false;
  }
}