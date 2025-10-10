import { Component, OnInit, HostListener, ElementRef, AfterViewInit, OnDestroy, Inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CourseService } from '../../services/course/course.service';
import { CoursesService } from '../../services/courses/courses.service';
import { environment } from '../../../environments/environment';
import { ApiService } from '../../services/api/api.service';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';
import { SsrService } from '../../services/ssr/ssr.service';
import { Title, Meta } from '@angular/platform-browser';
import { Router } from '@angular/router';

declare var Swiper: any;
@Component({
  selector: 'app-course-details',
  templateUrl: './course-details.component.html',
  styleUrls: [
        './course-details.component.scss',
        '../../../../node_modules/swiper/swiper-bundle.min.css' // Path to node_modules
      ]
})
export class CourseDetailsComponent implements OnInit, AfterViewInit, OnDestroy {
  course: any = null;
  courseId: string = '';
  otherCourses: any[] = [];
  studentsSlider: any;
  hours: string = '00';
  minutes: string = '00';
  seconds: string = '00';
  // ADD THESE NEW PROPERTIES:
  daysLeft: number = 0;
  hasSale: boolean = false;
  saleEndDate: Date | null = null;
  isSaleActive: boolean = false;
  private timerInterval: any;
  partnersSlider: any;
  // STUDENTS / MARQUEE
  students: any[] = [];
  isStudentsLoading = false;
  studentsError: string | null = null;
  private hasDragged = false;
  
  // Testimonial Slider properties (prefixed with 'testimonial')
  testimonials: any[] = [];
  isTestimonialsLoading = true;
  testimonialError: string | null = null;
  testimonialCurrentIndex = 0;
  testimonialCurrentTranslate = 0;
  testimonialPrevTranslate = 0;
  testimonialIsDragging = false;
  testimonialStartPosition = 0;
  testimonialCardsToShow = 3;
  testimonialCardWidth = 0;
  testimonialMaxIndex = 0;

  // Other Courses Slider properties (prefixed with 'courses')
  isOtherCoursesLoading = true;
  otherCoursesError: string | null = null;
  coursesCurrentIndex = 0;
  coursesCurrentTranslate = 0;
  coursesPrevTranslate = 0;
  coursesIsDragging = false;
  coursesStartPosition = 0;
  coursesCardsToShow = 3;
  coursesCardWidth = 0;
  coursesMaxIndex = 0;
  courseImage: string = 'assets/images/degital-marketing-1.webp'; // default/fallback
  courseImage1: string = 'assets/images/degital-marketing-1.webp';

    partnerLogos = [
    { name: 'Microsoft', logo: '/assets/images/Microsoft1.webp' },
    { name: 'zontal', logo: '/assets/images/zontal.webp' },
    { name: 'Makeitmud', logo: '/assets/images/makeitmud.webp' },
    { name: 'Holo', logo: '/assets/images/4.webp' },
    { name: 'Virtual Heritage', logo: '/assets/images/1.webp' },
    { name: 'Brisk Transfare', logo: '/assets/images/2.webp' },
    { name: 'Allana', logo: '/assets/images/3.webp' },
    { name: 'SakantMochan', logo: '/assets/images/sankatmochan.webp' }
  ];


  constructor(
    private _courseService: CourseService,
    private _coursesService: CoursesService,
    private _apiService: ApiService,
    private studentService: ApiService,
    private route: ActivatedRoute,
    private router: Router,
    private elRef: ElementRef,
    private ssrService: SsrService,
    private titleService: Title,
    private metaService: Meta
  ) {}

  private isBrowser(): boolean {
    return typeof window !== 'undefined' && !!window.alert;
  }

  async ngOnInit() {
    if (this.ssrService.isBrowser()) {
      const AOS = await this.ssrService.loadAOS();
      const aosInstance = AOS?.default || AOS;
      if (typeof aosInstance.init === 'function') {
        aosInstance.init({
          offset: 200,
          duration: 1000,
          easing: 'ease',
          delay: 100,
          once: true
        });
      }
    }

    this.route.params.subscribe(params => {
      this.courseId = params['id'];
      this.loadCourseDetails();
      this.loadOtherCourses();
      this.loadTestimonials();
      this.loadStudents();
    });
  }
  
