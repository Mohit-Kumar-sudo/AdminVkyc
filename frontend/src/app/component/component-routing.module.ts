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
import { CyberSecurityComponent } from './cyber-security/cyber-security.component';
import { DigitalMarketingComponent } from './digital-marketing/digital-marketing.component';
import { WebDevelopmentComponent } from './web-development/web-development.component';
import { CarrierComponent } from './carrier/carrier.component';
import { CarrierDetailsComponent } from './carrier-details/carrier-details.component';
import { CarrierSummaryComponent } from './carrier-summary/carrier-summary.component';
import { CarrierFormComponent } from './carrier-form/carrier-form.component';

const routes: Routes = [
  {
    path:'home',
    component:HomeComponent
  },
  {
    path:'about',
    component:AboutComponent
  },
  {
    path:'services',
    component:ServicesComponent
  },
  {
    path:'portfolio',
    component:PortfolioComponent
  },
  {
    path:'pricing',
    component:PricingComponent
  },
  {
    path:'privacy-policy',
    component:PrivacyPolicyComponent
  },
  {
    path:'terms-condition',
    component:TermsConditionComponent
  },
  {
    path:'contact',
    component:ContactComponent
  },
  {
    path:'course',
    component:CoursesComponent
  },
  {
    path:'web-development',
    component:WebDevelopmentComponent
  },
  {
    path:'digital-marketing',
    component:DigitalMarketingComponent
  },
  {
    path:'cyber-security',
    component:CyberSecurityComponent
  },
  {
    path:'carrier',
    component:CarrierComponent
  },
  {
    path:'carrier-details',
    component:CarrierDetailsComponent
  },
  {
    path:'carrier/:id',
    component:CarrierSummaryComponent
  },
  {
    path:'carrier-summary/:id',
    component:CarrierSummaryComponent
  },
  {
    path:'carrier-form',
    component:CarrierFormComponent
  },
  { 
    path: 'blog/:id', 
    component: BlogDetailsComponent 
  },
  { 
    path: 'project/:id', 
    component: ProjectDetailsComponent 
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ComponentRoutingModule { }
