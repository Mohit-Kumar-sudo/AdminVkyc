import { Component, OnInit, HostListener, ElementRef, ViewChild, OnDestroy } from '@angular/core';
import { environment } from '../../../environments/environment';
import { Subscription, interval } from 'rxjs';
import { ApiService } from '../../services/api/api.service';
import { SsrService } from '../../services/ssr/ssr.service';

@Component({
  selector: 'app-about',
  templateUrl: './about.component.html',
  styleUrl: './about.component.scss'
})
export class AboutComponent implements OnInit, OnDestroy {
  @ViewChild('teamSliderTrack') teamSliderTrack!: ElementRef;

  teamMembers: any[] = [];
  isTeamLoading = true;
  teamError: string | null = null;

  // Slider properties
  currentIndex = 0;
  currentTranslate = 0;
  prevTranslate = 0;
  isDragging = false;
  startPosition = 0;
  cardsToShow = 4;
  cardWidth = 0;
  maxIndex = 0;
  autoSlideInterval!: Subscription;
  autoSlideDelay = 3000; // 3 seconds

  constructor(
    private apiService: ApiService,
    private elRef: ElementRef,
    private ssrService: SsrService
  ) {}

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
    this.loadTeamMembers();
  }

  ngOnDestroy() {
    if (this.autoSlideInterval) {
      this.autoSlideInterval.unsubscribe();
    }
  }

  getImageUrl(imagePath: string): string {
    if (!imagePath) {
      return '/assets/images/default.png';
    }
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
      return imagePath;
    }
    const apiBaseUrl = environment.url;
    const normalizedPath = imagePath.replace(/\\/g, '/');
    return `${apiBaseUrl}/${normalizedPath}`;
  }

  onImageError(event: any): void {
    event.target.src = '/assets/images/default.png';
  }

  loadTeamMembers(): void {
    this.isTeamLoading = true;
    this.teamError = null;
    this.apiService.get('teams/public', {}).subscribe({
      next: (response: any) => {
        this.teamMembers = response.data || response;
        this.isTeamLoading = false;
        this.calculateMaxIndex();
        if (this.ssrService.isBrowser()) {
          setTimeout(() => {
            this.initializeSlider();
            this.startAutoSlide();
          }, 200);
        }
      },
      error: (error) => {
        console.error('Error loading team members:', error);
        this.teamError = 'Failed to load team members. Please try again later.';
        this.isTeamLoading = false;
        this.loadFallbackTeamData();
      }
    });
  }

  loadFallbackTeamData(): void {
    this.teamMembers = [
      // ...existing fallback data...
    ];
    this.calculateMaxIndex();
    if (this.ssrService.isBrowser()) {
      this.initializeSlider();
      this.startAutoSlide();
    }
  }

  initializeSlider(): void {
    this.updateCardsToShow();
  }

  updateCardsToShow(): void {
    if (!this.ssrService.isBrowser()) return;
    const windowWidth = window.innerWidth;
    if (windowWidth < 768) {
      this.cardsToShow = 1;
    } else if (windowWidth < 992) {
      this.cardsToShow = 2;
    } else if (windowWidth < 1200) {
      this.cardsToShow = 3;
    } else {
      this.cardsToShow = 4;
    }
    const container = this.elRef.nativeElement.querySelector('.team-slider');
    if (container) {
      const containerWidth = container.offsetWidth;
      this.cardWidth = containerWidth / this.cardsToShow;
      const cardWrappers = this.elRef.nativeElement.querySelectorAll('.team-card-wrapper');
      cardWrappers.forEach((wrapper: HTMLElement) => {
        wrapper.style.width = `${100 / this.cardsToShow}%`;
      });
    }
    this.calculateMaxIndex();
    if (this.currentIndex > this.maxIndex) {
      this.currentIndex = this.maxIndex;
    }
    this.setPositionByIndex();
  }
  
  calculateMaxIndex(): void {
    const totalCards = this.teamMembers.length;
    this.maxIndex = Math.max(0, totalCards - this.cardsToShow);
  }

  setPositionByIndex(): void {
    if (!this.ssrService.isBrowser()) return;
    const container = this.elRef.nativeElement.querySelector('.team-slider');
    if (container) {
      const containerWidth = container.offsetWidth;
      this.cardWidth = containerWidth / this.cardsToShow;
    }
    this.currentTranslate = this.currentIndex * -this.cardWidth;
    this.prevTranslate = this.currentTranslate;
    const sliderTrack = this.elRef.nativeElement.querySelector('.team-slider-track');
    if (sliderTrack) {
      sliderTrack.style.transform = `translateX(${this.currentTranslate}px)`;
    }
  }

  nextSlide(): void {
    if (this.currentIndex < this.maxIndex) {
      this.currentIndex++;
    } else {
      this.currentIndex = 0;
    }
    this.setPositionByIndex();
  }

  prevSlide(): void {
    if (this.currentIndex > 0) {
      this.currentIndex--;
    } else {
      this.currentIndex = this.maxIndex;
    }
    this.setPositionByIndex();
  }
  
  goToSlide(index: number): void {
    if (index >= 0 && index <= this.maxIndex) {
      this.currentIndex = index;
      this.setPositionByIndex();
    }
  }

  startAutoSlide(): void {
    if (!this.ssrService.isBrowser()) return;
    this.autoSlideInterval = interval(5000).subscribe(() => {
      this.nextSlide();
    });
  }

  pauseAutoSlide(): void {
    if (this.autoSlideInterval) {
      this.autoSlideInterval.unsubscribe();
    }
  }

  resumeAutoSlide(): void {
    this.startAutoSlide();
  }

  touchStart(event: MouseEvent | TouchEvent): void {
    if (!this.ssrService.isBrowser()) return;
    event.preventDefault();
    if (this.isDragging) return;
    this.pauseAutoSlide();
    this.isDragging = true;
    this.startPosition = this.getPositionX(event);
    this.prevTranslate = this.currentTranslate;
  }

  touchMove(event: MouseEvent | TouchEvent): void {
    if (!this.ssrService.isBrowser()) return;
    if (!this.isDragging) return;
    const currentPosition = this.getPositionX(event);
    const diff = currentPosition - this.startPosition;
    this.currentTranslate = this.prevTranslate + diff;
    const minTranslate = -this.cardWidth * this.maxIndex;
    const maxTranslate = 0;
    if (this.currentTranslate < minTranslate) {
      this.currentTranslate = minTranslate;
    } else if (this.currentTranslate > maxTranslate) {
      this.currentTranslate = maxTranslate;
    }
    const sliderTrack = this.elRef.nativeElement.querySelector('.team-slider-track');
    if (sliderTrack) {
      sliderTrack.style.transform = `translateX(${this.currentTranslate}px)`;
    }
  }

  touchEnd(): void {
    if (!this.ssrService.isBrowser()) return;
    if (!this.isDragging) return;
    this.isDragging = false;
    this.resumeAutoSlide();
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

  trackByTeamMember(index: number, member: any): any {
    return member._id || member.name || index;
  }

  @HostListener('window:resize')
  onResize() {
    if (this.ssrService.isBrowser()) {
      this.updateCardsToShow();
    }
  }
}