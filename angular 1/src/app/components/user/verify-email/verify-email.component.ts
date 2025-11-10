import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-verify-email',
  templateUrl: './verify-email.component.html',
  styleUrls: ['./verify-email.component.scss']
})
export class VerifyEmailComponent implements OnInit {
  id: any;
  confirm = false;
  data: any;
  modified: any;

  constructor(
    private routes: ActivatedRoute,
    private authService: AuthService,
    private router: Router
  ) { }

  ngOnInit() {
    this.id = this.routes.snapshot.params['id'];
    this.emailConfirm();
  }

  emailConfirm() {
    this.authService.getVerifyEmail(this.id).subscribe(d => {
      this.data = d;
      if (this.data.data._id) {
        if (this.data.data.emailConfirm) {
          this.router.navigate(['login']);
        } else {
          this.authService.confrimEmail(this.id).subscribe(d => {
            this.modified = d;
            if (this.modified.nModified) {
              console.log("Email verified");
            }
          })
        }
      } else {
        this.router.navigate(['login']);
      }
    }, err => {
      if (err) {
        console.log(err)
        this.router.navigate(['login']);
      }
    })
  }
}
