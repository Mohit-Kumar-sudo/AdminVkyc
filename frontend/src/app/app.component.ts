import { Component, OnInit } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import * as bootstrap from 'bootstrap';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
  template: `<router-outlet></router-outlet>`
})
export class AppComponent implements OnInit {
  title = 'taskhive';
  ngOnInit() {
    // Initialize all Bootstrap tooltips
    document.querySelectorAll('[data-bs-toggle="dropdown"]').forEach(el => {
      new bootstrap.Dropdown(el);
    });
  }

   constructor(private router: Router) {
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    });
  }
}