  ngAfterViewInit(): void {
    if (this.ssrService.isBrowser()) {
      setTimeout(() => {
        this.initializeTestimonialSlider();
        this.initializeCoursesSlider();
        this.initPartnersSlider();
      }, 100);
    }
  }

  ngOnDestroy() {
  // Always clear the timer
  if (this.timerInterval) {
    clearInterval(this.timerInterval);
    this.timerInterval = null;
  }
  
  // Only destroy Swiper on browser
  if (this.ssrService.isBrowser() && this.partnersSlider) {
    try { 
      this.partnersSlider.destroy(true, true); 
    } catch (e) { 
      console.warn('Error destroying Swiper:', e);
    }
    this.partnersSlider = null;
  }
}

  // ================= STUDENTS (MARQUEE) =================
    private loadStudents(): void {
    this.isStudentsLoading = true;
    this.studentsError = null;
    const MODEL_NAME = 'students';
    this.studentService.get(`${MODEL_NAME}/public`, {}).subscribe({
      next: (response: any) => {
        const payload = response && response.data ? response.data : response;
        this.students = Array.isArray(payload) ? payload : [];
        this.students = this.students.filter((s: any) => s.is_active !== false);
        this.isStudentsLoading = false;
        if (this.ssrService.isBrowser()) {
          setTimeout(() => {
            this.initPartnersSlider();
          }, 150);
        }
      },
      error: (err) => {
        console.error('Error loading students:', err);
        this.studentsError = 'Failed to load student placements.';
        this.isStudentsLoading = false;
      }
    });
  }


  private async initPartnersSlider() {
    if (!this.ssrService.isBrowser()) return;

    // Dynamically import Swiper
    const Swiper = (await import('swiper')).default;
    Swiper.use([Navigation, Pagination, Autoplay]);
    
    if (this.partnersSlider) {
      try { this.partnersSlider.destroy(true, true); } catch (e) { /* ignore */ }
      this.partnersSlider = null;
    }
    if (!this.students || this.students.length === 0) {
      return;
    }
    this.partnersSlider = new Swiper('.partners-slider', {
      slidesPerView: 'auto',
      spaceBetween: 25,
      loop: true,
      speed: 5000,
      autoplay: {
        delay: 1,
        disableOnInteraction: false,
      },
      freeMode: {
        enabled: true,
        momentum: false,
      },
      grabCursor: false,
      allowTouchMove: false,
      breakpoints: {
        320: { spaceBetween: 15 },
        768: { spaceBetween: 25 }
      }
    });
  }

  // ============ TIMER METHODS ============
// ============ TIMER METHODS ============
private startAutoRenewingTimer(): void {
  // Only run in browser
  if (!this.ssrService.isBrowser()) {
    return;
  }

  // Clear existing interval
  if (this.timerInterval) {
    clearInterval(this.timerInterval);
    this.timerInterval = null;
  }

  // Get sale duration from course data
  const saleDurationMinutes = this.course?.sale_duration_minutes || 5;
  
  console.log('Starting auto-renewing timer with duration:', saleDurationMinutes, 'minutes');

  // Initial update
  this.updateAutoRenewingTimer(saleDurationMinutes);

  // Update every second
  this.timerInterval = setInterval(() => {
    this.updateAutoRenewingTimer(saleDurationMinutes);
  }, 1000);
}

private updateAutoRenewingTimer(saleDurationMinutes: number): void {
  // Calculate total seconds for the sale duration
  const totalSaleSeconds = saleDurationMinutes * 60;
  
  // Get current time and calculate elapsed time in current cycle
  const now = Date.now();
  const elapsedSeconds = Math.floor((now / 1000) % totalSaleSeconds);
  const remainingSeconds = totalSaleSeconds - elapsedSeconds;
  
  // Calculate minutes and seconds for display
  const displayMinutes = Math.floor(remainingSeconds / 60);
  const displaySeconds = remainingSeconds % 60;
  
  // Update display
  this.minutes = displayMinutes.toString().padStart(2, '0');
  this.seconds = displaySeconds.toString().padStart(2, '0');
  this.isSaleActive = true;
  
  console.log(`Timer: ${this.minutes}:${this.seconds} (${remainingSeconds}s remaining in cycle)`);
}


// ============ COURSE ENROLLMENT METHOD ============
onBuyCourse(): void {
  if (!this.courseId || !this.course) {
    console.error('No course ID or course details available');
    if (this.ssrService.isBrowser()) {
      alert('Course information not available. Please try again.');
    }
    return;
  }

  // Prepare comprehensive course data
  const coursePrice = this.course.price || this.course.sale_price || 12;
  const originalPrice = this.course.original_price || this.course.regular_price || 1499;
  
  // Calculate if there's an active sale
  const hasSale = this.course.has_sale || (coursePrice < originalPrice);
  
  // Store data in sessionStorage as backup (for page refresh)
  if (this.ssrService.isBrowser()) {
    const courseEnrollmentData = {
      courseId: this.courseId,
      courseTitle: this.course.title,
      coursePrice: coursePrice,
      originalPrice: originalPrice,
      hasSale: hasSale,
      saleDurationMinutes: this.course.sale_duration_minutes || 5, // ADD THIS
      courseDescription: this.course.description || '',
      courseImage: this.getCourseImage(this.course)
    };
    
    sessionStorage.setItem('courseEnrollmentData', JSON.stringify(courseEnrollmentData));
  }

  // Navigate with state
  this.router.navigate(['/course', this.courseId, 'enroll'], {
    state: {
      courseId: this.courseId,
      courseTitle: this.course.title,
      coursePrice: coursePrice,
      originalPrice: originalPrice,
      hasSale: hasSale,
      saleDurationMinutes: this.course.sale_duration_minutes || 5, // ADD THIS
      courseDescription: this.course.description || '',
      courseImage: this.getCourseImage(this.course)
    }
  });
}

