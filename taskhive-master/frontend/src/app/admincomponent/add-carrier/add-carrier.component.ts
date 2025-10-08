import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { AlertService } from '../../services/alert/alert.service';
import { ApiService } from '../../services/api/api.service';
import { timeout } from 'rxjs/operators';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-add-carrier',
  templateUrl: './add-carrier.component.html',
  styleUrls: ['./add-carrier.component.scss']
})
export class AddCarrierComponent implements OnInit {
  myForm!: FormGroup;
  isLoading = false;

  constructor(
    private carriersService: ApiService,
    private fb: FormBuilder,
    private as: AlertService,
    private route: Router
  ) {
    // All fields optional so partial submissions are allowed
    this.myForm = this.fb.group({
      jobTitle: [''],
      jobRole: [''],
      jobDuration: [''],
      jobLocation: [''],
      jobSkills: [''],
      jobExperience: [''],
      jobType: [''],
      jobPreference: [''],
      jobDescription: [''],
      jobSalary: [''],
      status: ['']
    });
  }

  ngOnInit() {}

  // helper methods to safely show toasts or fallback to alert()
  private showSuccess(msg: string) {
    try {
      if (this.as && typeof this.as.successToast === 'function') {
        this.as.successToast(msg);
      } else {
        alert(msg);
      }
    } catch {
      alert(msg);
    }
  }

  private showError(msg: string) {
    try {
      if (this.as && typeof this.as.errorToast === 'function') {
        this.as.errorToast(msg);
      } else {
        alert(msg);
      }
    } catch {
      alert(msg);
    }
  }

  // Trim empty strings/null/undefined and convert numeric fields before posting
  private buildPayload(raw: any) {
    const allowedFields = [
      'jobTitle', 'jobRole', 'jobDuration', 'jobLocation',
      'jobSkills', 'jobExperience', 'jobType', 'jobPreference',
      'jobDescription', 'jobSalary'
    ];

    const payload: any = {};
    for (const key of allowedFields) {
      const v = raw[key];

      // skip undefined/null/empty-string
      if (v === undefined || v === null) continue;
      if (typeof v === 'string' && v.trim() === '') continue;

      // convert numeric-looking fields to Number
      if (['jobDuration', 'jobExperience', 'jobSalary'].includes(key)) {
        const n = Number(v);
        payload[key] = Number.isFinite(n) ? n : v;
      } else {
        payload[key] = v;
      }
    }
    return payload;
  }

  onSubmit(frm: FormGroup) {
    if (this.isLoading) return; // prevent double submits

    // build trimmed payload
    const payload = this.buildPayload(frm.value);

    // Optionally: if payload is empty you may still want to send an empty object.
    // Here we'll allow sending an empty payload (backend can handle defaults).
    this.isLoading = true;

    this.carriersService.post('carriers', payload)
      .pipe(
        timeout(10000), // fail fast if backend is too slow
        finalize(() => this.isLoading = false)
      )
      .subscribe(
        (res: any) => {
          // success
          this.showSuccess('Carrier created successfully');
          // navigate after success
          this.route.navigate(['/admin/careers']);
        },
        (error: any) => {
          const errMsg = (error?.name === 'TimeoutError') ?
            'Server is taking too long to respond. Please try again later.' :
            (error?.message || 'Error creating carrier');

          this.showError(errMsg);
        }
      );
  }

}