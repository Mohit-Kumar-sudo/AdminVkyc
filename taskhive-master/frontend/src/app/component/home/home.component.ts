import { Component, OnInit, HostListener, OnDestroy, AfterViewInit } from '@angular/core';
import { environment } from '../../../environments/environment';
import { ActivatedRoute } from '@angular/router';
import { BlogService } from '../../services/blog/blog.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ContactService } from '../../services/contact/contact.service';
import { SsrService } from '../../services/ssr/ssr.service';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';
import Swal from 'sweetalert2';

// Declare Swiper to avoid TypeScript errors
declare var Swiper: any;

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit, AfterViewInit, OnDestroy {
  getData: any;
  p: number = 1;
  itemsPerPage: number = 6;
  id: any;
  data: any;
  env: any;
  myForm!: FormGroup;
  isLoading = false;
  currentIndex = 0;
  itemsToShow = 3;
  autoSlideInterval: any;
  autoSlideDelay = 1000;

  services = [
    {
      title: 'Web Development',
      description: 'Our web designing team and Web Developer have years of experience and keep up with the most recent versions and technologies...',
      image: '/assets/images/home6-solution-bg2.webp'
    },
    {
      title: 'Software Development',
      description: 'Software development is the process of creating computer software programs that perform specific functions or tasks.',
      image: '/assets/images/home6-solution-bg3.webp'
    },
    {
      title: 'Cloud Solutions',
      description: 'Cloud solutions refer to the use of cloud computing technology to provide services and solutions over the internet.',
      image: '/assets/images/home6-solution-bg4.webp'
    },
    {
      title: 'Digital Marketing',
      description: 'Digital marketing services provide businesses of all sizes with an opportunity to market their brand 24/7 at a low cost.',
      image: '/assets/images/home6-solution-bg2.webp'
    }
  ];

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

  servicesSlider: any;
  blogSlider: any;
  partnersSlider: any;
  bannerSlider: any;

  constructor(
    private _blogService: BlogService,
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private _contactService: ContactService,
    private ssrService: SsrService
  ) {
    this.env = environment.url;
    this.route.params.subscribe((param: any) => {
      this.id = param.id;
      if (this.id) {
        this._blogService.onBlogFindOne(this.id).subscribe(
          (res: any) => {
            this.data = res;
          },
          (err) => {
            console.log(err.message);
          }
        );
      }
    });
  }

  async ngOnInit() {
    this.myForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      countryCode: ['', Validators.required],
      number: ['', Validators.required],
      message: ['', Validators.required],
    });

    if (this.ssrService.isBrowser()) {
      await this.initializeBrowserFeatures();
    }

    this.setItemsToShow();
    this.startAutoSlide();

    this._blogService.onBlogGetAllPublic().subscribe((res) => {
      this.getData = res;
    });
  }

  async initializeBrowserFeatures() {
    try {
      const AOS = await this.ssrService.loadAOS();
      const aosInstance = AOS?.default || AOS;
      if (typeof aosInstance.init === 'function') {
        aosInstance.init({
          offset: 120,
          duration: 1000,
          easing: 'ease',
          delay: 100,
          once: true,
        });
      }

      const SwiperModule = await import('swiper');
      const { Navigation, Pagination, Autoplay } = await import('swiper/modules');
      SwiperModule.default.use([Navigation, Pagination, Autoplay]);

    } catch (error) {
      console.warn('Browser features failed to load:', error);
    }
  }

  async ngAfterViewInit() {
    if (this.ssrService.isBrowser()) {
      setTimeout(() => {
        this.initSliders();
        this.initCarousel();
      }, 100);
    }
  }

  async initSliders() {
    try {
      const Swiper = (await import('swiper')).default;
      
      this.initServicesSlider(Swiper);
      this.initBlogSlider(Swiper);
      this.initPartnersSlider(Swiper);
      this.initBannerSlider(Swiper);
    } catch (error) {
      console.warn('Swiper failed to load:', error);
    }
  }

  private initPartnersSlider(Swiper: any) {
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

  initServicesSlider(Swiper: any) {
    const sliderElement = document.querySelector('.home6-solution-slider');
  
    if (sliderElement && sliderElement.classList.contains('swiper-initialized')) {
      this.servicesSlider.destroy(true, true);
    }
  
    this.servicesSlider = new Swiper('.home6-solution-slider', {
      slidesPerView: 1,
      spaceBetween: 30,
      loop: true,
      autoplay: {
        delay: 3000,
        disableOnInteraction: false,
      },
      pagination: {
        el: '.swiper-pagination61',
        clickable: true,
      },
      breakpoints: {
        768: {
          slidesPerView: 2,
        },
        992: {
          slidesPerView: 3,
        },
      },
    });
  }

  initBlogSlider(Swiper: any) {
    this.blogSlider = new Swiper('.swiper-container', {
      loop: true,
      autoplay: {
        delay: 3000,
        disableOnInteraction: false,
      },
      pagination: {
        el: '.swiper-pagination',
        clickable: true,
      },
      navigation: {
        nextEl: '.swiper-button-next',
        prevEl: '.swiper-button-prev',
      },
    });
  }

  private initBannerSlider(Swiper: any) {
    this.bannerSlider = new Swiper('.banner5-slider', {
      loop: true,
      autoplay: {
        delay: 3000,
        disableOnInteraction: false,
      },
      pagination: {
        el: '.swiper-pagination-banner',
        clickable: true,
      },
    });
  }

  async initCarousel() {
    if (this.ssrService.isBrowser()) {
      try {
        const bootstrap = await this.ssrService.loadBootstrap();
        const carouselElement = document.getElementById('carouselExampleInterval');
        if (carouselElement) {
          new bootstrap.Carousel(carouselElement, {
            interval: 5000,
            wrap: true,
            pause: 'hover'
          });
        }
      } catch (error) {
        console.warn('Bootstrap carousel failed to load:', error);
      }
    }
  }

  ngOnDestroy() {
    this.stopAutoSlide();

    if (this.ssrService.isBrowser()) {
      if (this.servicesSlider) {
        this.servicesSlider.destroy();
      }
      if (this.blogSlider) {
        this.blogSlider.destroy();
      }
      if (this.partnersSlider) {
        this.partnersSlider.destroy();
      }
      if (this.bannerSlider) {
        this.bannerSlider.destroy();
      }
    }
  }

  @HostListener('window:resize')
  onResize() {
    if (this.ssrService.isBrowser()) {
      this.setItemsToShow();
    }
  }

  setItemsToShow() {
    if (this.ssrService.isBrowser()) {
      this.itemsToShow = window.innerWidth < 768 ? 1 : 3;
    }
  }

  next() {
    this.currentIndex = (this.currentIndex + 1) % this.getData.length;
    this.resetAutoSlide();
  }

  prev() {
    this.currentIndex = (this.currentIndex - 1 + this.getData.length) % this.getData.length;
    this.resetAutoSlide();
  }

  get visibleBlogs() {
    let blogs = [];
    if (this.getData && this.getData.length) {
      for (let i = 0; i < this.itemsToShow; i++) {
        const blog = this.getData[(this.currentIndex + i) % this.getData.length];
        blogs.push(blog);
      }
    }
    return blogs;
  }

  startAutoSlide() {
    if (this.ssrService.isBrowser()) {
      this.autoSlideInterval = setInterval(() => {
        this.next();
      }, this.autoSlideDelay);
    }
  }

  stopAutoSlide() {
    if (this.autoSlideInterval) {
      clearInterval(this.autoSlideInterval);
    }
  }

  resetAutoSlide() {
    this.stopAutoSlide();
    this.startAutoSlide();
  }

  pauseAutoSlide() {
    this.stopAutoSlide();
  }

  resumeAutoSlide() {
    this.startAutoSlide();
  }

  getPageArray(totalItems: number): number[] {
    return Array(Math.ceil(totalItems / this.itemsPerPage))
      .fill(0)
      .map((x, i) => i + 1);
  }

  onSubmit() {
    if (this.myForm.valid) {
      this.isLoading = true;
      this._contactService.onContactSave(this.myForm.value).subscribe(
        (response) => {
          console.log(response);
          Swal.fire({
            title: 'Success!',
            text: 'Thank you for contacting us. We will get back to you soon.',
            icon: 'success',
            confirmButtonText: 'OK'
          });
          this.myForm.reset();
          this.isLoading = false;
        },
        (error) => {
          console.error(error);
           Swal.fire({
            title: 'Error!',
            text: 'Error sending contact data. Please try again.',
            icon: 'error',
            confirmButtonText: 'OK'
          });
          this.isLoading = false;
        }
      );
    } else {
       Swal.fire({
        title: 'Validation Error!',
        text: 'Please fill all the fields.',
        icon: 'warning',
        confirmButtonText: 'OK'
      });
      this.isLoading = false;
    }
  }
}