  // Helper to resolve student image -> returns absolute URL or fallback
getStudentImage(student: any): string {
  if (!student || !student.image) {
    return 'assets/images/default.png';
  }
  const img = student.image as string;

  // Already a full URL
  if (img.startsWith('http://') || img.startsWith('https://')) {
    return img;
  }

  // If image stored as 'uploads/...' or '/uploads/...'
  if (img.startsWith('uploads/') || img.startsWith('/uploads/')) {
    // ensure environment.url has no trailing slash
    return `${environment.url.replace(/\/$/, '')}/${img.replace(/^\/?/, '')}`;
  }

  // If image starts with 'assets/' -> use as-is
  if (img.startsWith('assets/')) {
    return img;
  }

  // Otherwise treat as path relative to server root
  return `${environment.url.replace(/\/$/, '')}/${img.replace(/^\/?/, '')}`;
}

trackByStudent(index: number, student: any): any {
  return student._id || student.id || index;
}

  // Window resize handler for both sliders
  @HostListener('window:resize')
  onResize() {
    if (this.ssrService.isBrowser()) {
      this.updateTestimonialCardsToShow();
      this.updateCoursesCardsToShow();
    }
  }

  // ============ TESTIMONIAL SLIDER METHODS ============
  initializeTestimonialSlider(): void {
    this.updateTestimonialCardsToShow();
  }

  updateTestimonialCardsToShow(): void {
    if (!this.ssrService.isBrowser()) return;
    const windowWidth = window.innerWidth;
    
    if (windowWidth < 768) {
      this.testimonialCardsToShow = 1;
    } else if (windowWidth < 992) {
      this.testimonialCardsToShow = 2;
    } else {
      this.testimonialCardsToShow = 3;
    }

    const container = this.elRef.nativeElement.querySelector('.testimonials-slider');
    if (container) {
      const containerWidth = container.offsetWidth;
      this.testimonialCardWidth = containerWidth / this.testimonialCardsToShow;
      
      const cardWrappers = this.elRef.nativeElement.querySelectorAll('.testimonial-card-wrapper');
      cardWrappers.forEach((wrapper: HTMLElement) => {
        wrapper.style.width = `${100 / this.testimonialCardsToShow}%`;
      });
    }

    this.calculateTestimonialMaxIndex();
    
    if (this.testimonialCurrentIndex > this.testimonialMaxIndex) {
      this.testimonialCurrentIndex = this.testimonialMaxIndex;
    }
    
    this.setTestimonialPositionByIndex();
  }
  
  calculateTestimonialMaxIndex(): void {
    const totalCards = this.testimonials.length;
    this.testimonialMaxIndex = Math.max(0, totalCards - this.testimonialCardsToShow);
  }

