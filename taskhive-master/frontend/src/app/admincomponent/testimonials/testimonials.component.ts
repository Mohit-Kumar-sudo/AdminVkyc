import { Component, ViewChild } from '@angular/core';
import { HttpEventType } from '@angular/common/http';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ApiService } from '../../services/api/api.service';
import { FileService } from '../../services/file/file.service';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-testimonials',
  templateUrl: './testimonials.component.html',
  styleUrl: './testimonials.component.scss'
})
export class TestimonialsComponent {
  p: number = 1;
  itemsPerPage: number = 10;
  env: any;
  selectedTestimonial: any = {}; 
  getData: any;
  myForm!: FormGroup;
  testimonialToDeleteId: string | null = null;  
  image: File[] = [];
  collection: any = []; 


    @ViewChild('confirmDeleteModal') confirmDeleteModal: any;
data: any;
  constructor(
    private testimonialService: ApiService, 
    private fb: FormBuilder,
    private modalService: NgbModal,
    private fileServ : FileService
  ) {
    this.env = environment.url
    this.myForm = this.fb.group({
      image: [null, Validators.required],
      name: ['' ],
      profession: [''],
      comment: [''],
      rating: [''],
    });
    for (let i = 1; i <= 100; i++) {
      this.collection.push(`item ${i}`);
    }
  }

  ngOnInit() {
    this.fetchAllTestimonials();
  }

    fetchAllTestimonials() {
    this.testimonialService.get('testimonials',{}).subscribe(res => {
      this.getData = res;
      console.log(this.getData.length)
    });
  }

  getSNo(index: number): number {
    return (this.p - 1) * this.itemsPerPage + index + 1;
  }

  editTestimonial(testimonial: any, content: any) {
    this.selectedTestimonial = { ...testimonial }; 
    this.modalService.open(content, { ariaLabelledBy: 'modal-basic-title' });
  }

  onDelete(id: any) {
    this.testimonialToDeleteId = id;  
    const modalRef = this.modalService.open(this.confirmDeleteModal, { ariaLabelledBy: 'modal-basic-title' });
    modalRef.result.then((result) => {
      if (result === 'Delete' && this.testimonialToDeleteId) {
        this.testimonialService.delete('testimonials',this.testimonialToDeleteId).subscribe(res => {
          console.log(res);
          this.fetchAllTestimonials();
        });
      }
    });
  }

  confirmDelete(modal: any) {
    modal.close('Delete'); 
  }

  onDeleteAll() {
    // this._blogService.onBlogDeleteAll().subscribe(res => {
    //   console.log('All Blogs deleted', res);
    //   this.fetchAllBlogs(); // Refresh the blog list after deleting all
    // });
  }

  // saveChanges(modal: any) {
  // }

  handleFileInput(event: any) {
    this.selectedTestimonial.image = event.target.files[0]; 
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
            this.selectedTestimonial.image = imagePath;
            console.log('testimonials', this.selectedTestimonial)
            this.testimonialService.put('testimonials',this.selectedTestimonial._id, this.selectedTestimonial).subscribe(res => {
              this.fetchAllTestimonials();
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
