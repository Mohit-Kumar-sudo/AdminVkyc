import { Component, OnInit, HostListener, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { CoursesService } from '../../services/courses/courses.service';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-courses',
  templateUrl: './courses.component.html',
  styleUrl: './courses.component.scss'
})
export class CoursesComponent implements OnInit, AfterViewInit {
  // Slider properties
  currentIndex = 0;
  currentTranslate = 0;
  prevTranslate = 0;
  isDragging = false;
  startPosition = 0;
  cardsToShow = 3;
  cardWidth = 0;
  maxIndex = 0;

  // Dynamic course data
  courseCards: any[] = [];
  isLoading = true;
  error: string | null = null;

  constructor(
    private elRef: ElementRef,
    private coursesService: CoursesService
  ) { }

  private isBrowser(): boolean {
    return typeof window !== 'undefined' && typeof document !== 'undefined';
  }

  ngOnInit(): void {
    this.loadCourses();
  }

  ngAfterViewInit(): void {
    // Initialize after DOM is fully rendered
    setTimeout(() => {
      this.initializeSlider();
    }, 100);
  }
  
  loadCourses(): void {
    this.isLoading = true;
    this.error = null;
    
    // Using your existing service method for public courses
    this.coursesService.onCoursesGetAllPublic().subscribe({
      next: (response: any) => {
        //console.log('API Response:', response); // Debug log
        this.courseCards = response.data || response; // Adjust based on your API response structure
        //console.log('Course Cards:', this.courseCards); // Debug log
        this.isLoading = false;
        
        // Calculate max index after data is loaded
        this.calculateMaxIndex();
        
        // Initialize slider after data is loaded
        setTimeout(() => {
          this.initializeSlider();
        }, 200);
      },
      error: (error) => {
        console.error('Error loading courses:', error);
        this.error = 'Failed to load courses. Please try again later.';
        this.isLoading = false;
        
        // Fallback to static data if API fails
        this.loadFallbackData();
      }
    });
  }

  // Fallback data in case API fails
  loadFallbackData(): void {
    this.courseCards = [
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
    ];
    this.calculateMaxIndex();
  }

  calculateMaxIndex(): void {
    const totalCards = this.courseCards.length;
    this.maxIndex = Math.max(0, totalCards - this.cardsToShow);
  }

  @HostListener('window:resize')
  onResize() {
    this.updateCardsToShow();
  }

  initializeSlider(): void {
    this.updateCardsToShow();
  }

updateCardsToShow(): void {
  if (typeof window !== 'undefined') {
    const windowWidth = window.innerWidth;

    if (windowWidth < 768) {
      this.cardsToShow = 1;
    } else if (windowWidth < 992) {
      this.cardsToShow = 2;
    } else {
      this.cardsToShow = 3;
    }

    // Get container width and calculate card width
    const container = this.elRef.nativeElement.querySelector('.cards-slider');
    if (container) {
      const containerWidth = container.offsetWidth;
      this.cardWidth = containerWidth / this.cardsToShow;

      // Update card wrapper widths
      const cardWrappers = this.elRef.nativeElement.querySelectorAll('.course-card-wrapper');
      cardWrappers.forEach((wrapper: HTMLElement) => {
        wrapper.style.width = `${100 / this.cardsToShow}%`;
      });
    }

    // Update max index
    this.calculateMaxIndex();

    // Reset position if needed
    if (this.currentIndex > this.maxIndex) {
      this.currentIndex = this.maxIndex;
    }

    this.setPositionByIndex();
  }
}


  setPositionByIndex(): void {
  if (!this.isBrowser()) return;
  const container = this.elRef.nativeElement.querySelector('.cards-slider');
  if (container) {
    const containerWidth = container.offsetWidth;
    this.cardWidth = containerWidth / this.cardsToShow;
  }
  this.currentTranslate = this.currentIndex * -this.cardWidth;
  this.prevTranslate = this.currentTranslate;
  const sliderTrack = this.elRef.nativeElement.querySelector('.slider-track');
  if (sliderTrack) {
    sliderTrack.style.transform = `translateX(${this.currentTranslate}px)`;
  }
}


  nextSlide(): void {
    if (this.currentIndex < this.maxIndex) {
      this.currentIndex++;
      this.setPositionByIndex();
    }
  }

  prevSlide(): void {
    if (this.currentIndex > 0) {
      this.currentIndex--;
      this.setPositionByIndex();
    }
  }

  goToSlide(index: number): void {
    if (index >= 0 && index <= this.maxIndex) {
      this.currentIndex = index;
      this.setPositionByIndex();
    }
  }

  touchStart(event: MouseEvent | TouchEvent): void {
  if (!this.isBrowser()) return;
  event.preventDefault();
  if (this.isDragging) return;
  this.isDragging = true;
  this.startPosition = this.getPositionX(event);
  this.prevTranslate = this.currentTranslate;
}

  touchMove(event: MouseEvent | TouchEvent): void {
    if (!this.isBrowser()) return;
    if (!this.isDragging) return;
    
    const currentPosition = this.getPositionX(event);
    const diff = currentPosition - this.startPosition;
    
    this.currentTranslate = this.prevTranslate + diff;
    
    // Add boundaries
    const minTranslate = -this.cardWidth * this.maxIndex;
    const maxTranslate = 0;
    
    if (this.currentTranslate < minTranslate) {
      this.currentTranslate = minTranslate;
    } else if (this.currentTranslate > maxTranslate) {
      this.currentTranslate = maxTranslate;
    }
    
    // Apply the transform directly to the slider track
    const sliderTrack = this.elRef.nativeElement.querySelector('.slider-track');
    if (sliderTrack) {
      sliderTrack.style.transform = `translateX(${this.currentTranslate}px)`;
    }
  }

  touchEnd(): void {
    if (!this.isBrowser()) return;
    if (!this.isDragging) return;
    
    this.isDragging = false;
    
    // Calculate nearest card index
    const movedBy = this.currentTranslate - this.prevTranslate;
    
    if (movedBy < -50 && this.currentIndex < this.maxIndex) {
      this.currentIndex++;
    } else if (movedBy > 50 && this.currentIndex > 0) {
      this.currentIndex--;
    }
    
    this.setPositionByIndex();
  }

  private getPositionX(event: MouseEvent | TouchEvent): number {
    return event instanceof MouseEvent 
      ? event.clientX 
      : event.touches[0].clientX;
  }

// Helper method to get course route
  getCourseRoute(course: any): string {
    // Use course ID for routing to the details page
    return `/course/${course._id || course.id}`;
  }

  // Helper method to get course image
  getCourseImage(course: any): string {
    // Handle different possible image property names and paths
    let imagePath = course.image || course.thumbnail || course.imageUrl || course.photo;
    
    // If no image path, return default
    if (!imagePath) {
      return 'assets/images/degital-marketing-1.webp';
    }
    
    // If it's already a full URL, return as is
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
      return imagePath;
    }
    
    // If it starts with assets/, return as is
    if (imagePath.startsWith('assets/')) {
      return imagePath;
    }
    
    // For backend served images (like uploads/2025/4/1746038022638.png)
    // Prepend your backend URL from environment
    return `${environment.url}/${imagePath}`;
  }

  // TrackBy function for better performance in *ngFor
  trackByCourse(index: number, course: any): any {
    return course.id || course._id || index;
  }

  scrollToSection(sectionId: string) {
  if (!this.isBrowser()) return;
  const element = document.getElementById(sectionId);
  if (element) {
    element.scrollIntoView({ behavior: 'smooth' });
  }
}

}