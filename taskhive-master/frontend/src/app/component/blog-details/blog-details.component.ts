import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { BlogService } from '../../services/blog/blog.service';
import { environment } from '../../../environments/environment';
import { SsrService } from '../../services/ssr/ssr.service';
import { Title, Meta } from '@angular/platform-browser';

@Component({
  selector: 'app-blog-details',
  templateUrl: './blog-details.component.html',
  styleUrls: ['./blog-details.component.scss']
})
export class BlogDetailsComponent implements OnInit {
  blog: any;
  env = environment.url;

  constructor(
    private route: ActivatedRoute,
    private _blogService: BlogService,
    private ssrService: SsrService,
    private titleService: Title,
    private metaService: Meta
  ) {}

  async ngOnInit(): Promise<void> {
    if (this.ssrService.isBrowser()) {
        const AOS = await this.ssrService.loadAOS();
        AOS.init({
            offset: 120,
            duration: 1000,
            easing: 'ease',
            delay: 100,
            once: true,
        });
    }
    const blogId = this.route.snapshot.paramMap.get('id');
    if (blogId) {
      this._blogService.onBlogFindOne(blogId).subscribe(
        (response: any) => {
          this.blog = response.data;
          // Set dynamic meta tags once the blog data is available
          if (this.blog) {
            this.titleService.setTitle(this.blog.title + ' | TaskHive Blog');
            // Use a snippet of the content for the description if a meta description isn't provided
            const description = this.blog.meta_description || this.blog.description?.substring(0, 160) || 'Read our latest blog post on ' + this.blog.title;
            this.metaService.updateTag({ name: 'description', content: description });
          } else {
             // Fallback for SEO if blog is not found
            this.titleService.setTitle('Blog Post Not Found | TaskHive');
            this.metaService.updateTag({ name: 'description', content: 'The blog post you are looking for could not be found.' });
          }
        },
        (error) => {
          console.error('Error fetching blog data:', error);
          // Fallback for SEO on error
          this.titleService.setTitle('Error Loading Blog | TaskHive');
          this.metaService.updateTag({ name: 'description', content: 'There was an error loading this blog post. Please try again later.' });
        }
      );
    }
  }
}