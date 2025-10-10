import { Component, OnInit } from '@angular/core';
import { environment } from '../../../environments/environment';
import { ProjectService } from '../../services/project/project.service';
import { ActivatedRoute } from '@angular/router';
import { SsrService } from '../../services/ssr/ssr.service';
import { Title, Meta } from '@angular/platform-browser';

@Component({
  selector: 'app-project-details',
  templateUrl: './project-details.component.html',
  styleUrl: './project-details.component.scss'
})
export class ProjectDetailsComponent implements OnInit {
  project: any; 
  env: string = environment.url; 

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

    const projectId = this.route.snapshot.paramMap.get('id');
    if (projectId) {
      this.fetchProjectDetails(projectId);
    }
  }

  fetchProjectDetails(id: string): void {
    this.projectService.onProjectFindOne(id).subscribe(
      (response: any) => {
        if (response && response.data) {
          this.project = response.data;
          
          // Set dynamic meta tags for the specific project
          this.titleService.setTitle(this.project.title + ' | TaskHive Project');
          const description = this.project.meta_description || this.project.descriptions?.[0] || 'Learn more about our work on the ' + this.project.title + ' project.';
          this.metaService.updateTag({ name: 'description', content: description.substring(0, 160) });

        } else {
          console.error('Unexpected API response:', response);
           // Fallback for SEO if project is not found
          this.titleService.setTitle('Project Not Found | TaskHive');
          this.metaService.updateTag({ name: 'description', content: 'The project you are looking for could not be found.' });
        }
      },
      (error) => {
        console.error('Error fetching project details:', error);
         // Fallback for SEO on error
        this.titleService.setTitle('Error Loading Project | TaskHive');
        this.metaService.updateTag({ name: 'description', content: 'There was an error loading this project. Please try again later.' });
      }
    );
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