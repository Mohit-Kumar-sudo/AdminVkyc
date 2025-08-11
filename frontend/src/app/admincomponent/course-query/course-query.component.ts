import { Component, OnInit, ViewChild } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { HttpClient } from '@angular/common/http';
import { CourseForm, CourseService } from '../../services/course/course.service';

@Component({
  selector: 'app-course-query',
  templateUrl: './course-query.component.html',
  styleUrls: ['./course-query.component.scss']
})
export class CourseQueryComponent implements OnInit {

    collection: string[] = [];
    p: number = 1;
    itemsPerPage: number = 10;
    getData: any;
    selectedCourse: CourseForm = { name: '', email: '', countryCode:'', number: '', course: '', price: '', };
    isDeletingAll = false;  // Flag to disable the button
    @ViewChild('confirmDeleteModal') confirmDeleteModal: any;
    private courseToDeleteId: string | null = null;  // Store the ID of the Course to be deleted
  
    constructor(
      private http: HttpClient, 
      private _courseService: CourseService, 
      private modalService: NgbModal
    ) {
      for (let i = 1; i <= 100; i++) {
        this.collection.push(`item ${i}`);
      }
    }
  
    ngOnInit() {
      this.fetchAllCourses();
    }
  
    fetchAllCourses() {
      this._courseService.onCourseGetAll().subscribe(res => {
        this.getData = res;
        console.log(this.getData.length)
      });
    }
  
    getSNo(index: number): number {
      return (this.p - 1) * this.itemsPerPage + index + 1;
    }
  
    editCourse(course: CourseForm, content: any) {
      this.selectedCourse = { ...course };
      this.modalService.open(content, { ariaLabelledBy: 'modal-basic-title' }).result.then((result) => {
        if (result === 'Save') {
          this.updateCourse(this.selectedCourse._id!, this.selectedCourse);
        }
      });
    }
  
    updateCourse(id: string, updatedCourse: CourseForm) {
      this._courseService.onCourseUpdate(id, updatedCourse).subscribe(res => {
        const index = this.getData.findIndex((c: any) => c._id === id);
        if (index !== -1) {
          this.getData[index] = updatedCourse;
        }
      });
    }
  
    onDelete(id: string) {
      this.courseToDeleteId = id;
      const modalRef = this.modalService.open(this.confirmDeleteModal, { ariaLabelledBy: 'modal-basic-title' });
      modalRef.result.then((result) => {
        if (result === 'Delete' && this.courseToDeleteId) {
          this._courseService.onCourseDelete(this.courseToDeleteId).subscribe(res => {
            this.fetchAllCourses();
          });
        }
      });
    }
  
    confirmDelete(modal: any) {
      modal.close('Delete');
    }
  
    confirmDeleteAll() {
      const modalRef = this.modalService.open(this.confirmDeleteModal, { ariaLabelledBy: 'modal-basic-title' });
      modalRef.result.then((result) => {
        if (result === 'Confirm') {
          this.confirmDeleteAllAction();
        }
      });
    }
  
    confirmDeleteAllAction() {
      this.isDeletingAll = true;
      setTimeout(() => {
        this._courseService.onCourseDeleteAll().subscribe(res => {
          this.fetchAllCourses();
          this.isDeletingAll = false;
        });
      }, 10000);
    }
}
