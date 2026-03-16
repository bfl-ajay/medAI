import { Component, OnInit } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
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

    this.updateAuthState();

    // update state whenever route changes
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.updateAuthState();
      }
    });
  }

  updateAuthState() {
    this.isLoggedInUser = this.authService.isLoggedIn();

    if (this.isLoggedInUser) {
      this.user = this.authService.getUser();
    } else {
      this.user = null;
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