import { Component, ViewChild } from '@angular/core';
import { HttpEventType } from '@angular/common/http';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { FileService } from '../../services/file/file.service';
import { environment } from '../../../environments/environment';
import { CoursesService } from '../../services/courses/courses.service';  

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
  collection: any = []; 
  
  
  @ViewChild('confirmDeleteModal') confirmDeleteModal: any;
data: any;
  constructor(
    private _courseService: CoursesService, 
    private fb: FormBuilder,
    private modalService: NgbModal,
    private fileServ : FileService
  ) {
    this.env = environment.url
    this.myForm = this.fb.group({
      image: [null, Validators.required],
      title: ['', Validators.required],
      skill: ['', Validators.required],
      duration: ['', Validators.required],
      heading: ['', Validators.required],
      heading0: ['', Validators.required],
      heading1: ['', Validators.required],
      description: ['', Validators.required],
      description0: ['', Validators.required],
      description1: ['', Validators.required],
    });
    for (let i = 1; i <= 100; i++) {
      this.collection.push(`item ${i}`);
    }
  }

  ngOnInit() {
    this.fetchAllCourses();
  }

  fetchAllCourses() {
    this._courseService.get('courses',{}).subscribe(res => {
      this.getData = res;
      console.log(this.getData.length)
    });
  }

  getSNo(index: number): number {
    return (this.p - 1) * this.itemsPerPage + index + 1;
  }

  editCourse(blog: any, content: any) {
    this.selectedCourse = { ...blog }; 
    this.modalService.open(content, { ariaLabelledBy: 'modal-basic-title' });
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

  // saveChanges(modal: any) {
  // }

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

  onRemove(file: File): void {
    if (this.image.includes(file)) {
      this.image = [];
      this.myForm.patchValue({ image: null });
      this.myForm.get('image')?.updateValueAndValidity();
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
            console.log('blog', this.selectedCourse)
            this._courseService.put('courses',this.selectedCourse._id, this.selectedCourse).subscribe(res => {
              this.fetchAllCourses();
              modal.close(); 
            });
          }
        },
        (error) => {
          alert(`Error uploading image: ${error.message}`);
        }
      );
    } else {
      alert('Please Select Image');
    }
  }

}