  setTestimonialPositionByIndex(): void {
    if (!this.ssrService.isBrowser()) return;
    const container = this.elRef.nativeElement.querySelector('.testimonials-slider');
    if (container) {
      const containerWidth = container.offsetWidth;
      this.testimonialCardWidth = containerWidth / this.testimonialCardsToShow;
    }
    
    this.testimonialCurrentTranslate = this.testimonialCurrentIndex * -this.testimonialCardWidth;
    this.testimonialPrevTranslate = this.testimonialCurrentTranslate;
    
    const sliderTrack = this.elRef.nativeElement.querySelector('.testimonials-slider-track');
    if (sliderTrack) {
      sliderTrack.style.transform = `translateX(${this.testimonialCurrentTranslate}px)`;
    }
  }

  nextTestimonialSlide(): void {
    if (this.testimonialCurrentIndex < this.testimonialMaxIndex) {
      this.testimonialCurrentIndex++;
      this.setTestimonialPositionByIndex();
    }
  }

  prevTestimonialSlide(): void {
    if (this.testimonialCurrentIndex > 0) {
      this.testimonialCurrentIndex--;
      this.setTestimonialPositionByIndex();
    }
  }
  
  goToTestimonialSlide(index: number): void {
    if (index >= 0 && index <= this.testimonialMaxIndex) {
      this.testimonialCurrentIndex = index;
      this.setTestimonialPositionByIndex();
    }
  }

  testimonialTouchStart(event: MouseEvent | TouchEvent): void {
    if (!this.ssrService.isBrowser()) return;
    event.preventDefault();
    if (this.testimonialIsDragging) return;
    
    this.testimonialIsDragging = true;
    this.testimonialStartPosition = this.getPositionX(event);
    this.testimonialPrevTranslate = this.testimonialCurrentTranslate;
  }

  testimonialTouchMove(event: MouseEvent | TouchEvent): void {
    if (!this.ssrService.isBrowser()) return;
    if (!this.testimonialIsDragging) return;
    
    const currentPosition = this.getPositionX(event);
    const diff = currentPosition - this.testimonialStartPosition;
    
    this.testimonialCurrentTranslate = this.testimonialPrevTranslate + diff;
    
    const minTranslate = -this.testimonialCardWidth * this.testimonialMaxIndex;
    const maxTranslate = 0;
    
    if (this.testimonialCurrentTranslate < minTranslate) {
      this.testimonialCurrentTranslate = minTranslate;
    } else if (this.testimonialCurrentTranslate > maxTranslate) {
      this.testimonialCurrentTranslate = maxTranslate;
    }
    
    const sliderTrack = this.elRef.nativeElement.querySelector('.testimonials-slider-track');
    if (sliderTrack) {
      sliderTrack.style.transform = `translateX(${this.testimonialCurrentTranslate}px)`;
    }
  }

  testimonialTouchEnd(): void {
    if (!this.ssrService.isBrowser()) return;
    if (!this.testimonialIsDragging) return;
    
    this.testimonialIsDragging = false;
    
    const movedBy = this.testimonialCurrentTranslate - this.testimonialPrevTranslate;
    
    if (movedBy < -50 && this.testimonialCurrentIndex < this.testimonialMaxIndex) {
      this.testimonialCurrentIndex++;
    } else if (movedBy > 50 && this.testimonialCurrentIndex > 0) {
      this.testimonialCurrentIndex--;
    }
    
    this.setTestimonialPositionByIndex();
  }

  // ============ OTHER COURSES SLIDER METHODS ============
  initializeCoursesSlider(): void {
    this.updateCoursesCardsToShow();
  }

