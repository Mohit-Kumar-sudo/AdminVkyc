import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { Router } from '@angular/router';
import { AlertService } from '../../services/alert/alert.service';
import { FileService } from '../../services/file/file.service';
import { ApiService } from '../../services/api/api.service';
import { HttpEventType } from '@angular/common/http';
import { Subscription, throwError } from 'rxjs';
import { timeout, finalize, catchError } from 'rxjs/operators';

@Component({
  selector: 'app-add-project',
  templateUrl: './add-project.component.html',
  styleUrls: ['./add-project.component.scss'],
})
export class AddProjectComponent implements OnInit, OnDestroy {
  projectForm: FormGroup;

  // local file objects for files currently chosen (not the uploaded paths)
  localFiles: (File | null)[] = [];

  // uploaded image paths (strings) corresponding to images FormArray indices
  uploadedImagePaths: (string | null)[] = [];

  // per-image uploading state and progress
  uploadingFlags: boolean[] = [];
  uploadProgress: number[] = [];

  // Subscriptions for uploads (so we can cancel if needed)
  private uploadSubs: (Subscription | null)[] = [];

  isLoading = false; // submission loading
  private postSub?: Subscription;

  constructor(
    private fb: FormBuilder,
    private projectService: ApiService,
    private fileService: FileService,
    private alertService: AlertService,
    private router: Router
  ) {
    this.projectForm = this.fb.group({
      name: ['', Validators.required],
      descriptions: this.fb.array([], Validators.required),
      images: this.fb.array([], Validators.required)
    });
  }

  ngOnInit(): void {
    const fetchedData = {
      name: '',
      descriptions: [''],
      images: [''],
    };

    this.projectForm.patchValue({ name: fetchedData.name });

    this.setDescriptions(fetchedData.descriptions);
    this.setImages(fetchedData.images);

    // initialize arrays based on initial images count
    this.ensureImageArrays(this.imagesArray.length);
  }

  ngOnDestroy(): void {
    // unsubscribe from any ongoing uploads
    this.uploadSubs.forEach(sub => sub?.unsubscribe());
    this.postSub?.unsubscribe();
  }

  get descriptions(): FormArray {
    return this.projectForm.get('descriptions') as FormArray;
  }

  get imagesArray(): FormArray {
    return this.projectForm.get('images') as FormArray;
  }

  // convenience helper to check if any upload is in progress
  get uploadingAny(): boolean {
    return this.uploadingFlags.some(f => f === true);
  }

  setDescriptions(descriptions: string[]) {
    descriptions.forEach(description => {
      this.descriptions.push(this.fb.control(description, Validators.required));
    });
  }

  setImages(images: string[]) {
    images.forEach(image => {
      // initialize the form control value to either existing path (string) or empty string
      this.imagesArray.push(this.fb.control(image || '', Validators.required));
    });
    this.ensureImageArrays(this.imagesArray.length);
  }

  ensureImageArrays(length: number) {
    // ensure local arrays have same length as imagesArray
    while (this.localFiles.length < length) {
      this.localFiles.push(null);
    }
    while (this.uploadedImagePaths.length < length) {
      this.uploadedImagePaths.push(null);
    }
    while (this.uploadingFlags.length < length) {
      this.uploadingFlags.push(false);
    }
    while (this.uploadProgress.length < length) {
      this.uploadProgress.push(0);
    }
    while (this.uploadSubs.length < length) {
      this.uploadSubs.push(null);
    }
  }

  addDescription() {
    this.descriptions.push(this.fb.control('', Validators.required));
  }

  removeDescription(index: number) {
    this.descriptions.removeAt(index);
  }

  addImage() {
    this.imagesArray.push(this.fb.control('', Validators.required));
    this.ensureImageArrays(this.imagesArray.length);
  }

  removeImage(index: number) {
    // cancel upload if in progress
    if (this.uploadSubs[index]) {
      this.uploadSubs[index]?.unsubscribe();
      this.uploadSubs[index] = null;
    }

    // remove local file & uploaded path
    this.localFiles.splice(index, 1);
    this.uploadedImagePaths.splice(index, 1);
    this.uploadingFlags.splice(index, 1);
    this.uploadProgress.splice(index, 1);
    this.uploadSubs.splice(index, 1);
    this.imagesArray.removeAt(index);
  }

  onFileSelect(event: any, index: number): void {
    const fileInput = event.target;
    if (!fileInput || !fileInput.files || !fileInput.files[0]) {
      console.error('No file selected or invalid file input.');
      return;
    }

    const file: File = fileInput.files[0];

    // store the local file and reset previous upload info for that index
    this.localFiles[index] = file;
    this.uploadedImagePaths[index] = null;
    this.uploadingFlags[index] = true;
    this.uploadProgress[index] = 0;

    // update UI form control to show something (optional: we will update to path once uploaded)
    this.imagesArray.at(index).setValue('uploading...');

    // start upload immediately
    const sub = this.fileService.uploadFile(file).pipe(
      catchError(err => {
        // show error and rethrow so subscriber error runs
        this.alertService.errorToast?.(`Image upload failed: ${err?.message || err}`);
        this.uploadingFlags[index] = false;
        this.uploadProgress[index] = 0;
        return throwError(err);
      }),
      finalize(() => {
        this.uploadingFlags[index] = false;
      })
    ).subscribe((event: any) => {
      if (event.type === HttpEventType.UploadProgress && event.total) {
        this.uploadProgress[index] = Math.round((event.loaded / event.total) * 100);
      } else if (event.type === HttpEventType.Response) {
        const body: any = event.body;
        const imagePath = body?.file?.path || body?.path || null;
        if (imagePath) {
          // normalize slashes
          const normalized = imagePath.replace(/\\/g, '/');
          this.uploadedImagePaths[index] = normalized;
          this.imagesArray.at(index).setValue(normalized);
          this.alertService.successToast?.('Image uploaded');
        } else {
          this.imagesArray.at(index).setValue('');
          this.alertService.warningToast?.('Upload succeeded but server returned no path.');
        }
      }
    });

    // save subscription so it can be cancelled on remove/destroy
    this.uploadSubs[index] = sub;
  }

  onSubmit() {
    // mark touched to show validators
    this.projectForm.markAllAsTouched();

    if (!this.projectForm.valid) {
      this.alertService.errorToast?.('Please complete all required fields.');
      return;
    }

    if (this.uploadingAny) {
      this.alertService.warningToast?.('Please wait until all images finish uploading.');
      return;
    }

    if (this.isLoading) return; // prevent double submits

    this.isLoading = true;

    // ensure the images FormArray controls contain uploaded paths (defensive)
    const imagesValues = this.imagesArray.value.map((v: any, idx: number) => {
      // prefer uploadedImagePaths when available
      return this.uploadedImagePaths[idx] || v || '';
    });
    // patch the images array to be the paths (so we send strings to backend)
    this.imagesArray.clear();
    imagesValues.forEach((p: string) => this.imagesArray.push(this.fb.control(p)));

    const payload = this.projectForm.value;

    // Post with timeout to avoid hanging UI (10s)
    this.postSub = this.projectService.post('projects', payload).pipe(
      timeout(10000),
      catchError(err => {
        return throwError(err);
      }),
      finalize(() => {
        this.isLoading = false;
      })
    ).subscribe(
      (res: any) => {
        this.alertService.successToast?.('Project created successfully');
        alert('Project created successfully');
        this.router.navigate(['/admin/projects']);
        this.resetForm();
      },
      (error) => {
        const errMsg = (error?.name === 'TimeoutError') ?
          'Server timed out. Try again later.' :
          (error?.message || 'Error submitting the project');
        this.alertService.errorToast?.(errMsg);
        console.error('Error in onSubmit:', error);
      }
    );
  }

  resetForm(): void {
    this.projectForm.reset();
    // reset arrays
    while (this.descriptions.length) this.descriptions.removeAt(0);
    while (this.imagesArray.length) this.imagesArray.removeAt(0);
    this.localFiles = [];
    this.uploadedImagePaths = [];
    this.uploadingFlags = [];
    this.uploadProgress = [];
    this.uploadSubs.forEach(s => s?.unsubscribe());
    this.uploadSubs = [];
    // add an initial empty description & image (if desired)
    this.addDescription();
    this.addImage();
  }
}