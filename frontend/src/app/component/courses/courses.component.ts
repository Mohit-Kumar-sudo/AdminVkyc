import { Component, OnInit, HostListener, ElementRef, ViewChild, AfterViewInit } from '@angular/core';

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

  // Course cards data - can be used for dynamic rendering
  courseCards = [
    { 
      title: 'Digital Marketing', 
      image: 'assets/images/degital-marketing-1.png',
      skills: 'Improve Your Skills With Our Course Bundles.',
      level: 'Beginner To Advanced',
      route: '/digital-marketing'
    },
    { 
      title: 'Web Development', 
      image: 'assets/images/web-development-1.png',
      skills: 'Improve Your Skills With Our Course Bundles.',
      level: 'Beginner To Advanced',
      route: '/web-development'
    },
    { 
      title: 'Cyber Security', 
      image: 'assets/images/cybersecurity.png',
      skills: 'Improve Your Skills With Our Course Bundles.',
      level: 'Beginner To Advanced',
      route: '/cyber-security'
    },
    { 
      title: 'Data Science', 
      image: 'assets/images/data-science.png',
      skills: 'Improve Your Skills With Our Course Bundles.',
      level: 'Beginner To Advanced',
      route: '/data-science'
    },
    { 
      title: 'UI/UX Design', 
      image: 'assets/images/ui-ux.png',
      skills: 'Improve Your Skills With Our Course Bundles.',
      level: 'Beginner To Advanced',
      route: '/ui-ux-design'
    },
    { 
      title: 'Cloud Computing', 
      image: 'assets/images/cloud-computing.png',
      skills: 'Improve Your Skills With Our Course Bundles.',
      level: 'Beginner To Advanced',
      route: '/cloud-computing'
    }
  ];

  constructor(private elRef: ElementRef) { }

  ngOnInit(): void {
    // Calculate max index based on number of cards
    const totalCards = this.courseCards.length;
    this.maxIndex = Math.max(0, totalCards - this.cardsToShow);
  }

  ngAfterViewInit(): void {
    // Initialize after DOM is fully rendered
    setTimeout(() => {
      this.initializeSlider();
    }, 100);
  }

  @HostListener('window:resize')
  onResize() {
    this.updateCardsToShow();
  }

  initializeSlider(): void {
    this.updateCardsToShow();
  }

  updateCardsToShow(): void {
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
    const totalCards = this.courseCards.length;
    this.maxIndex = Math.max(0, totalCards - this.cardsToShow);
    
    // Reset position if needed
    if (this.currentIndex > this.maxIndex) {
      this.currentIndex = this.maxIndex;
    }
    
    this.setPositionByIndex();
  }

  setPositionByIndex(): void {
    // Get current container width for accurate calculation
    const container = this.elRef.nativeElement.querySelector('.cards-slider');
    if (container) {
      const containerWidth = container.offsetWidth;
      this.cardWidth = containerWidth / this.cardsToShow;
    }
    
    // Calculate the translation value based on card width and current index
    this.currentTranslate = this.currentIndex * -this.cardWidth;
    this.prevTranslate = this.currentTranslate;
    
    // Directly update slider track for immediate response
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
    event.preventDefault();
    if (this.isDragging) return;
    
    this.isDragging = true;
    this.startPosition = this.getPositionX(event);
    this.prevTranslate = this.currentTranslate;
  }

  touchMove(event: MouseEvent | TouchEvent): void {
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
}