  updateCoursesCardsToShow(): void {
    if (!this.ssrService.isBrowser()) return;
    const windowWidth = window.innerWidth;
    
    if (windowWidth < 768) {
      this.coursesCardsToShow = 1;
    } else if (windowWidth < 992) {
      this.coursesCardsToShow = 2;
    } else {
      this.coursesCardsToShow = 3;
    }

    const container = this.elRef.nativeElement.querySelector('.courses-slider');
    if (container) {
      const containerWidth = container.offsetWidth;
      this.coursesCardWidth = containerWidth / this.coursesCardsToShow;
      
      const cardWrappers = this.elRef.nativeElement.querySelectorAll('.course-card-wrapper');
      cardWrappers.forEach((wrapper: HTMLElement) => {
        wrapper.style.width = `${100 / this.coursesCardsToShow}%`;
      });
    }

    this.calculateCoursesMaxIndex();
    
    if (this.coursesCurrentIndex > this.coursesMaxIndex) {
      this.coursesCurrentIndex = this.coursesMaxIndex;
    }
    
    this.setCoursesPositionByIndex();
  }
  
  calculateCoursesMaxIndex(): void {
    const totalCards = this.otherCourses.length;
    this.coursesMaxIndex = Math.max(0, totalCards - this.coursesCardsToShow);
  }

  setCoursesPositionByIndex(): void {
    if (!this.ssrService.isBrowser()) return;
    const container = this.elRef.nativeElement.querySelector('.courses-slider');
    if (container) {
      const containerWidth = container.offsetWidth;
      this.coursesCardWidth = containerWidth / this.coursesCardsToShow;
    }
    
    this.coursesCurrentTranslate = this.coursesCurrentIndex * -this.coursesCardWidth;
    this.coursesPrevTranslate = this.coursesCurrentTranslate;
    
    const sliderTrack = this.elRef.nativeElement.querySelector('.courses-slider-track');
    if (sliderTrack) {
      sliderTrack.style.transform = `translateX(${this.coursesCurrentTranslate}px)`;
    }
  }

  nextCoursesSlide(): void {
    if (this.coursesCurrentIndex < this.coursesMaxIndex) {
      this.coursesCurrentIndex++;
      this.setCoursesPositionByIndex();
    }
  }

  prevCoursesSlide(): void {
    if (this.coursesCurrentIndex > 0) {
      this.coursesCurrentIndex--;
      this.setCoursesPositionByIndex();
    }
  }
  
  goToCoursesSlide(index: number): void {
    if (index >= 0 && index <= this.coursesMaxIndex) {
      this.coursesCurrentIndex = index;
      this.setCoursesPositionByIndex();
    }
  }

  coursesTouchStart(event: MouseEvent | TouchEvent): void {
  if (!this.ssrService.isBrowser()) return;
  
  // Allow clicks on buttons and links
  const target = event.target as HTMLElement;
  if (target.closest('a, button, .clickable')) {
    return; // Don't interfere with interactive elements
  }
  
  // Don't call preventDefault here - only when actually dragging
  if (this.coursesIsDragging) return;
  
  this.hasDragged = false; // Reset drag flag
  this.coursesIsDragging = true;
  this.coursesStartPosition = this.getPositionX(event);
  this.coursesPrevTranslate = this.coursesCurrentTranslate;
}

  coursesTouchMove(event: MouseEvent | TouchEvent): void {
  if (!this.ssrService.isBrowser()) return;
  if (!this.coursesIsDragging) return;
  
  const currentPosition = this.getPositionX(event);
  const diff = currentPosition - this.coursesStartPosition;
  
  // Only start dragging if moved more than 10px (prevents accidental drag on tap)
  if (Math.abs(diff) < 10) {
    return;
  }
  
  // Now we know user is dragging, prevent default and mark as dragged
  event.preventDefault();
  this.hasDragged = true;
  
  this.coursesCurrentTranslate = this.coursesPrevTranslate + diff;
  
  const minTranslate = -this.coursesCardWidth * this.coursesMaxIndex;
  const maxTranslate = 0;
  
  if (this.coursesCurrentTranslate < minTranslate) {
    this.coursesCurrentTranslate = minTranslate;
  } else if (this.coursesCurrentTranslate > maxTranslate) {
    this.coursesCurrentTranslate = maxTranslate;
  }
  
  const sliderTrack = this.elRef.nativeElement.querySelector('.courses-slider-track');
  if (sliderTrack) {
    sliderTrack.style.transform = `translateX(${this.coursesCurrentTranslate}px)`;
  }
}

