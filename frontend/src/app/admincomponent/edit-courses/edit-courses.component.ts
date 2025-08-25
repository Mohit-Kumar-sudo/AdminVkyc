import { Component, OnInit } from '@angular/core';
import { HttpEventType } from '@angular/common/http';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { CoursesService } from '../../services/courses/courses.service'; 
import { FileService } from '../../services/file/file.service';
import { environment } from '../../../environments/environment';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-edit-courses',
  templateUrl: './edit-courses.component.html',
  styleUrl: './edit-courses.component.scss'
})
export class EditCoursesComponent implements OnInit {
    env: string = environment.url;
    selectedCourse: any = {};
    myForm!: FormGroup;
    image: File[] = [];
  
    constructor(
      private _courseService: CoursesService,
      private fb: FormBuilder,
      private fileServ: FileService,
      private router: Router,
      private route: ActivatedRoute
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
  
    ngOnInit() {
      const courseId = this.route.snapshot.paramMap.get('id');
      if (courseId) {
        this.fetchCourseById(courseId);
      } else {
        console.error('course ID is undefined on initialization');
        alert('Error: course ID is undefined on initialization');
      }
    }
  
    fetchCourseById(id: string) {
      this._courseService.get(`courses/${id}`, {}).subscribe(
        (res) => {
          if (res && res.data && res.data._id) {
            this.selectedCourse = res.data;
            
            
            if (this.selectedCourse.image && !this.selectedCourse.image.startsWith('http')) {
              this.selectedCourse.image = this.selectedCourse.image.replace(/\\/g, '/');
            }
            console.log('Selected Course Image:', this.selectedCourse.image);
  
  
            
            this.populateForm();
          } else {
            console.error('course data does not contain an _id:', res);
            alert('Error: course data is missing an ID.');
          }
        },
        (error) => {
          console.error(`Error fetching course with ID ${id}:`, error);
          alert(`Error fetching course: ${error.message}`);
        }
      );
    }
  
    populateForm() {
      this.myForm.patchValue({
        title: this.selectedCourse.title,
        skill: this.selectedCourse.skill,
        duration: this.selectedCourse.duration,
        heading: this.selectedCourse.heading,
        heading0: this.selectedCourse.heading0,
        heading1: this.selectedCourse.heading1,
        description: this.selectedCourse.description,
        description0: this.selectedCourse.description0,
        description1: this.selectedCourse.description1,
        image: null
      });
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
  
    onRemove(file: File): void {
      if (this.image.includes(file)) {
        this.image = [];
        this.myForm.patchValue({ image: null });
        this.myForm.get('image')?.updateValueAndValidity();
      }
    }
  
    uploadImage() {
      
      if (this.image.length === 0 && !this.selectedCourse.image) {
        alert('Please select an image');
        return;
      }
    
      
      this.selectedCourse.title = this.myForm.value.title;
      this.selectedCourse.skill = this.myForm.value.skill;
      this.selectedCourse.duration = this.myForm.value.duration;
      this.selectedCourse.heading = this.myForm.value.heading;
      this.selectedCourse.heading0 = this.myForm.value.heading0;
      this.selectedCourse.heading1 = this.myForm.value.heading1;
      this.selectedCourse.description = this.myForm.value.description;
      this.selectedCourse.description0 = this.myForm.value.description0;
      this.selectedCourse.description1 = this.myForm.value.description1;

    
      if (this.image.length > 0) {
        this.fileServ.uploadFile(this.image[0]).subscribe(
          (res: any) => {
            if (res.type === HttpEventType.Response) {
              const body: any = res.body;
              if (body && body.file && body.file.path) {
                const imagePath = body.file.path.replace(/\\/g, '/'); 
                this.selectedCourse.image = imagePath;
                this.updateCourse();
              } else {
                console.error('Image upload response does not contain a valid path');
                alert('Error: Image upload failed.');
              }
            }
          },
          (error) => {
            console.error('Error uploading image:', error);
            alert(`Error uploading image: ${error.message}`);
          }
        );
      } else {
        
        this.updateCourse();
      }
    }
    
  
    updateCourse() {
      this._courseService.put('courses', this.selectedCourse._id, this.selectedCourse).subscribe(
        () => {
          alert('Course updated successfully');
          this.router.navigate(['/admin/courses']);
        },
        (error) => {
          console.error('Error updating Course:', error);
          alert(`Error updating Course: ${error.message}`);
        }
      );
    }
}
