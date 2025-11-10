import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { HttpError } from 'src/app/models/http-error';
import { AuthService } from 'src/app/services/auth.service';
import { MatSnackBar } from '@angular/material';
import { NgxSpinnerService } from 'ngx-spinner';
import {Router} from '@angular/router';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent implements OnInit {

  registerForm: FormGroup;
  error: HttpError;


  constructor(
    private authService: AuthService,
    private _snackBar: MatSnackBar,
    private router: Router,
    private spinner: NgxSpinnerService
  ) { }

  ngOnInit() {
    this.registerForm = new FormGroup({
      firstName: new FormControl('', [Validators.required]),
      lastName: new FormControl('', [Validators.required]),
      email: new FormControl('', [Validators.required, Validators.email]),
      password: new FormControl('', [Validators.required, Validators.minLength(6)])
    });
  }

  get firstName() { return this.registerForm.get('firstName'); }
  get lastname() { return this.registerForm.get('lastName'); }
  get email() { return this.registerForm.get('email'); }
  get password() { return this.registerForm.get('password'); }

  onRegister() {
    if (this.registerForm.valid) {
      this.spinner.show();
      this.authService.register(this.registerForm.value).subscribe(d => {
        if (d) {
          this.spinner.hide();
          this.router.navigate(['login']);
          this._snackBar.open('Registered successfully, Please check you email to confirm the account.', 'Close', {
            duration: 5000,
          });
        }
      }, err => {
        this.spinner.hide();
        console.log(err.error.errorMessage);
        if (err.error.errorCode) {
          this._snackBar.open(err.error.errorMessage.email, 'Close', {
            duration: 5000,
          });
        }
      })
    }
  }
}
