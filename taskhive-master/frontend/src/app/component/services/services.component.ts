import { AfterViewInit, Component, OnDestroy, OnInit } from '@angular/core';
import { SsrService } from '../../services/ssr/ssr.service';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';

// Declare Swiper to avoid TypeScript errors
declare var Swiper: any;

@Component({
  selector: 'app-services',
  templateUrl: './services.component.html',
  styleUrl: './services.component.scss'
})
export class ServicesComponent implements OnInit, AfterViewInit, OnDestroy {

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

  partnersSlider: any;

  constructor(private ssrService: SsrService) {}

  async ngOnInit() {
    if (this.ssrService.isBrowser()) {
      const AOS = await this.ssrService.loadAOS();
      AOS.init({
        offset: 200,
        duration: 1000,
        easing: 'ease',
        delay: 100,
        once: true
      });
    }
  }

  ngAfterViewInit() {
    if (this.ssrService.isBrowser()) {
      setTimeout(() => {
        this.initPartnersSlider();
      }, 100);
    }
  }

  ngOnDestroy() {
    if (this.partnersSlider) {
      this.partnersSlider.destroy();
    }
  }

  private async initPartnersSlider() {
    if (!this.ssrService.isBrowser()) return;

    // Dynamically import Swiper
    const Swiper = (await import('swiper')).default;
    Swiper.use([Navigation, Pagination, Autoplay]);

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
        320: {
          spaceBetween: 15,
        },
        768: {
          spaceBetween: 25,
        }
      }
    });
  }
}