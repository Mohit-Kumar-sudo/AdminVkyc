import {Component, OnInit, ViewChild} from '@angular/core';
import {AuthService} from 'src/app/services/auth.service';
import {Router} from '@angular/router';
import {LocalStorageService} from 'src/app/services/localsotrage.service';
import {AuthInfoData} from 'src/app/constants/mfr.constants';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

  isLoggedIn = true;
  user: any;
  isAdminLogin = false;

  constructor(
    private authService: AuthService,
    private router: Router,
    private localStorageService: LocalStorageService
  ) {
  }

  ngOnInit() {
    this.user = this.localStorageService.get(AuthInfoData.USER);
    if (!this.user) {
      this.router.navigate(['login']);
    }
    if (this.user && this.user.email === 'mrfradmin@gmail.com') {
      this.isAdminLogin = true;
      this.authService.isAdminLoggedIn(true);
    }
  }

}
