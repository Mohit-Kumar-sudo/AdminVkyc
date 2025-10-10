import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../services/auth/auth.service';
import { AlertService } from '../../services/alert/alert.service';

@Component({
  selector: 'app-forgetpassword',
  templateUrl: './forgetpassword.component.html',
  styleUrl: './forgetpassword.component.scss'
})
export class ForgetpasswordComponent {
  resetPasswordForm: FormGroup;
  isLoading = false;
  resetToken: string = '';
  
  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private alertService: AlertService
  ) {
    this.resetPasswordForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      newPassword: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]]
    }, { 
      validators: this.passwordMatchValidator 
    });

    // Get reset token from URL parameters if available
    this.route.queryParams.subscribe(params => {
      this.resetToken = params['token'] || '';
    });
  }

  // Custom validator to check if passwords match
  passwordMatchValidator(control: AbstractControl): {[key: string]: any} | null {
    const newPassword = control.get('newPassword');
    const confirmPassword = control.get('confirmPassword');
    
    if (newPassword && confirmPassword && newPassword.value !== confirmPassword.value) {
      confirmPassword.setErrors({ passwordMismatch: true });
      return { passwordMismatch: true };
    } else {
      if (confirmPassword?.errors?.['passwordMismatch']) {
        delete confirmPassword.errors['passwordMismatch'];
        if (Object.keys(confirmPassword.errors).length === 0) {
          confirmPassword.setErrors(null);
        }
      }
      return null;
    }
  }

  submit() {
  if (this.resetPasswordForm.valid) {
    this.isLoading = true;

    const resetData = {
      newPassword: this.resetPasswordForm.get('newPassword')?.value,
      confirmPassword: this.resetPasswordForm.get('confirmPassword')?.value,
      email: this.resetPasswordForm.get('email')?.value
    };

    this.authService.resetPassword(resetData).subscribe({
      next: (resp: any) => {
        this.isLoading = false;

        if (resp.success) {
          this.alertService.successToast(resp.msg || "Password updated successfully");
          alert(resp.msg || "Password updated successfully"); // ✅ Alert dialog
          this.router.navigate(['/login']);
        } else {
          this.alertService.errorToast(resp.message || 'Failed to update password');
          alert(resp.message || 'Failed to update password'); // ❌ Alert dialog
        }
      },
      error: (error) => {
        this.isLoading = false;
        console.error('Password reset error:', error);

        let errorMsg = 'Server connection failed. Please try again later.';
        if (error.status === 400) {
          errorMsg = error.error?.error?.message || 'Invalid request. Please check your input.';
        } else if (error.status === 404) {
          errorMsg = 'User not found.';
        }

        this.alertService.errorToast(errorMsg);
        alert(errorMsg); // ❌ Alert dialog
      }
    });
  } else {
    this.markFormGroupTouched();
  }
}

  private markFormGroupTouched() {
    Object.keys(this.resetPasswordForm.controls).forEach(field => {
      const control = this.resetPasswordForm.get(field);
      control?.markAsTouched({ onlySelf: true });
    });
  }
}