import { Component, ViewChild } from '@angular/core';
import { HttpEventType } from '@angular/common/http';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { FileService } from '../../services/file/file.service';
import { environment } from '../../../environments/environment';
import { ApiService } from '../../services/api/api.service';  

@Component({
  selector: 'app-courses',
  templateUrl: './courses.component.html',
  styleUrl: './courses.component.scss'
})
export class CoursesComponent {
  p: number = 1;
  itemsPerPage: number = 10;
  env: any;
  selectedCourse: any = {}; 
  getData: any;
  myForm!: FormGroup;
  courseToDeleteId: string | null = null;  
  image: File[] = [];
  image1: File[] = [];
  collection: any = []; 
  
  @ViewChild('confirmDeleteModal') confirmDeleteModal: any;
  data: any;

  constructor(
    private _courseService: ApiService, 
    private fb: FormBuilder,
    private modalService: NgbModal,
    private fileServ : FileService
  ) {
    this.env = environment.url
    this.initializeForm();
    for (let i = 1; i <= 100; i++) {
      this.collection.push(`item ${i}`);
    }
  }

  private initializeForm() {
    this.myForm = this.fb.group({
      image: [null, Validators.required],
      image1: [null],
      title: ['', Validators.required],
      skill: [''],
      price: [''],
      duration: [''],
      heading: [''],
      heading0: [''],
      heading1: [''],
      description: [''],
      description0: [''],
      description1: [''],
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
  }

  ngOnInit() {
    this.fetchAllCourses();
  }

  fetchAllCourses() {
    this._courseService.get('courses',{}).subscribe(res => {
      this.getData = res;
      console.log('Total courses:', this.getData.length);
    });
  }

  getSNo(index: number): number {
    return (this.p - 1) * this.itemsPerPage + index + 1;
  }

  // Add this method to fix the Math error
  getDisplayRange(): string {
    if (!this.getData || this.getData.length === 0) {
      return 'Showing 0 to 0 of 0 entries';
    }
    
    const start = (this.p - 1) * this.itemsPerPage + 1;
    const end = Math.min(this.p * this.itemsPerPage, this.getData.length);
    const total = this.getData.length;
    
    return `Showing ${start} to ${end} of ${total} entries`;
  }

  editCourse(course: any, content: any) {
    this.selectedCourse = { ...course }; 
    this.modalService.open(content, { ariaLabelledBy: 'modal-basic-title', size: 'lg' });
  }

  onDelete(id: any) {
    this.courseToDeleteId = id;  
    const modalRef = this.modalService.open(this.confirmDeleteModal, { ariaLabelledBy: 'modal-basic-title' });
    modalRef.result.then((result) => {
      if (result === 'Delete' && this.courseToDeleteId) {
        this._courseService.delete('courses',this.courseToDeleteId).subscribe(res => {
          console.log(res);
          this.fetchAllCourses();
        });
      }
    });
  }

  confirmDelete(modal: any) {
    modal.close('Delete'); 
  }

  onDeleteAll() {
    // this._courseService.onBlogDeleteAll().subscribe(res => {
    //   console.log('All courses deleted', res);
    //   this.fetchAllcourses(); // Refresh the blog list after deleting all
    // });
  }

  handleFileInput(event: any) {
    this.selectedCourse.image = event.target.files[0]; 
  }

  onSelect(event: any): void {
    const file: File = event.addedFiles[0];
    if (file) {
      this.image = [file];
      this.myForm.patchValue({ image: file });
      this.myForm.get('image')?.updateValueAndValidity();
    }
  }

  onSelect1(event: any): void {
    const file: File = event.addedFiles[0];
    if (file) {
      this.image1 = [file];
      this.myForm.patchValue({ image1: file });
      this.myForm.get('image1')?.updateValueAndValidity();
    }
  }

  onRemove(file: File): void {
    if (this.image.includes(file)) {
      this.image = [];
      this.myForm.patchValue({ image: null });
      this.myForm.get('image')?.updateValueAndValidity();
    }
  }

  onRemove1(file: File): void {
    if (this.image1.includes(file)) {
      this.image1 = [];
      this.myForm.patchValue({ image1: null });
      this.myForm.get('image1')?.updateValueAndValidity();
    }
  }

  uploadImage(modal:any) {
    if (this.image.length > 0) {
      this.fileServ.uploadFile(this.image[0]).subscribe(
        (res: any) => {
          if (res.type === HttpEventType.Response) {
            const body: any = res.body;
            const imagePath = body.file.path;
            this.selectedCourse.image = imagePath;
            
            // If second image exists, upload it too
            if (this.image1.length > 0) {
              this.uploadSecondImage(modal);
            } else {
              this.updateCourse(modal);
            }
          }
        },
        (error) => {
          alert(`Error uploading image: ${error.message}`);
        }
      );
    } else {
      this.updateCourse(modal);
    }
  }

  uploadSecondImage(modal: any) {
    if (this.image1.length > 0) {
      this.fileServ.uploadFile(this.image1[0]).subscribe(
        (res: any) => {
          if (res.type === HttpEventType.Response) {
            const body: any = res.body;
            const imagePath = body.file.path;
            this.selectedCourse.image1 = imagePath;
          }
          this.updateCourse(modal);
        },
        (error) => {
          alert(`Error uploading second image: ${error.message}`);
          this.updateCourse(modal);
        }
      );
    } else {
      this.updateCourse(modal);
    }
  }

  updateCourse(modal: any) {
    console.log('Updating course:', this.selectedCourse);
    this._courseService.put('courses', this.selectedCourse._id, this.selectedCourse).subscribe(res => {
      this.fetchAllCourses();
      modal.close(); 
    });
  }

  // Helper method to format date
  formatDate(dateString: string): string {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  // Helper method to get status badge class
  getStatusBadgeClass(status: string): string {
    switch (status) {
      case 'active': return 'badge bg-success';
      case 'inactive': return 'badge bg-secondary';
      case 'upcoming': return 'badge bg-warning';
      default: return 'badge bg-light text-dark';
    }
  }

  // Helper method to truncate long text
  truncateText(text: string, maxLength: number = 50): string {
    if (!text) return '-';
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  }
}