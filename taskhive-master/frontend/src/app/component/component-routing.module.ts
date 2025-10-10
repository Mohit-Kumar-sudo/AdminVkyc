import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { AboutComponent } from './about/about.component';
import { ServicesComponent } from './services/services.component';
import { PortfolioComponent } from './portfolio/portfolio.component';
import { PricingComponent } from './pricing/pricing.component';
import { PrivacyPolicyComponent } from './privacy-policy/privacy-policy.component';
import { TermsConditionComponent } from './terms-condition/terms-condition.component';
import { ContactComponent } from './contact/contact.component';
import { BlogDetailsComponent } from './blog-details/blog-details.component';
import { ProjectDetailsComponent } from './project-details/project-details.component';
import { CoursesComponent } from './courses/courses.component';
import { CarrierComponent } from './carrier/carrier.component';
import { CarrierDetailsComponent } from './carrier-details/carrier-details.component';
import { CarrierSummaryComponent } from './carrier-summary/carrier-summary.component';
import { CarrierFormComponent } from './carrier-form/carrier-form.component';
import { CourseDetailsComponent } from './course-details/course-details.component';
import { CertificateComponent } from './certificate/certificate.component';
import { CourseFormComponent } from './course-form/course-form.component';

const routes: Routes = [
  {
    path:'home',
    component:HomeComponent,
    data: {
      title: 'TaskHive - Your Partner in Digital Excellence',
      description: 'Welcome to TaskHive, where we provide top-tier software solutions, web development, and digital marketing services to elevate your business.'
    }
  },
  {
    path:'about',
    component:AboutComponent,
    data: {
      title: 'About TaskHive | Our Mission and Team',
      description: 'Learn about TaskHive, our mission to provide top-tier software solutions, and meet the expert team behind our success.'
    }
  },
  {
    path:'services',
    component:ServicesComponent,
    data: {
      title: 'Our Services | Custom Software, Web & Digital Marketing',
      description: 'Explore the wide range of services offered by TaskHive, including custom software development, IT solutions, and strategic digital marketing.'
    }
  },
  {
    path:'portfolio',
    component:PortfolioComponent,
    data: {
      title: 'Our Portfolio | Success Stories from TaskHive',
      description: 'Browse our portfolio to see how we have helped businesses like yours succeed with our innovative and customized digital solutions.'
    }
  },
  {
    path:'pricing',
    component:PricingComponent,
    data: {
      title: 'Pricing Plans | Affordable Solutions for Every Business',
      description: 'Find the perfect pricing plan for your business. TaskHive offers flexible and competitive packages for all our digital services.'
    }
  },
  {
    path:'privacy-policy',
    component:PrivacyPolicyComponent,
    data: {
      title: 'Privacy Policy | TaskHive',
      description: 'Read the official privacy policy for TaskHive to understand how we collect, use, and protect your personal information.'
    }
  },
  {
    path:'terms-condition',
    component:TermsConditionComponent,
    data: {
      title: 'Terms and Conditions | TaskHive',
      description: 'Review the terms and conditions for using TaskHive’s services and website. Your agreement to these terms is required for all collaborations.'
    }
  },
  {
    path:'contact',
    component:ContactComponent,
    data: {
      title: 'Contact Us | Get in Touch with TaskHive',
      description: 'Have a project in mind? Contact the TaskHive team today to discuss your ideas and learn how we can help you achieve your goals.'
    }
  },
  {
    path:'course',
    component:CoursesComponent,
    data: {
      title: 'Courses | TaskHive',
      description: 'Upskill with our range of courses. Explore topics in software development, digital marketing, and more with TaskHive.'
    }
  },
  {
    path:'career',
    component:CarrierComponent,
    data: {
      title: 'Careers | TaskHive',
      description: 'Join our team! Explore exciting career opportunities at TaskHive and be part of our innovative journey.'
    }
  },
  {
    path:'career-details',
    component:CarrierDetailsComponent,
    data: {
      title: 'ALL Updated Careers | TaskHive',
      description: 'Join our team! and check latest openings at TaskHive.'
    }
  },
  {
    path:'career/:id',
    component:CarrierSummaryComponent,
    data: {
      title: 'Careers Details | TaskHive',
      description: 'Learn more about career opportunities at TaskHive and how you can contribute to our innovative team.'
    }
  },
  {
    path:'career-summary/:id',
    component:CarrierSummaryComponent,
    data: {
      title: 'Careers Detailed Summary | TaskHive',
      description: 'Learn more about career opportunities at TaskHive and how you can contribute to our innovative team.'
    }
  },
  {
    path:'career-form',
    component:CarrierFormComponent,
    data: {
      title: 'Careers Query | TaskHive',
      description: 'Upload your resume and apply for a job at TaskHive.'
    }
  },
  { 
    path: 'blog/:id', 
    component: BlogDetailsComponent,
    data: {
      title: 'Blogs Detail | TaskHive',
      description: 'Check our latest blogs in detail on various tech topics. Stay updated with TaskHive insights.'
    } 
  },
  { 
    path: 'project/:id', 
    component: ProjectDetailsComponent,
    data: {
      title: 'Project Details | TaskHive',
      description: 'Check our completed projects in detail. See how TaskHive delivers excellence.'
    } 
  },
  { 
    path: 'course/:id', 
    component: CourseDetailsComponent,
    data: {
      title: 'Course Details | TaskHive',
      description: 'Learn more about this course and enroll today on TaskHive.'
    } 
  },
  { 
    path: 'course/:id/enroll', 
    component: CourseFormComponent,
    data: {
      title: 'Enroll in Course | TaskHive',
      description: 'Complete your course enrollment with TaskHive.'
    } 
  },
  { 
    path: 'certificate', 
    component: CertificateComponent,
    data: {
      title: 'Certificate Verification | TaskHive',
      description: 'Verify your certificates issued by TaskHive.' 
    }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ComponentRoutingModule { }