import { Component, OnInit, OnDestroy } from '@angular/core';
import { HttpEventType } from '@angular/common/http';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { ApiService } from '../../services/api/api.service';
import { FileService } from '../../services/file/file.service';
import { environment } from '../../../environments/environment';
import { Subscription, throwError } from 'rxjs';
import { timeout, finalize, catchError } from 'rxjs/operators';

@Component({
  selector: 'app-edit-project',
  templateUrl: './edit-project.component.html',
  styleUrls: ['./edit-project.component.scss']
})
export class EditProjectComponent implements OnInit, OnDestroy {
  projectForm: FormGroup;
  env: string = environment.url;
  selectedProject: any = {};

  // local file objects for files currently chosen but not yet uploaded (index -> File|null)
  localFiles: (File | null)[] = [];

  // uploaded image paths (index -> string|null)
  uploadedImagePaths: (string | null)[] = [];

  // per-image uploading flags and progress
  uploadingFlags: boolean[] = [];
  uploadProgress: number[] = [];

  // Subscriptions for each upload so we can unsubscribe if user removes image
  private uploadSubs: (Subscription | null)[] = [];

  // submission state
  isLoading = false;
  private updateSub?: Subscription;
  private fetchSub?: Subscription;

  constructor(
    private projectService: ApiService,
    private fb: FormBuilder,
    private fileServ: FileService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.projectForm = this.fb.group({
      name: ['', Validators.required],
      descriptions: this.fb.array([], Validators.required),
      images: this.fb.array([], Validators.required),
    });
  }

  ngOnInit(): void {
    const projectId = this.route.snapshot.paramMap.get('id');
    if (projectId) {
      this.fetchProjectById(projectId);
    } else {
      console.error('Project ID is undefined on initialization');
      this.showError('Error: Project ID is undefined on initialization');
    }
  }

  ngOnDestroy(): void {
    this.uploadSubs.forEach(s => s?.unsubscribe());
    this.updateSub?.unsubscribe();
    this.fetchSub?.unsubscribe();
  }

  // helpers to get form arrays
  get descriptions(): FormArray {
    return this.projectForm.get('descriptions') as FormArray;
  }

  get imagesArray(): FormArray {
    return this.projectForm.get('images') as FormArray;
  }

  // whether any image is currently uploading
  get uploadingAny(): boolean {
    return this.uploadingFlags.some(flag => flag === true);
  }

  // small UX helpers (use your AlertService if available)
  private showSuccess(msg: string) { try { alert(msg); } catch { console.log(msg); } }
  private showWarning(msg: string) { try { alert(msg); } catch { console.warn(msg); } }
  private showError(msg: string) { try { alert(msg); } catch { console.error(msg); } }

  // Builds preview URL for image values (keeps your existing behavior)
  getImageUrl(value: string): string {
    if (!value) return '';
    if (value.startsWith('http') || value.startsWith('/')) return value;
    return `${this.env}/file/download/${value}`;
  }

  // Fetch project and populate descriptions/images only after response
  fetchProjectById(id: string) {
    this.fetchSub = this.projectService.get(`projects/${id}`, {}).subscribe(
      (res: any) => {
        if (res?.data) {
          this.selectedProject = res.data;
          this.projectForm.patchValue({ name: this.selectedProject.name || '' });

          // populate descriptions
          const descriptionsControl = this.projectForm.get('descriptions') as FormArray;
          descriptionsControl.clear();
          (this.selectedProject.descriptions || ['']).forEach((desc: string) => {
            descriptionsControl.push(this.fb.control(desc || '', Validators.required));
          });

          // populate images array with existing paths (strings)
          const imagesControl = this.projectForm.get('images') as FormArray;
          imagesControl.clear();
          (this.selectedProject.images || ['']).forEach((img: string) => {
            imagesControl.push(this.fb.control(img || '', Validators.required));
          });

          // initialize local arrays with same length
          this.ensureImageArrays(imagesControl.length);

          // set uploadedImagePaths to existing values so update knows them
          imagesControl.controls.forEach((ctrl, idx) => {
            const val = ctrl.value;
            this.uploadedImagePaths[idx] = val ? `${val}` : null;
          });

        } else {
          console.error('Project data not found:', res);
          this.showError('Error: Project data not found.');
        }
      },
      (error) => {
        console.error('Error fetching project:', error);
        this.showError('Error fetching project data.');
      }
    );
  }

