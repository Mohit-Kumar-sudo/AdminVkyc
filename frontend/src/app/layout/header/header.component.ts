// header.component.ts (unchanged, works perfectly with the new template)
import { Component, OnInit, ElementRef, HostListener } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {
  isMegaOpen = false;
  dropdownOpen = false;
  isProductsOpen = false;
  isAIOpen = false;

  constructor(
    private elementRef: ElementRef,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      this.isMegaOpen = false;
      this.isProductsOpen = false;
      this.isAIOpen = false;
    });
  }

  toggleMegaMenu(open: boolean): void {
    this.isMegaOpen = open;
    if (open) {
      this.isProductsOpen = false;
      this.isAIOpen = false;
    }
  }

  toggleProductsMenu(open: boolean): void {
    this.isProductsOpen = open;
    if (open) {
      this.isMegaOpen = false;
      this.isAIOpen = false;
    }
  }

  toggleAIMenu(open: boolean): void {
    this.isAIOpen = open;
    if (open) {
      this.isMegaOpen = false;
      this.isProductsOpen = false;
    }
  }

  toggleDropdown(event: Event): void {
    event.stopPropagation();
    this.dropdownOpen = !this.dropdownOpen;
  }

  showDropdown(): void {
    this.dropdownOpen = true;
  }

  hideDropdown(): void {
    this.dropdownOpen = false;
  }

  isActive(route: string): boolean {
    return this.router.url === route;
  }

  @HostListener('document:click', ['$event'])
  clickOutside(event: Event): void {
    const target = event.target as HTMLElement;
    const insideMega = this.elementRef.nativeElement.querySelector('.mega-dropdown')?.contains(target);
    if (!insideMega) {
      this.isMegaOpen = false;
    }
    const insideOther = this.elementRef.nativeElement.querySelector('#mob-nav-option')?.contains(target);
    if (!insideOther) {
      this.dropdownOpen = false;
    }
  }
}