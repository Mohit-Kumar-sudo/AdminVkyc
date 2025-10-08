import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { NgxPaginationModule } from 'ngx-pagination';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { AdmincomponentRoutingModule } from './admincomponent-routing.module';
import { DashboardComponent } from './dashboard/dashboard.component';
import { ProjectsComponent } from './projects/projects.component';
import { AddProjectComponent } from './add-project/add-project.component';
import { EditProjectComponent } from './edit-project/edit-project.component';
import { BlogsComponent } from './blogs/blogs.component';
import { AddBlogComponent } from './add-blog/add-blog.component';
import { EditBlogComponent } from './edit-blog/edit-blog.component';
import { QueryComponent } from './query/query.component';
import { NgxDropzoneModule } from 'ngx-dropzone';
import { CourseQueryComponent } from './course-query/course-query.component';
import { CoursesComponent } from './courses/courses.component';
import { CarrierQueryComponent } from './carrier-query/carrier-query.component';
import { CarriersComponent } from './carriers/carriers.component';
import { AddCoursesComponent } from './add-courses/add-courses.component';
import { EditCoursesComponent } from './edit-courses/edit-courses.component';
import { AddCarrierComponent } from './add-carrier/add-carrier.component';
import { EditCarrierComponent } from './edit-carrier/edit-carrier.component';
import { TestimonialsComponent } from './testimonials/testimonials.component';
import { AddTestimonialComponent } from './add-testimonial/add-testimonial.component';
import { EditTestimonialComponent } from './edit-testimonial/edit-testimonial.component';
import { TeamComponent } from './team/team.component';
import { AddTeamComponent } from './add-team/add-team.component';
import { EditTeamComponent } from './edit-team/edit-team.component';
import { StudentComponent } from './student/student.component';
import { AddStudentComponent } from './add-student/add-student.component';
import { EditStudentComponent } from './edit-student/edit-student.component';
import { CertificatesComponent } from './certificates/certificates.component';
@NgModule({
  declarations: [
    DashboardComponent,
    ProjectsComponent,
    AddProjectComponent,
    EditProjectComponent,
    BlogsComponent,
    AddBlogComponent,
    EditBlogComponent,
    QueryComponent,
    CourseQueryComponent,
    CoursesComponent,
    CarrierQueryComponent,
    CarriersComponent,
    AddCoursesComponent,
    EditCoursesComponent,
    AddCarrierComponent,
    EditCarrierComponent,
    TestimonialsComponent,
    AddTestimonialComponent,
    EditTestimonialComponent,
    TeamComponent,
    AddTeamComponent,
    EditTeamComponent,
    StudentComponent,
    AddStudentComponent,
    EditStudentComponent,
    CertificatesComponent,
  ],
  imports: [
    CommonModule,
    AdmincomponentRoutingModule,
    NgbModule,
    NgxPaginationModule,
    NgxDropzoneModule,
    FormsModule,
    ReactiveFormsModule
  ]
})
export class AdmincomponentModule { }