  // Ensure local arrays sized correctly
  private ensureImageArrays(length: number) {
    while (this.localFiles.length < length) this.localFiles.push(null);
    while (this.uploadedImagePaths.length < length) this.uploadedImagePaths.push(null);
    while (this.uploadingFlags.length < length) this.uploadingFlags.push(false);
    while (this.uploadProgress.length < length) this.uploadProgress.push(0);
    while (this.uploadSubs.length < length) this.uploadSubs.push(null);
  }

  // add/remove description/image controls
  addDescription() { this.descriptions.push(this.fb.control('', Validators.required)); }
  removeDescription(index: number) { this.descriptions.removeAt(index); }

  addImage() {
    this.imagesArray.push(this.fb.control('', Validators.required));
    this.ensureImageArrays(this.imagesArray.length);
  }
  removeImage(index: number) {
    // cancel upload if running
    if (this.uploadSubs[index]) {
      this.uploadSubs[index]?.unsubscribe();
      this.uploadSubs[index] = null;
    }

    this.localFiles.splice(index, 1);
    this.uploadedImagePaths.splice(index, 1);
    this.uploadingFlags.splice(index, 1);
    this.uploadProgress.splice(index, 1);
    this.uploadSubs.splice(index, 1);
    this.imagesArray.removeAt(index);
  }

  // Called when user selects a file for a specific image index — start upload immediately
  onFileSelect(event: any, index: number) {
    const file = event.target?.files?.[0] as File | undefined;
    if (!file) {
      console.error('No file selected or invalid file input.');
      return;
    }

    // store local file and reset related state
    this.localFiles[index] = file;
    this.uploadedImagePaths[index] = null;
    this.uploadingFlags[index] = true;
    this.uploadProgress[index] = 0;

    // mark control temporarily (will be replaced by path upon upload)
    this.imagesArray.at(index).setValue('uploading...');

    // start upload
    const sub = this.fileServ.uploadFile(file).pipe(
      catchError(err => {
        this.uploadingFlags[index] = false;
        this.uploadProgress[index] = 0;
        this.showError(`Image upload failed: ${err?.message || err}`);
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
          const normalized = imagePath.replace(/\\/g, '/');
          this.uploadedImagePaths[index] = normalized;
          this.imagesArray.at(index).setValue(normalized);
          this.showSuccess('Image uploaded');
        } else {
          this.imagesArray.at(index).setValue('');
          this.showWarning('Upload succeeded but server did not return path');
        }
      }
    });

    this.uploadSubs[index] = sub;
  }

  // helper to check if an index is uploading
  isUploadingIndex(i: number): boolean {
    return this.uploadingFlags[i] === true;
  }

  // Uploads are fired on file select. On submit ensure nothing is uploading and then submit.
  onSubmit = (): void => {
    // mark controls touched
    this.projectForm.markAllAsTouched();

    if (this.projectForm.invalid) {
      this.showWarning('Please complete all required fields.');
      return;
    }

    if (this.uploadingAny) {
      this.showWarning('Please wait until all images finish uploading.');
      return;
    }

    if (!this.selectedProject?._id) {
      this.showError('Missing project id.');
      return;
    }

    if (this.isLoading) return;

    // Prepare images: prefer uploadedImagePaths (new or existing) otherwise form value
    const imagesValues = this.imagesArray.value.map((v: any, idx: number) => {
      return this.uploadedImagePaths[idx] || (typeof v === 'string' ? v : '');
    });

    // Replace images FormArray values with final paths
    this.imagesArray.clear();
    imagesValues.forEach((p: string) => this.imagesArray.push(this.fb.control(p)));

    // Build payload
    const payload = this.projectForm.value;

    // filter out empty image strings
    payload.images = (payload.images || []).filter((s: string) => !!s);

    this.isLoading = true;

    this.updateSub = this.projectService.put('projects', this.selectedProject._id, payload).pipe(
      timeout(10000),
      catchError(err => {
        return throwError(err);
      }),
      finalize(() => {
        this.isLoading = false;
      })
    ).subscribe(
      (res: any) => {
        this.showSuccess('Project updated successfully!');
        this.router.navigate(['/admin/projects']);
      },
      (error) => {
        console.error('Error updating project:', error);
        const msg = (error?.name === 'TimeoutError') ? 'Server timed out. Try later.' : (error?.message || 'Error updating project.');
        this.showError(msg);
      }
    );
  }

}