  coursesTouchEnd(): void {
  if (!this.ssrService.isBrowser()) return;
  if (!this.coursesIsDragging) return;
  
  this.coursesIsDragging = false;
  
  // Only snap to card if user actually dragged
  if (this.hasDragged) {
    const movedBy = this.coursesCurrentTranslate - this.coursesPrevTranslate;
    
    if (movedBy < -50 && this.coursesCurrentIndex < this.coursesMaxIndex) {
      this.coursesCurrentIndex++;
    } else if (movedBy > 50 && this.coursesCurrentIndex > 0) {
      this.coursesCurrentIndex--;
    }
    
    this.setCoursesPositionByIndex();
  }
  
  this.hasDragged = false; // Reset for next interaction
}

  // ============ SHARED UTILITY METHODS ============
  private getPositionX(event: MouseEvent | TouchEvent): number {
    return event instanceof MouseEvent 
      ? event.clientX 
      : event.touches[0].clientX;
  }

  // ============ DATA LOADING METHODS ============
loadCourseDetails(): void {
    this._coursesService.onCoursesFindOne(this.courseId).subscribe({
        next: (response: any) => {
            this.course = response?.data || response || null;

            if (this.course) {
                // Set dynamic title and meta tags
                this.titleService.setTitle(this.course.title + ' | TaskHive');
                this.metaService.updateTag({ 
                    name: 'description', 
                    content: this.course.description || 'Learn more about the ' + this.course.title + ' course at TaskHive.' 
                });

                // Setup sale timer with backend data
                this.setupSaleTimer();
                
                console.log('Course loaded:', {
                    title: this.course.title,
                    price: this.course.price,
                    hasSale: this.course.has_sale,
                    saleEndDate: this.course.sale_end_date
                });
            }
            
            this.courseImage = this.getCourseImage(this.course);
            this.courseImage1 = this.getCourseImage1(this.course);
        },
        error: (error) => {
            console.error('Error loading course details:', error);
            this.course = null;
            this.courseImage = 'assets/images/degital-marketing-1.webp';
            this.courseImage1 = 'assets/images/degital-marketing-1.webp';
            this.titleService.setTitle('Course Details | TaskHive');
        }
    });
}

setupSaleTimer(): void {
  if (!this.course) {
    console.warn('No course data available for timer setup');
    return;
  }
  
  // Check if course has an active sale
  this.hasSale = this.course.has_sale || false;
  
  console.log('Setting up sale timer:', {
    hasSale: this.hasSale,
    saleDurationMinutes: this.course.sale_duration_minutes
  });
  
  if (this.hasSale && this.course.sale_duration_minutes) {
    this.isSaleActive = true;
    
    // Clear any existing timer
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
    
    // Start the auto-renewing countdown timer
    this.startAutoRenewingTimer();
    
    console.log('Auto-renewing sale timer started. Duration:', this.course.sale_duration_minutes, 'minutes');
  } else {
    // No active sale
    console.log('No active sale for this course');
    this.isSaleActive = false;
    this.hasSale = false;
    this.minutes = '00';
    this.seconds = '00';
  }
}

  loadOtherCourses(): void {
    this.isOtherCoursesLoading = true;
    this.otherCoursesError = null;
    
    this._coursesService.onCoursesGetAllPublic().subscribe({
      next: (response: any) => {
        const allCourses = response.data || response;
        this.otherCourses = allCourses.filter((course: any) => 
          course._id !== this.courseId
        );
        this.isOtherCoursesLoading = false;
        
        // Calculate max index after data is loaded
        this.calculateCoursesMaxIndex();
        
        // Initialize slider after data is loaded
        setTimeout(() => {
          this.initializeCoursesSlider();
        }, 200);
      },
      error: (error) => {
        console.error('Error loading other courses:', error);
        this.otherCoursesError = 'Failed to load courses. Please try again later.';
        this.isOtherCoursesLoading = false;
        
        // Fallback to static data if API fails
        this.loadFallbackCoursesData();
      }
    });
  }

