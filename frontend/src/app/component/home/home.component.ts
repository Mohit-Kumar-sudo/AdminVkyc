import { Component, OnInit, HostListener, OnDestroy, AfterViewInit } from '@angular/core';
import { environment } from '../../../environments/environment';
import { ActivatedRoute } from '@angular/router';
import { BlogService } from '../../services/blog/blog.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ContactService } from '../../services/contact/contact.service';
import * as AOS from 'aos';
import * as bootstrap from 'bootstrap';
import Swiper from 'swiper';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';
declare var $: any;

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
      image: '/assets/images/home6-solution-bg2.png'
    },
    {
      title: 'Software Development',
      description: 'Software development is the process of creating computer software programs that perform specific functions or tasks.',
      image: '/assets/images/home6-solution-bg3.png'
    },
    {
      title: 'Cloud Solutions',
      description: 'Cloud solutions refer to the use of cloud computing technology to provide services and solutions over the internet.',
      image: '/assets/images/home6-solution-bg4.png'
    },
    {
      title: 'Digital Marketing',
      description: 'Digital marketing services provide businesses of all sizes with an opportunity to market their brand 24/7 at a low cost.',
      image: '/assets/images/home6-solution-bg2.png'
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
  bannerSlider: any; // <-- added for banner5-slider

  constructor(
    private _blogService: BlogService,
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private _contactService: ContactService
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

  ngOnInit() {
    Swiper.use([Navigation, Pagination, Autoplay]);

    this.myForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      countryCode: ['', Validators.required],
      number: ['', Validators.required],
      message: ['', Validators.required],
    });

    AOS.init({
      offset: 120,
      duration: 1000,
      easing: 'ease',
      delay: 100,
      once: true,
    });

    this.setItemsToShow();
    this.startAutoSlide();

    this._blogService.onBlogGetAllPublic().subscribe((res) => {
      this.getData = res;
    });
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.initServicesSlider();
      this.initBlogSlider();
      this.initCarousel();
      this.initPartnersSlider();
      this.initBannerSlider(); // <-- added initialization for banner
    }, 100);
  }

  ngOnDestroy() {
    this.stopAutoSlide();

    if (this.servicesSlider) {
      this.servicesSlider.destroy();
    }
    if (this.blogSlider) {
      this.blogSlider.destroy();
    }
    if (this.partnersSlider) {
      this.partnersSlider.destroy();
    }
    if (this.bannerSlider) { // <-- cleanup for banner slider
      this.bannerSlider.destroy();
    }
  }

  private initPartnersSlider() {
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

  initServicesSlider() {
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
  

  initBlogSlider() {
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
  

  // ====== NEW BANNER SLIDER FUNCTION ====== //
  private initBannerSlider() {
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

  @HostListener('window:resize')
  onResize() {
    this.setItemsToShow();
  }

  setItemsToShow() {
    this.itemsToShow = window.innerWidth < 768 ? 1 : 3;
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
    for (let i = 0; i < this.itemsToShow; i++) {
      if (this.getData && this.getData.length) {
        const blog = this.getData[(this.currentIndex + i) % this.getData.length];
        blogs.push(blog);
      }
    }
    return blogs;
  }

  startAutoSlide() {
    this.autoSlideInterval = setInterval(() => {
      this.next();
    }, this.autoSlideDelay);
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

  initCarousel() {
    const carouselElement = document.getElementById('carouselExampleInterval');
    if (carouselElement) {
      new bootstrap.Carousel(carouselElement, {
        interval: 5000,
        wrap: true,
        pause: 'hover'
      });
    }
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
          alert('Thank you for contacting us. We will get back to you soon.');
          this.myForm.reset();
          this.isLoading = false;
        },
        (error) => {
          console.error(error);
          alert('Error sending contact data. Please try again.');
          this.isLoading = false;
        }
      );
    } else {
      alert('Please fill all the fields');
      this.isLoading = false;
    }
  }
}
