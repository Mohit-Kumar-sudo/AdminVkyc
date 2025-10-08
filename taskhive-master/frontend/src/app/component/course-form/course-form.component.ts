declare var Razorpay: any;
// course-form.component.ts
import { Component, OnInit, OnDestroy, Inject, PLATFORM_ID } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CourseService } from '../../services/course/course.service';
import { CoursesService } from '../../services/courses/courses.service';
import { SsrService } from '../../services/ssr/ssr.service';
import { isPlatformBrowser } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-course-form',
  templateUrl: './course-form.component.html',
  styleUrls: ['./course-form.component.scss']
})
export class CourseFormComponent implements OnInit, OnDestroy {
  myForm!: FormGroup;
  isLoading = false;
  
  private timerInterval: any;
  // --- NEW STATE MANAGEMENT ---
  formStep: 'details' | 'payment' = 'details'; // To control which view is shown
  savedUserData: any = null; // To store user data after submission
  // --- BUNDLE OFFER STATE ---
  bundleSelected = false;
  bundlePrice = 187; // The price of your bundle offer
  // Timer properties
  hours: string = '00';
  minutes: string = '00';
  seconds: string = '00';
  daysLeft: number = 0;
  hasSale: boolean = false;
  saleEndDate: Date | null = null;
  isSaleActive: boolean = false;

  courseData: any = null;
  isBrowser: boolean;

  // Price calculation properties
  coursePrice: number = 12;
  originalPrice: number = 1499;
  gstPercentage: number = 18;
  gstAmount: number = 0;
  totalPayable: number = 0;
  currentCourse: any = null;

  constructor(
    private fb: FormBuilder,
    private _courseService: CourseService,
    private _coursesService: CoursesService,
    private ssrService: SsrService,
    private router: Router,
    private route: ActivatedRoute,
    @Inject(PLATFORM_ID) private platformId: any
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  ngOnInit(): void {
    this.initializeForm();
    this.getCourseDataFromNavigation();
    this.calculatePrices();
  }

  ngOnDestroy(): void {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
  }

  /* ------------------------- Data loading & initialization ------------------------- */

  private getCourseDataFromNavigation(): void {
    const navigation = this.router.getCurrentNavigation();
    if (navigation?.extras?.state) {
      this.loadCourseDataFromState(navigation.extras.state);
      return;
    }

    if (this.isBrowser) {
      const storedData = sessionStorage.getItem('courseEnrollmentData');
      if (storedData) {
        try {
          const parsedData = JSON.parse(storedData);
          this.loadCourseDataFromState(parsedData);
          return;
        } catch (e) {
          console.error('Error parsing stored course data:', e);
        }
      }
    }

    this.getCourseFromRoute();
  }

  private loadCourseDataFromState(state: any): void {
    this.courseData = state || {};
    this.hasSale = this.toBoolean(this.courseData.hasSale);
    this.saleEndDate = this.normalizeSaleEndDate(this.courseData.saleEndDate);
    if (this.hasSale && !this.saleEndDate) {
      this.saleEndDate = new Date(Date.now() + 24 * 60 * 60 * 1000);
    }

    this.coursePrice = Number(this.courseData.coursePrice) || this.coursePrice;
    this.originalPrice = Number(this.courseData.originalPrice) || this.originalPrice;

    this.calculatePrices();
    this.initializeFormWithCourseData();

    if (this.isBrowser) {
      this.startBackendTimer();
    }

    console.log('Course data loaded from state:', this.courseData, 'saleEndDate:', this.saleEndDate);
  }

  private getCourseFromRoute(): void {
    this.route.params.subscribe(params => {
      const courseId = params['id'];
      if (courseId) {
        this.fetchCourseDetails(courseId);
      } else {
        console.warn('No course ID found in route - using defaults');
        this.courseData = {
          courseTitle: 'General Course',
          coursePrice: this.coursePrice,
          originalPrice: this.originalPrice,
          hasSale: false
        };
        this.hasSale = false;
        this.calculatePrices();
        this.initializeFormWithCourseData();
      }
    });
  }

  private fetchCourseDetails(courseId: string): void {
    this.isLoading = true;
    this._coursesService.onCoursesFindOne(courseId).subscribe({
      next: (response: any) => {
        this.currentCourse = response?.data || response || null;

        if (this.currentCourse) {
          this.courseData = {
            courseId,
            courseTitle: this.currentCourse.title || 'Course',
            coursePrice: Number(this.currentCourse.price) || this.coursePrice,
            originalPrice: Number(this.currentCourse.original_price) || this.originalPrice,
            hasSale: this.currentCourse.has_sale ?? false,
            saleEndDate: this.currentCourse.sale_end_date ?? null
          };

          this.hasSale = this.toBoolean(this.courseData.hasSale);
          this.saleEndDate = this.normalizeSaleEndDate(this.courseData.saleEndDate);

          if (this.hasSale && !this.saleEndDate) {
            this.saleEndDate = new Date(Date.now() + 24 * 60 * 60 * 1000);
          }

          this.coursePrice = this.courseData.coursePrice;
          this.originalPrice = this.courseData.originalPrice;

          this.calculatePrices();
          this.initializeFormWithCourseData();

          if (this.isBrowser) {
            this.startBackendTimer();
          }

          if (this.isBrowser) {
            try {
              sessionStorage.setItem('courseEnrollmentData', JSON.stringify(this.courseData));
            } catch (e) {
              console.warn('sessionStorage write failed:', e);
            }
          }
        }
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error fetching course details:', error);
        this.courseData = {
          courseTitle: 'General Course',
          coursePrice: this.coursePrice,
          originalPrice: this.originalPrice,
          hasSale: false
        };
        this.hasSale = false;
        this.calculatePrices();
        this.initializeFormWithCourseData();
        this.isLoading = false;
      }
    });
  }

  /* ------------------------- Helpers: boolean & date normalization ------------------------- */

  private toBoolean(val: any): boolean {
    if (val === true || val === 1) return true;
    if (val === 'true' || val === '1' || val === 'yes' || val === 'Y') return true;
    return false;
  }

  private normalizeSaleEndDate(input: any): Date | null {
    if (!input) return null;

    let candidate: Date | null = null;

    if (input instanceof Date) {
      candidate = input;
    } else if (typeof input === 'number') {
      candidate = new Date(input < 1e12 ? input * 1000 : input);
    } else if (typeof input === 'string') {
      const trimmed = input.trim();
      if (/^\d+$/.test(trimmed)) {
        const num = Number(trimmed);
        candidate = new Date(num < 1e12 ? num * 1000 : num);
      } else {
        candidate = new Date(trimmed);
      }
    }

    if (candidate && !isNaN(candidate.getTime())) {
      return candidate;
    }

    return null;
  }

  /* ------------------------- Timer logic ------------------------- */

  private startBackendTimer(): void {
    if (!this.isBrowser) return;

    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }

    if (!this.hasSale) {
      this.isSaleActive = false;
      return;
    }

    let endTime = this.saleEndDate;
    if (!endTime) {
      endTime = new Date(Date.now() + 24 * 60 * 60 * 1000);
      this.saleEndDate = endTime;
    }

    console.log('Timer started with end date:', endTime);

    this.updateTimerValues(endTime);

    this.timerInterval = setInterval(() => {
      this.updateTimerValues(endTime as Date);
    }, 1000);
  }

