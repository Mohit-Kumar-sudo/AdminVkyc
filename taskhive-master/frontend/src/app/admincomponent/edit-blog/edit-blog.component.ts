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
  selector: 'app-edit-blog',
  templateUrl: './edit-blog.component.html',
  styleUrls: ['./edit-blog.component.scss']
})
export class EditBlogComponent implements OnInit, OnDestroy {
  env: string = environment.url;
  selectedBlog: any = {};
  myForm!: FormGroup;

  // local preview file(s)
  image: File[] = [];

  // upload state
  uploading = false;
  uploadProgress = 0;
  uploadedImagePath: string | null = null;

  // loading state for update
  isLoading = false;

  private uploadSub?: Subscription;
  private updateSub?: Subscription;

  constructor(
    private _blogService: ApiService,
    private fb: FormBuilder,
    private fileServ: FileService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.myForm = this.fb.group({
      image: [null],
      title: ['', Validators.required],
      description: ['', Validators.required],
    });
  }

  ngOnInit() {
    const blogId = this.route.snapshot.paramMap.get('id');
    if (blogId) {
      this.fetchBlogById(blogId);
    } else {
      console.error('Blog ID is undefined on initialization');
      alert('Error: Blog ID is undefined on initialization');
    }
  }

  ngOnDestroy() {
    this.uploadSub?.unsubscribe();
    this.updateSub?.unsubscribe();
  }

  fetchBlogById(id: string) {
    this._blogService.get(`blogs/${id}`, {}).subscribe(
      (res: any) => {
        if (res && res.data && res.data._id) {
          this.selectedBlog = res.data;

          // Normalize image path slashes for display if needed
          if (this.selectedBlog.image && !this.selectedBlog.image.startsWith('http')) {
            this.selectedBlog.image = this.selectedBlog.image.replace(/\\/g, '/');
          }

          this.populateForm();
        } else {
          console.error('Blog data does not contain an _id:', res);
          alert('Error: Blog data is missing an ID.');
        }
      },
      (error) => {
        console.error(`Error fetching blog with ID ${id}:`, error);
        alert(`Error fetching blog: ${error?.message || error}`);
      }
    );
  }

  populateForm() {
    this.myForm.patchValue({
      title: this.selectedBlog.title,
      description: this.selectedBlog.description,
      image: null
    });

    // set uploadedImagePath to current image so update can send it if user doesn't change
    this.uploadedImagePath = this.selectedBlog.image || null;
  }

  // Called when user clicks Update (form submit)
  uploadImage() {
    // show validation errors if any
    this.myForm.markAllAsTouched();

    if (!this.myForm.valid) {
      alert('Please fill required fields');
      return;
    }

    // merge form values into selectedBlog object
    this.selectedBlog.title = this.myForm.value.title;
    this.selectedBlog.description = this.myForm.value.description;

    // if a new file has been selected and not yet uploaded -> upload first
    if (this.image.length > 0 && !this.uploadedImagePath) {
      this.uploading = true;
      this.uploadProgress = 0;

      const file = this.image[0];

      this.uploadSub = this.fileServ.uploadFile(file).pipe(
        catchError(err => {
          this.uploading = false;
          this.uploadProgress = 0;
          console.error('Error uploading image:', err);
          alert(`Error uploading image: ${err?.message || err}`);
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
            this.selectedBlog.image = imagePath;
            // automatically proceed to update once upload finishes
            this.updateBlog();
          } else {
            console.error('Image upload response does not contain a valid path');
            alert('Error: Image upload failed.');
          }
        }
      });

      return;
    }

    // No new image selected — proceed to update (uploadedImagePath may already hold existing path)
    this.updateBlog();
  }

  updateBlog() {
    // ensure we send the correct image path (either existing or newly uploaded)
    if (this.uploadedImagePath) {
      this.selectedBlog.image = this.uploadedImagePath;
    }

    if (!this.selectedBlog._id) {
      console.error('Missing blog id for update', this.selectedBlog);
      alert('Error: Missing blog id.');
      return;
    }

    // Prevent multiple clicks
    if (this.isLoading) return;

    this.isLoading = true;

    // call update with a timeout so UI doesn't hang (10 seconds)
    this.updateSub = this._blogService.put('blogs', this.selectedBlog._id, this.selectedBlog).pipe(
      timeout(10000),
      catchError(err => {
        return throwError(err);
      }),
      finalize(() => {
        this.isLoading = false;
      })
    ).subscribe(
      (res: any) => {
        alert('Blog updated successfully');
        this.router.navigate(['/admin/blogs']);
      },
      (error) => {
        const msg = (error?.name === 'TimeoutError') ?
          'Server is taking too long to respond. Please try again later.' :
          (error?.message || 'Error updating blog');
        console.error('Error updating blog:', error);
        alert(msg);
      }
    );
  }

  // When user selects a new image, upload immediately (preferred)
  onSelect(event: any): void {
    const file: File = event.addedFiles[0];
    if (!file) return;

    // set preview and reset previous uploaded path so we upload fresh
    this.image = [file];
    this.uploadedImagePath = null;
    this.uploadProgress = 0;
    this.uploading = true;
    this.myForm.patchValue({ image: null });
    this.myForm.get('image')?.updateValueAndValidity();

    // Immediately start upload so Update is fast later
    this.uploadSub = this.fileServ.uploadFile(file).pipe(
      catchError(err => {
        this.uploading = false;
        this.uploadProgress = 0;
        console.error('Image upload failed:', err);
        alert(`Image upload failed: ${err?.message || err}`);
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
          // patch form and selectedBlog so update sends correct path
          this.myForm.patchValue({ image: imagePath });
          this.selectedBlog.image = imagePath;
          this.myForm.get('image')?.updateValueAndValidity();
        } else {
          console.error('Upload succeeded but response missing path');
          alert('Upload succeeded but server did not return image path');
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
      // revert to previous selectedBlog image if any
      this.uploadedImagePath = this.selectedBlog?.image || null;
      this.myForm.patchValue({ image: this.uploadedImagePath });
      this.myForm.get('image')?.updateValueAndValidity();
    }
  }
}