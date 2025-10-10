import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { LoginComponent } from './login.component';
import { ForgetpasswordComponent } from '../forgetpassword/forgetpassword.component';

@NgModule({
  declarations: [
    LoginComponent,
    ForgetpasswordComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    RouterModule.forChild([
      {
        path: '',
        component: LoginComponent
      },
      {
        path: 'forget-password',
        component: ForgetpasswordComponent
      }
    ])
  ]
})
export class LoginModule { }