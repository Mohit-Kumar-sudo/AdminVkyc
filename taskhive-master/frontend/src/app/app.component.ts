import { Component, OnInit } from '@angular/core';
import { Router, NavigationEnd, ActivatedRoute } from '@angular/router';
import { SsrService } from './services/ssr/ssr.service';
import { Title, Meta } from '@angular/platform-browser';
import { filter, map, mergeMap } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  template: `<router-outlet></router-outlet>`,
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {
  title = 'taskhive';

  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private ssrService: SsrService,
    private titleService: Title,
    private metaService: Meta
  ) {}

  ngOnInit() {
    if (this.ssrService.isBrowser()) {
      this.router.events.pipe(
        filter(event => event instanceof NavigationEnd),
        map(() => this.activatedRoute),
        map(route => {
          while (route.firstChild) {
            route = route.firstChild;
          }
          return route;
        }),
        filter(route => route.outlet === 'primary'),
        mergeMap(route => route.data)
      ).subscribe(event => {
        const title = event['title'] || 'TaskHive - Your Partner in Growth';
        const description = event['description'] || 'TaskHive offers top-tier web development, digital marketing, and IT solutions to help your business thrive.';
        
        this.titleService.setTitle(title);
        this.metaService.updateTag({ name: 'description', content: description });

        // Scroll to top on navigation
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
    }
  }
}