  // Fallback data for courses in case API fails
  loadFallbackCoursesData(): void {
    this.otherCourses = [
      { 
        id: '1',
        title: 'Digital Marketing', 
        image: 'assets/images/degital-marketing-1.webp',
        description: 'Improve Your Skills With Our Course Bundles.',
        level: 'Beginner To Advanced',
        route: '/digital-marketing',
        slug: 'digital-marketing'
      },
      { 
        id: '2',
        title: 'Web Development', 
        image: 'assets/images/web-development-1.webp',
        description: 'Improve Your Skills With Our Course Bundles.',
        level: 'Beginner To Advanced',
        route: '/web-development',
        slug: 'web-development'
      },
      { 
        id: '3',
        title: 'Cyber Security', 
        image: 'assets/images/cybersecurity.webp',
        description: 'Improve Your Skills With Our Course Bundles.',
        level: 'Beginner To Advanced',
        route: '/cyber-security',
        slug: 'cyber-security'
      },
      { 
        id: '4',
        title: 'Data Science', 
        image: 'assets/images/data-science.png',
        description: 'Improve Your Skills With Our Course Bundles.',
        level: 'Beginner To Advanced',
        route: '/data-science',
        slug: 'data-science'
      },
      { 
        id: '5',
        title: 'UI/UX Design', 
        image: 'assets/images/ui-ux.png',
        description: 'Improve Your Skills With Our Course Bundles.',
        level: 'Beginner To Advanced',
        route: '/ui-ux-design',
        slug: 'ui-ux-design'
      },
      { 
        id: '6',
        title: 'Cloud Computing', 
        image: 'assets/images/cloud-computing.png',
        description: 'Improve Your Skills With Our Course Bundles.',
        level: 'Beginner To Advanced',
        route: '/cloud-computing',
        slug: 'cloud-computing'
      }
    ].filter(course => course.id !== this.courseId);
    
    this.calculateCoursesMaxIndex();
  }
  
  loadTestimonials(): void {
    this.isTestimonialsLoading = true;
    this.testimonialError = null;
    
    this._apiService.get('testimonials/public', {}).subscribe({
      next: (response: any) => {
        this.testimonials = response;
        this.isTestimonialsLoading = false;
        
        // Calculate max index after data is loaded
        this.calculateTestimonialMaxIndex();
        
        setTimeout(() => {
          this.initializeTestimonialSlider();
        }, 200);
      },
      error: (error) => {
        console.error('Error loading testimonials:', error);
        this.testimonialError = 'Failed to load testimonials. Please try again later.';
        this.isTestimonialsLoading = false;
      }
    });
  }
  
  // ============ HELPER METHODS ============
  getTestimonialImage(testimonial: any): string {
    if (!testimonial) {
      return 'assets/images/default.png';
    }

    const img = testimonial.image;
    if (!img) {
      return 'assets/images/default.png';
    }

    if (img.startsWith('http://') || img.startsWith('https://')) {
      return img;
    }
    if (img.startsWith('assets/')) {
      return img;
    }
    return `${environment.url.replace(/\/$/, '')}/${img.replace(/^\/?/, '')}`;
  }

  getCourseImage(course: any): string {
    if (!course) {
      return 'assets/images/degital-marketing-1.webp';
    }

    // support multiple possible fields (thumbnail, imageUrl etc.)
    const imagePath: string | undefined = course.image || course.thumbnail || course.imageUrl || course.photo;

    if (!imagePath) {
      return 'assets/images/degital-marketing-1.webp';
    }

    // absolute URL
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
      return imagePath;
    }

    // assets path
    if (imagePath.startsWith('assets/')) {
      return imagePath;
    }

    // server path - ensure no double slashes
    return `${environment.url.replace(/\/$/, '')}/${imagePath.replace(/^\/?/, '')}`;
  }

  getCourseImage1(course: any): string {
  if (!course) {
    return 'assets/images/degital-marketing-1.webp';
  }

  // Check for image1 field specifically
  const imagePath: string | undefined = course.image1;

  if (!imagePath) {
    // Fallback to regular image if image1 doesn't exist
    return this.getCourseImage(course);
  }

  // absolute URL
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }

  // assets path
  if (imagePath.startsWith('assets/')) {
    return imagePath;
  }

  // server path - ensure no double slashes
  return `${environment.url.replace(/\/$/, '')}/${imagePath.replace(/^\/?/, '')}`;
}

  // Helper method to get course route
  getCourseRoute(course: any): string {
    return `/course/${course._id || course.id}`;
  }

  // TrackBy functions for better performance in *ngFor
  trackByTestimonial(index: number, testimonial: any): any {
    return testimonial._id || index;
  }

  trackByCourse(index: number, course: any): any {
    return course.id || course._id || index;
  }
}