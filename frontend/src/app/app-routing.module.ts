import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LayoutComponent } from './layout/layout.component';
import { AdminlayoutComponent } from './adminlayout/adminlayout.component';

const routes: Routes = [
  // Default route - redirect to home
  {
    path: '',
    redirectTo: '/home',
    pathMatch: 'full',
  },
  
  // Login route - standalone (no layout wrapper)
  {
    path: 'login',
    loadChildren: () =>
      import('./admincomponent/login/login.module').then((m) => m.LoginModule),
  },
  
  // Admin routes with AdminlayoutComponent (dashboard, projects, etc.)
  {
    path: 'admin',
    component: AdminlayoutComponent,
    children: [
      {
        path: '',
        loadChildren: () =>
          import('./adminlayout/adminlayout.module').then((m) => m.AdminlayoutModule),
      },
    ],
  },
  
  // Public routes with LayoutComponent
  {
    path: '',
    component: LayoutComponent,
    children: [
      {
        path: '',
        loadChildren: () =>
          import('./layout/layout.module').then((m) => m.LayoutModule),
      },
    ],
  },
  
  // Wildcard route - should be last
  {
    path: '**',
    redirectTo: '/home',
  },
];


@NgModule({
  imports: [RouterModule.forRoot(routes, {
  scrollPositionRestoration: 'enabled',  // Scrolls to top automatically
  anchorScrolling: 'enabled'             // (Optional) Enables #fragment scrolling
})
],
  exports: [RouterModule]
})
export class AppRoutingModule { }
