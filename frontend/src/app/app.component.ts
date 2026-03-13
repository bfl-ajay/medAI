import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from './core/services/auth.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html'
})
export class AppComponent implements OnInit {

  user: any = null;
  isLoggedInUser = false;

  constructor(private authService: AuthService, private router: Router) { }

  ngOnInit() {

    // check login
    this.isLoggedInUser = this.authService.isLoggedIn();

    if (this.isLoggedInUser) {
      this.user = this.authService.getUser();
    }

  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/']);
  }

  goToProfile() {
    this.router.navigate(['/profile']);
  }

}