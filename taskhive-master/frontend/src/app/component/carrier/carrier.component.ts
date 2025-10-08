import { Component, OnInit, OnDestroy, AfterViewInit, ElementRef, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription, interval, Subject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { CarriersService, Carrier } from '../../services/carriers/carriers.service';

@Component({
  selector: 'app-carrier',
  templateUrl: './carrier.component.html',
  styleUrls: ['./carrier.component.scss']
})
export class CarrierComponent implements OnInit, OnDestroy, AfterViewInit {
  jobCards: Carrier[] = [];
  isLoading = true;
  error: string | null = null;

  // Slider properties
  currentIndex = 0;
  currentTranslate = 0;
  prevTranslate = 0;
  isDragging = false;
  startPosition = 0;
  cardsToShow = 3; // A sensible default
  cardWidth = 0;
  maxIndex = 0;
  autoSlideInterval!: Subscription;
  autoSlideDelay = 5000; // 5 seconds
  hasDragged = false;
  dragThreshold = 10; // Pixels to move before it's a drag

  private resizeSubject = new Subject<void>();
  private resizeSubscription!: Subscription;

  constructor(
    private elRef: ElementRef,
    private carriersService: CarriersService,
    private router: Router,
    private cdRef: ChangeDetectorRef
  ) {}

  private isBrowser(): boolean {
    return typeof window !== 'undefined';
  }


  ngOnInit(): void {
    this.fetchCarriers();
    // Subscribe to the resize subject with a debounce time to avoid performance issues
    this.resizeSubscription = this.resizeSubject.pipe(
      debounceTime(200)
    ).subscribe(() => {
      this.initializeSlider();
    });
  }

  ngAfterViewInit(): void {
    if (this.isBrowser()) {
     setTimeout(() => this.initializeSlider(), 0);
    }
}


  ngOnDestroy(): void {
    if (this.autoSlideInterval) {
      this.autoSlideInterval.unsubscribe();
    }
    if (this.resizeSubscription) {
      this.resizeSubscription.unsubscribe();
    }
  }

  fetchCarriers(): void {
    this.isLoading = true;
    this.carriersService.onCarriersGetAllPublic().subscribe({
      next: (response: any) => {
        if (response && Array.isArray(response.data)) {
          this.jobCards = response.data as Carrier[];
          // Manually trigger change detection to render the new cards
          this.cdRef.detectChanges(); 
          if (this.jobCards.length > 0) {
            this.initializeSlider();
            this.startAutoSlide();
          }
        } else {
          this.error = 'Invalid data format received from server';
        }
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error fetching careers:', err);
        this.error = 'Failed to load job opportunities. Please try again later.';
        this.isLoading = false;
      }
    });
  }

  viewDetails(id: string): void {

    if (id) {
      this.router.navigate(['/career-summary', id]);
    }
  }

  initializeSlider(): void {
  if (!this.isBrowser()) return;
  if (this.jobCards.length > 0 && this.elRef.nativeElement.offsetParent !== null) {
    this.updateSliderConfig();
    this.updateSliderPosition(false);
  }
}

  updateSliderConfig(): void {
    if (!this.isBrowser()) return;
    const cardWrapper = this.elRef.nativeElement.querySelector('.slider-card-wrapper');
    const container = this.elRef.nativeElement.querySelector('.cards-slider-container');
    if (!cardWrapper || !container) return;
    
    // **Key Fix**: Measure the true width of a card element from the DOM
    this.cardWidth = cardWrapper.offsetWidth; 
    
    // Determine how many cards are visible based on the container and card widths
    this.cardsToShow = Math.round(container.offsetWidth / this.cardWidth);
    
    this.maxIndex = Math.max(0, this.jobCards.length - this.cardsToShow);
    this.currentIndex = Math.min(this.currentIndex, this.maxIndex);
  }

  updateSliderPosition(withAnimation = true): void {
    const track = this.elRef.nativeElement.querySelector('.cards-track');
    if (!track) return;
    
    track.style.transition = withAnimation ? 'transform 0.4s ease-in-out' : 'none';
    this.currentTranslate = -this.currentIndex * this.cardWidth;
    track.style.transform = `translateX(${this.currentTranslate}px)`;
  }

  nextSlide(): void {
    this.currentIndex = this.currentIndex < this.maxIndex ? this.currentIndex + 1 : 0; // Loop to start
    this.updateSliderPosition();
  }

  prevSlide(): void {
    this.currentIndex = this.currentIndex > 0 ? this.currentIndex - 1 : this.maxIndex; // Loop to end
    this.updateSliderPosition();
  }

  goToSlide(index: number): void {
    this.currentIndex = Math.max(0, Math.min(index, this.maxIndex));
    this.updateSliderPosition();
  }

  startAutoSlide(): void {
    this.pauseAutoSlide();
    if (this.jobCards.length > this.cardsToShow) {
        this.autoSlideInterval = interval(this.autoSlideDelay).subscribe(() => {
          if (!this.isDragging) this.nextSlide();
        });
    }
  }

  pauseAutoSlide(): void {
    if (this.autoSlideInterval) this.autoSlideInterval.unsubscribe();
  }

  resumeAutoSlide(): void {
    this.startAutoSlide();
  }

  // --- Touch and Mouse Event Handlers ---

  touchStart(event: TouchEvent | MouseEvent): void {
    if (this.jobCards.length <= this.cardsToShow) return;
    this.isDragging = true;
    this.pauseAutoSlide();
    this.hasDragged = false;
    this.startPosition = 'touches' in event ? event.touches[0].clientX : event.clientX;
    this.prevTranslate = this.currentTranslate;
    
    const track = this.elRef.nativeElement.querySelector('.cards-track');
    if (track) track.style.transition = 'none';
  }

  touchMove(event: TouchEvent | MouseEvent): void {
    if (!this.isDragging) return;
    const currentPosition = 'touches' in event ? event.touches[0].clientX : event.clientX;
    const diff = currentPosition - this.startPosition;
    
    if (!this.hasDragged && Math.abs(diff) > this.dragThreshold) {
      this.hasDragged = true;
    }
    
    this.currentTranslate = this.prevTranslate + diff;
    const track = this.elRef.nativeElement.querySelector('.cards-track');
    if (track) track.style.transform = `translateX(${this.currentTranslate}px)`;
  }

  touchEnd(): void {
    if (!this.isDragging) return;
    this.isDragging = false;
    this.resumeAutoSlide();
    
    const movedBy = this.currentTranslate - this.prevTranslate;
    // Determine if the drag was significant enough to change slides
    if (Math.abs(movedBy) > this.cardWidth * 0.25) { 
      if (movedBy < 0 && this.currentIndex < this.maxIndex) this.currentIndex++;
      else if (movedBy > 0 && this.currentIndex > 0) this.currentIndex--;
    }
    
    this.updateSliderPosition(); // Snap to the correct final position
    // Reset drag state after a short delay to prevent accidental clicks
  setTimeout(() => {
    this.hasDragged = false;
  }, 100);
  }

  // --- Utility Methods ---

  truncateText(text: string, maxLength: number): string {
    if (!text || text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  }

  trackByJob(index: number, job: Carrier): string {
    return job._id || index.toString();
  }

  onWindowResize(): void {
    this.resizeSubject.next();
  }
}