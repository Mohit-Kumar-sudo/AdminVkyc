import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth/auth.service';

@Component({
  selector: 'app-admin-header',
  templateUrl: './admin-header.component.html',
  styleUrls: ['./admin-header.component.scss']
})
export class AdminHeaderComponent implements OnInit {
  @Output() sideNavToggled = new EventEmitter<boolean>();
  menuStatus: boolean = false;
  showDropdown = false;

  constructor(
    private authService: AuthService,
    private router: Router
  ) { }

  ngOnInit(): void {
  }

  SideNavToggle() {
    this.menuStatus = !this.menuStatus;
    this.sideNavToggled.emit(this.menuStatus);
  }

  toggleDropdown() { // Add this method
    this.showDropdown = !this.showDropdown;
  }
  
  logout() {
    this.authService.logout(); // Calls the AuthService to handle logout
    this.router.navigate(['/login']); // Redirects to the login page
  }
}