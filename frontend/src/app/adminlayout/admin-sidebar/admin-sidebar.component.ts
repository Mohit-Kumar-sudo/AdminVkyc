import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-admin-sidebar',
  templateUrl: './admin-sidebar.component.html',
  styleUrl: './admin-sidebar.component.scss'
})
export class AdminSidebarComponent implements OnInit{
  @Input() sideNavStatus: boolean = false;
  
  list = [
    {
      number: '1',
      name: 'Dashboard',
      icon: 'fa-solid fa-house',
      route: '/admin/dashboard' // Add route path here
    },
    {
      number: '2',
      name: 'Blogs',
      icon: 'fa-solid fa-blog',
      route: '/admin/blogs' // Add route path here
    },
    {
      number: '3',
      name: 'Contacts',
      icon: 'fa-solid fa-phone',
      route: '/admin/query' // Add route path here
    },
    {
      number: '4',
      name: 'Projects',
      icon: 'fa-solid fa-diagram-project',
      route: '/admin/projects' // Add route path here
    },
    {
      number: '5',
      name: 'Course - Query',
      icon: 'fa-solid fa-book-open-reader',
      route: '/admin/course-query' // Add route path here
    },
    {
      number: '6',
      name: 'Courses',
      icon: 'fa-solid fa-book-open-reader',
      route: '/admin/courses' // Add route path here
    },
    {
      number: '7',
      name: 'Carrier - Query',
      icon: 'fa-solid fa-user-doctor',
      route: '/admin/carrier-query' // Add route path here
    },
    {
      number: '7',
      name: 'Carriers',
      icon: 'fa-solid fa-user-doctor',
      route: '/admin/carriers' // Add route path here
    }
  ];

  constructor(){}
  ngOnInit(): void {
    
  }
}
