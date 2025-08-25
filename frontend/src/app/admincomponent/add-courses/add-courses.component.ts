import { Component, OnInit } from '@angular/core';
import { HttpEventType } from '@angular/common/http';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AlertService } from '../../services/alert/alert.service';
import { CoursesService } from '../../services/courses/courses.service';  
import { FileService } from '../../services/file/file.service';

@Component({
  selector: 'app-add-courses',
  templateUrl: './add-courses.component.html',
  styleUrl: './add-courses.component.scss'
})
export class AddCoursesComponent implements OnInit {
  myForm!: FormGroup;
  isLoading = false;
  image: File[] = []; 
  

  constructor(
    private fb: FormBuilder,
    private fileServ: FileService,
    private _courseService: CoursesService,
    private as: AlertService,
    private route : Router
  ) {
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
  }

  ngOnInit() {}

  uploadImage(frm: FormGroup) {
    if (this.image.length > 0) {
      this.fileServ.uploadFile(this.image[0]).subscribe(
        (res: any) => {
          if (res.type === HttpEventType.Response) {
            const body: any = res.body;
            const imagePath = body.file.path;
            this.myForm.patchValue({ image: imagePath }); // Update image path in form
            this.onSubmit(frm);
          }
        },
        (error) => {
          this.as.errorToast(`Error uploading image: ${error.message}`);
        }
      );
    } else {
      this.as.warningToast('Please select an image');
    }
  }

  onSubmit(frm: FormGroup) {
    if (frm.valid) {
      this.isLoading = true;
      this._courseService.post('courses', frm.value).subscribe(
        (res: any) => {
          this.isLoading = false;
          if (res) {
            this.route.navigate(['/admin/courses']);
            this.as.successToast('Course created successfully!');
          } else {
            this.as.warningToast(res.error.message);
          }
        },
        (error) => {
          this.isLoading = false;
          this.as.errorToast(error.message);
        }
      );
    }
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
}
