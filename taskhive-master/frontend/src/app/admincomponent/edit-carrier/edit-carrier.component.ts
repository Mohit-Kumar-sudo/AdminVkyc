import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { ApiService } from '../../services/api/api.service';
import { AlertService } from '../../services/alert/alert.service';
import { Subscription, throwError } from 'rxjs';
import { timeout, finalize, catchError } from 'rxjs/operators';

@Component({
  selector: 'app-edit-carrier',
  templateUrl: './edit-carrier.component.html',
  styleUrls: ['./edit-carrier.component.scss']
})
export class EditCarrierComponent implements OnInit, OnDestroy {
  selectedCarriers: any = {};
  myForm!: FormGroup;
  image: File[] = [];
  isLoading = false;

  private updateSub?: Subscription;
  private fetchSub?: Subscription;

  constructor(
    private carriersService: ApiService,
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private as: AlertService
  ) {
    // Make all fields optional so partial update is allowed
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

  ngOnInit() {
    const carrierId = this.route.snapshot.paramMap.get('id');
    if (carrierId) {
      this.fetchCarriersById(carrierId);
    } else {
      console.error('Carriers ID is undefined on initialization');
      this.showError('Error: Carriers ID is undefined on initialization');
    }
  }

  ngOnDestroy() {
    this.updateSub?.unsubscribe();
    this.fetchSub?.unsubscribe();
  }

  // safe toast wrappers
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

  private showWarning(msg: string) {
    try {
      if (this.as && typeof this.as.warningToast === 'function') {
        this.as.warningToast(msg);
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

  fetchCarriersById(id: string) {
    this.fetchSub = this.carriersService.get(`carriers/${id}`, {}).subscribe(
      (res: any) => {
        if (res && res.data && res.data._id) {
          this.selectedCarriers = res.data;
          this.populateForm();
        } else {
          console.error('Carriers data does not contain an _id:', res);
          this.showError('Error: Carriers data is missing an ID.');
        }
      },
      (error) => {
        console.error(`Error fetching Carriers with ID ${id}:`, error);
        this.showError(`Error fetching carriers: ${error?.message || error}`);
      }
    );
  }

  populateForm() {
    // patch values so user sees current values and can update a subset
    this.myForm.patchValue({
      jobTitle: this.selectedCarriers.jobTitle ?? '',
      jobRole: this.selectedCarriers.jobRole ?? '',
      jobDuration: this.selectedCarriers.jobDuration ?? '',
      jobLocation: this.selectedCarriers.jobLocation ?? '',
      jobSkills: this.selectedCarriers.jobSkills ?? '',
      jobExperience: this.selectedCarriers.jobExperience ?? '',
      jobType: this.selectedCarriers.jobType ?? '',
      jobPreference: this.selectedCarriers.jobPreference ?? '',
      jobDescription: this.selectedCarriers.jobDescription ?? '',
      jobSalary: this.selectedCarriers.jobSalary ?? '',
      status: this.selectedCarriers.status ?? '',
    });
  }

  // Build a trimmed payload that includes only meaningful keys for update
  private buildPayloadForUpdate(formValue: any) {
    const allowedFields = [
      'jobTitle', 'jobRole', 'jobDuration', 'jobLocation',
      'jobSkills', 'jobExperience', 'jobType', 'jobPreference',
      'jobDescription', 'jobSalary', 'status'
    ];

    const payload: any = {};
    for (const key of allowedFields) {
      const v = formValue[key];

      // treat undefined/null/empty-string as "not provided"
      if (v === undefined || v === null) continue;
      if (typeof v === 'string' && v.trim() === '') continue;

      // convert numeric-like fields
      if (['jobDuration', 'jobExperience', 'jobSalary'].includes(key)) {
        const n = Number(v);
        payload[key] = Number.isFinite(n) ? n : v;
      } else {
        payload[key] = v;
      }
    }

    // If you want to allow unsetting a field explicitly, adjust logic above.
    return payload;
  }

  updateCarriers() {
    // mark touched to show validation UI if you keep validators in template
    this.myForm.markAllAsTouched();

    if (this.isLoading) return; // prevent double click

    // Build payload containing only updated / non-empty fields
    const payload = this.buildPayloadForUpdate(this.myForm.value);

    // If payload is empty, we can still allow update (no changes),
    // but better to warn user that no changes were detected.
    if (Object.keys(payload).length === 0) {
      // no changes: still send update? here we choose to warn and abort
      this.showWarning('No changes detected. Update requires at least one field changed.');
      return;
    }

    // keep updated_at info if desired
    payload.updated_at = new Date();

    if (!this.selectedCarriers._id) {
      console.error('Missing carrier id for update', this.selectedCarriers);
      this.showError('Error: Missing carrier id.');
      return;
    }

    this.isLoading = true;

    this.updateSub = this.carriersService.put('carriers', this.selectedCarriers._id, payload).pipe(
      timeout(10000),
      catchError(err => {
        return throwError(err);
      }),
      finalize(() => {
        this.isLoading = false;
      })
    ).subscribe(
      (res: any) => {
        this.showSuccess('Career updated successfully');
        alert('Career updated successfully');
        this.router.navigate(['/admin/careers']);
      },
      (error) => {
        const errMsg = (error?.name === 'TimeoutError') ?
          'Server is taking too long to respond. Please try again later.' :
          (error?.message || 'Error updating career');
        console.error('Error updating Career:', error);
        this.showError(errMsg);
      }
    );
  }

}