  private updateTimerValues(endTime: Date): void {
    if (!(endTime instanceof Date) || isNaN(endTime.getTime())) {
      console.warn('Invalid endTime provided to updateTimerValues:', endTime);
      this.resetTimer();
      return;
    }

    const now = Date.now();
    const distance = endTime.getTime() - now;

    if (!isFinite(distance) || isNaN(distance) || distance <= 0) {
      this.daysLeft = 0;
      this.hours = '00';
      this.minutes = '00';
      this.seconds = '00';
      this.isSaleActive = false;
      this.hasSale = false;
      if (this.timerInterval) {
        clearInterval(this.timerInterval);
        this.timerInterval = null;
      }
      return;
    }

    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
    const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((distance % (1000 * 60)) / 1000);

    this.daysLeft = days;
    this.hours = String(hours).padStart(2, '0');
    this.minutes = String(minutes).padStart(2, '0');
    this.seconds = String(seconds).padStart(2, '0');
    this.isSaleActive = true;
  }

  private resetTimer(): void {
    this.daysLeft = 0;
    this.hours = '00';
    this.minutes = '00';
    this.seconds = '00';
    this.isSaleActive = false;
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
  }

  /* ------------------------- Form logic / prices / submit ------------------------- */

  private calculatePrices(): void {
    let basePrice = this.coursePrice;
    if (this.bundleSelected) {
      basePrice += this.bundlePrice;
    }

    this.gstAmount = (basePrice * this.gstPercentage) / 100;
    this.totalPayable = +(basePrice + this.gstAmount);
  }

  addBundleOffer(): void {
    if (!this.bundleSelected) {
      this.bundleSelected = true;
      this.calculatePrices();
    }
  }

  removeBundleOffer(): void {
    if (this.bundleSelected) {
      this.bundleSelected = false;
      this.calculatePrices();
    }
  }

