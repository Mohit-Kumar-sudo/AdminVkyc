// carrier.component.ts
import { Component, OnInit, HostListener, ElementRef } from '@angular/core';
import { Router } from '@angular/router';
import { CarriersService, Carrier } from '../../services/carriers/carriers.service';

@Component({
  selector: 'app-carrier',
  templateUrl: './carrier.component.html',
  styleUrls: ['./carrier.component.scss']
})
export class CarrierComponent implements OnInit {
  currentIndex = 0;
  currentTranslate = 0;
  prevTranslate = 0;
  isDragging = false;
  startPosition = 0;
  cardsToShow = 3;
  cardWidth = 300;
  gap = 16;
  visibleCards = 3;
  maxIndex = 0;

  jobCards: Carrier[] = [];
  isLoading = true;
  error: string | null = null;

  constructor(
    private elRef: ElementRef,
    private carriersService: CarriersService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.fetchCarriers();
  }

  fetchCarriers(): void {
    this.isLoading = true;

    this.carriersService.onCarriersGetAllPublic().subscribe({
      next: (response: any) => {
        if (response && Array.isArray(response.data)) {
          this.jobCards = response.data as Carrier[];
          console.log('Job Cards:', this.jobCards);

          this.maxIndex = Math.max(0, this.jobCards.length - this.cardsToShow);

          setTimeout(() => {
            this.initializeSlider();
          }, 0);
        } else {
          this.error = 'Invalid data format received from server';
        }

        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error fetching carriers:', err);
        this.error = 'Failed to load job opportunities. Please try again later.';
        this.isLoading = false;
      }
    });
  }

  viewDetails(id: string): void {
    if (id) {
      this.router.navigate(['/carrier-summary', id]);
    }
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

    const container = this.elRef.nativeElement.querySelector('.cards-slider');
    if (container) {
      this.cardWidth = (container.offsetWidth - (this.gap * (this.cardsToShow - 1))) / this.cardsToShow;

    }

    this.maxIndex = Math.max(0, this.jobCards.length - this.cardsToShow);

    if (this.currentIndex > this.maxIndex) {
      this.currentIndex = this.maxIndex;
    }

    this.setPositionByIndex();
  }

  setPositionByIndex(): void {
    this.currentTranslate = -(this.currentIndex * (this.cardWidth + this.gap));
    this.prevTranslate = this.currentTranslate;
  }

  nextSlide() {
    if (this.currentIndex < this.maxIndex) {
      this.currentIndex++;
      this.updateTranslate();
    }
  }

  prevSlide() {
    if (this.currentIndex > 0) {
      this.currentIndex--;
      this.updateTranslate();
    }
  }

  updateTranslate() {
  this.currentTranslate = -(this.currentIndex * (this.cardWidth + this.gap));
  }

  touchStart(event: MouseEvent | TouchEvent): void {
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

    const minTranslate = -(this.cardWidth + this.gap) * this.maxIndex;
    const maxTranslate = 0;

    if (this.currentTranslate < minTranslate) {
      this.currentTranslate = minTranslate;
    } else if (this.currentTranslate > maxTranslate) {
      this.currentTranslate = maxTranslate;
    }
  }

  touchEnd(): void {
    if (!this.isDragging) return;

    this.isDragging = false;

    const movedBy = this.currentTranslate - this.prevTranslate;

    if (movedBy < -100 && this.currentIndex < this.maxIndex) {
      this.currentIndex++;
    } else if (movedBy > 100 && this.currentIndex > 0) {
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
