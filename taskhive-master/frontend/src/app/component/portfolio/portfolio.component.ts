import { Component, OnInit } from '@angular/core';
import { environment } from '../../../environments/environment';
import { ProjectService } from '../../services/project/project.service';
import { ActivatedRoute } from '@angular/router';
import { SsrService } from '../../services/ssr/ssr.service';
import { Title, Meta } from '@angular/platform-browser';

@Component({
  selector: 'app-portfolio',
  templateUrl: './portfolio.component.html',
  styleUrl: './portfolio.component.scss'
})
export class PortfolioComponent implements OnInit {
  projects: any[] = [];
  project: any;
  id: string | null = null;
  env: string = environment.url;
  itemsToShow: number = 3;

  constructor(
    private projectService: ProjectService,
    private route: ActivatedRoute,
    private ssrService: SsrService,
    private titleService: Title,
    private metaService: Meta
  ) {}

  async ngOnInit(): Promise<void> {
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

    this.route.params.subscribe((params: any) => {
      this.id = params.id;
      if (this.id) {
        this.getProjectById(this.id);
      } else {
        this.getPublicProjects();
      }
    });
  }

  getPublicProjects(): void {
    // Set meta tags for the main portfolio page
    this.titleService.setTitle('Our Portfolio | TaskHive');
    this.metaService.updateTag({ name: 'description', content: 'Explore the projects we have successfully delivered for our clients.' });

    this.projectService.onProjectGetAllPublic().subscribe(
      (res: any) => {
        if (res?.data && Array.isArray(res.data)) {
          this.projects = res.data.map((project: any) => ({
            ...project,
            description: project.descriptions?.[0] || 'No description available',
          }));
        } else {
          console.error('Unexpected API response structure:', res);
        }
      },
      (error: any) => {
        console.error('Error fetching projects:', error);
      }
    );
  }

  getProjectById(id: string): void {
    this.projectService.onProjectFindOne(id).subscribe((res: any) => {
      this.project = res.data;
       // Set dynamic meta tags for the specific project
       if (this.project) {
        this.titleService.setTitle(this.project.title + ' | TaskHive Portfolio');
        const description = this.project.meta_description || this.project.descriptions?.[0] || 'Details about our project: ' + this.project.title;
        this.metaService.updateTag({ name: 'description', content: description.substring(0, 160) });
      } else {
        this.titleService.setTitle('Project Not Found | TaskHive');
      }
    }, (error: any) => {
      console.error(error);
      this.titleService.setTitle('Error Loading Project | TaskHive');
    });
  }

  get visibleProjects(): any[] {
    return this.projects.slice(0, this.itemsToShow);
  }

  getImageUrl(imagePath: string): string {
    if (!imagePath) {
      return 'assets/images/default.png'; // Fallback image
    }
    if (imagePath.startsWith('http')) {
      return imagePath;
    }
    return `${this.env}/${imagePath}`;
  }
}