  private initializeForm(): void {
    this.myForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      name: ['', [Validators.required, Validators.minLength(2)]],
      countryCode: ['India (+91)', Validators.required],
      number: ['', [Validators.required, Validators.pattern('^[0-9]{10}$')]],
      course: ['', Validators.required],
    });
  }

  private initializeFormWithCourseData(): void {
    let courseTitle = '';
    if (this.courseData?.courseTitle) {
      courseTitle = this.courseData.courseTitle;
    } else if (this.currentCourse?.title) {
      courseTitle = this.currentCourse.title;
    } else {
      courseTitle = 'General Course';
    }

    if (courseTitle && this.myForm) {
      this.myForm.patchValue({ course: courseTitle });
      this.myForm.get('course')?.disable();
      console.log('Form pre-filled with course:', courseTitle);
    }
  }

  // --- NEW: Just validate and move to payment summary view ---
  goToPayment(): void {
    if (this.myForm.invalid) {
      this.markFormGroupTouched();
      this.showValidationAlert();
      return;
    }
    
    // Just switch to payment summary view - no backend call yet
    this.formStep = 'payment';
  }

  // --- NEW: Handle the actual payment when user clicks the payment button ---
  proceedToPayment(): void {
    if (this.myForm.invalid) {
      this.showValidationAlert();
      return;
    }
    
    this.isLoading = true;

    const formValue = this.myForm.getRawValue();

    const payload = {
      ...formValue,
      bundle_purchased: this.bundleSelected,
      total_amount: this.totalPayable,
      course: this.courseData?.courseTitle || 'Not Specified',
      price: this.coursePrice.toString()
    };

    this._courseService.onCourseSave(payload).subscribe({
      next: (response) => {
        console.log('Backend Response:', response);
        this.isLoading = false;
        this.savedUserData = response.userData;
        
        // Initiate Razorpay payment
        this.initiateRazorpayCheckout(response.razorpayOrder);
      },
      error: (error) => {
        console.error('Error submitting form:', error);
        this.showErrorAlert();
        this.isLoading = false;
      }
    });
  }

  // --- INITIATE RAZORPAY CHECKOUT ---
  initiateRazorpayCheckout(order: any): void {
      const options = {
          key: 'rzp_live_RQrpsjQr9KzpN7',
          amount: order.amount,
          currency: order.currency,
          name: 'Taskhive',
          description: `Payment for ${this.courseData?.courseTitle}`,
          order_id: order.id,
          handler: (response: any) => {
              console.log('Razorpay Success Response:', response);
              this.verifyPaymentOnBackend(response);
          },
          prefill: {
              name: this.myForm.get('name')?.value,
              email: this.myForm.get('email')?.value,
              contact: this.myForm.get('number')?.value
          },
          notes: {
              course_id: this.courseData?.courseId || 'N/A'
          },
          theme: {
              color: '#3399cc'
          },
          modal: {
            ondismiss: () => {
              console.log('User closed the payment window.');
            }
          }
      };
      
      const rzp = new Razorpay(options);
      rzp.open();
  }

  // --- VERIFY PAYMENT ON BACKEND ---
  verifyPaymentOnBackend(paymentResponse: any): void {
    this.isLoading = true;
    const paymentData = {
      razorpay_order_id: paymentResponse.razorpay_order_id,
      razorpay_payment_id: paymentResponse.razorpay_payment_id,
      razorpay_signature: paymentResponse.razorpay_signature
    };

    this._courseService.verifyPayment(this.savedUserData._id, paymentData).subscribe({
      next: (response) => {
        this.isLoading = false;
        if(response.success) {
          alert("Payment Successful! A confirmation has been sent to your email.");
          // this.router.navigate(['/thank-you']);
        } else {
          this.showErrorAlert();
        }
      },
      error: (err) => {
        this.isLoading = false;
        console.error("Payment verification failed", err);
        alert("Payment verification failed. Please contact support.");
      }
    });
  }

  // --- Method to go back and edit details ---
  editDetails(): void {
    this.formStep = 'details';
  }

  /* ------------------------- Alerts & helpers ------------------------- */

  private showErrorAlert(): void {
    if (this.isBrowser) alert("Oops! Something went wrong. Please try again in a moment.");
  }
  private showValidationAlert(): void {
    if (this.isBrowser) alert("Please fill all the required fields correctly before submitting.");
  }

  private markFormGroupTouched(): void {
    Object.keys(this.myForm.controls).forEach(key => {
      const control = this.myForm.get(key);
      control?.markAsTouched();
    });
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.myForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  getFieldError(fieldName: string): string {
    const field = this.myForm.get(fieldName);
    if (field?.errors) {
      if (field.errors['required']) return 'This field is required';
      if (field.errors['email']) return 'Please enter a valid email address';
      if (field.errors['pattern']) return 'Please enter a valid 10-digit mobile number';
      if (field.errors['minlength']) return 'Name must be at least 2 characters long';
    }
    return '';
  }

  get displayEmail(): string {
    return this.myForm.get('email')?.value || 'localhost@gmail.com';
  }

  get displayPhone(): string {
    const countryCode = this.myForm.get('countryCode')?.value;
    const number = this.myForm.get('number')?.value;
    return number ? `${countryCode} ${number}` : '+919876543210';
  }
}