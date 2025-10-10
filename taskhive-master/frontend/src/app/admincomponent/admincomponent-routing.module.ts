import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DashboardComponent } from './dashboard/dashboard.component';
import { ProjectsComponent } from './projects/projects.component';
import { AddProjectComponent } from './add-project/add-project.component';
import { EditProjectComponent } from './edit-project/edit-project.component';
import { BlogsComponent } from './blogs/blogs.component';
import { AddBlogComponent } from './add-blog/add-blog.component';
import { EditBlogComponent } from './edit-blog/edit-blog.component';
import { QueryComponent } from './query/query.component';
import { AuthGuard } from '../services/authGuard/auth.guard';
import { CourseQueryComponent } from './course-query/course-query.component';
import { CarrierQueryComponent } from './carrier-query/carrier-query.component';
import { CarriersComponent } from './carriers/carriers.component';
import { CoursesComponent } from './courses/courses.component';
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

const routes: Routes = [
  {
    path:'dashboard',
    component:DashboardComponent,
    canActivate: [AuthGuard],
    data: { title: 'Admin Dashboard', description: 'View website analytics and manage content.' }
  },
  {
    path:'projects',
    component:ProjectsComponent,
    canActivate: [AuthGuard],
    data: { title: 'Manage Projects', description: 'Add, edit, and delete projects from the portfolio.' }
  },
  {
    path:'projects/add-project',
    component:AddProjectComponent,
    canActivate: [AuthGuard],
    data: { title: 'Add New Project', description: 'Create a new project entry for the portfolio.' }
  },
  {
    path:'projects/edit-project/:id',
    component:EditProjectComponent,
    canActivate: [AuthGuard],
    data: { title: 'Edit Project', description: 'Update an existing project.' }
  },
  {
    path:'query',
    component:QueryComponent,
    canActivate: [AuthGuard],
    data: { title: 'Contact Queries', description: 'View and manage user-submitted contact queries.' }
  },
  {
    path:'course-query',
    component:CourseQueryComponent,
    canActivate: [AuthGuard],
    data: { title: 'Course Queries', description: 'View and manage user-submitted course queries.' }
  },
  {
    path:'career-query',
    component:CarrierQueryComponent,
    canActivate: [AuthGuard],
    data: { title: 'Career Queries', description: 'View and manage career applications.' }
  },
  {
    path:'courses',
    component:CoursesComponent,
    canActivate: [AuthGuard],
    data: { title: 'Manage Courses', description: 'Add, edit, and delete courses.' }
  },
  {
    path:'courses/add-courses',
    component:AddCoursesComponent,
    canActivate: [AuthGuard],
    data: { title: 'Add New Course', description: 'Create a new course.' }
  },
  {
    path:'courses/edit-courses/:id',
    component:EditCoursesComponent,
    canActivate: [AuthGuard],
    data: { title: 'Edit Course', description: 'Update an existing course.' }
  },
  {
    path:'careers',
    component:CarriersComponent,
    canActivate: [AuthGuard],
    data: { title: 'Manage Careers', description: 'Add, edit, and delete career openings.' }
  },
  {
    path:'careers/add-career',
    component:AddCarrierComponent,
    canActivate: [AuthGuard],
    data: { title: 'Add New Career', description: 'Create a new career opening.' }
  },
  {
    path:'careers/edit-career/:id',
    component:EditCarrierComponent,
    canActivate: [AuthGuard],
    data: { title: 'Edit Career', description: 'Update an existing career opening.' }
  },
  {
    path:'blogs',
    component:BlogsComponent,
    canActivate: [AuthGuard],
    data: { title: 'Manage Blogs', description: 'Add, edit, and delete blog posts.' }
  },
  {
    path:'blogs/add-blog',
    component:AddBlogComponent,
    canActivate: [AuthGuard],
    data: { title: 'Add New Blog Post', description: 'Create a new blog post.' }
  },
  {
    path:'blogs/edit-blog/:id',
    component:EditBlogComponent,
    canActivate: [AuthGuard],
    data: { title: 'Edit Blog Post', description: 'Update an existing blog post.' }
  },
  {
    path:'testimonials',
    component:TestimonialsComponent,
    canActivate: [AuthGuard],
    data: { title: 'Manage Testimonials', description: 'Add, edit, and delete testimonials.' }
  },
  {
    path:'testimonials/add-testimonial',
    component:AddTestimonialComponent,
    canActivate: [AuthGuard],
    data: { title: 'Add New Testimonial', description: 'Create a new testimonial.' }
  },
  {
    path:'testimonials/edit-testimonial/:id',
    component:EditTestimonialComponent,
    canActivate: [AuthGuard],
    data: { title: 'Edit Testimonial', description: 'Update an existing testimonial.' }
  },
    {
    path:'teams',
    component:TeamComponent,
    canActivate: [AuthGuard],
    data: { title: 'Manage Teams', description: 'Add, edit, and delete team members.' }
  },
  {
    path:'teams/add-team',
    component:AddTeamComponent,
    canActivate: [AuthGuard],
    data: { title: 'Add New Team Member', description: 'Create a new team member profile.' }
  },
  {
    path:'teams/edit-team/:id',
    component:EditTeamComponent,
    canActivate: [AuthGuard],
    data: { title: 'Edit Team Member', description: 'Update an existing team member profile.' }
  },
  {
    path:'students',
    component:StudentComponent,
    canActivate: [AuthGuard],
    data: { title: 'Manage Students', description: 'Add, edit, and delete student records.' }
  },
  {
    path:'students/add-student',
    component:AddStudentComponent,
    canActivate: [AuthGuard],
    data: { title: 'Add New Student', description: 'Create a new student record.' }
  },
  {
    path:'students/edit-student/:id',
    component:EditStudentComponent,
    canActivate: [AuthGuard],
    data: { title: 'Edit Student', description: 'Update an existing student record.' }
  },
      {
    path:'certificates',
    component:CertificatesComponent,
    canActivate: [AuthGuard],
    data: { title: 'Manage Certificates', description: 'Add, edit, and delete certificates.' }
  },
  {
    path:'certificates/add-certificates',
    component:CertificatesComponent,
    canActivate: [AuthGuard],
    data: { title: 'Add New Certificate', description: 'Create a new certificate.' }
  },
  {
    path:'certificates/edit-certificates/:id',
    component:CertificatesComponent,
    canActivate: [AuthGuard],
    data: { title: 'Edit Certificate', description: 'Update an existing certificate.' }
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdmincomponentRoutingModule { }
