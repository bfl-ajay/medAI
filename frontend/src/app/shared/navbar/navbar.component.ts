import { Component, HostListener, OnInit } from '@angular/core';
import { AuthService } from '../../core/services/auth.service';
import { Router } from '@angular/router';
import { AlertService } from 'src/app/core/services/alert.service';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit {

  menuOpen = false;
  sidebarOpen = false;
  user: any;
  isMobile = false;
  isLoggedInUser = false;
  isAdminRoute = false;

  constructor(
    private router: Router,
    private authService: AuthService,
    private alert: AlertService
  ) { }

  ngOnInit() {
    // Subscribe to user data
    this.authService.user$.subscribe(user => {
      this.user = user;
      this.updateLoginStatus();
    });

    this.router.events.subscribe(() => {
      this.isAdminRoute = this.router.url.startsWith('/admin');
    });

    // Load user profile if not already loaded
    if (!this.authService.getCurrentUser()) {
      this.authService.getProfile().subscribe(
        (data: any) => {
          this.authService.setUser(data);
          this.updateLoginStatus();
        },
        (error) => {
          // If getting profile fails, user is not logged in
          this.updateLoginStatus();
        }
      );
    } else {
      this.updateLoginStatus();
    }

    // Check screen size on init
    this.checkScreenSize();
  }

  /**
   * Update login status based on token
   */
  updateLoginStatus() {
    this.isLoggedInUser = !!this.user;
  }
  /**
   * Toggle sidebar (logged in)
   */
  toggleSidebar() {
    this.sidebarOpen = !this.sidebarOpen;
  }

  /**
   * Close sidebar (logged in)
   */
  closeSidebar() {
    if (this.isMobile) {
      this.sidebarOpen = false;
    }
  }

  /**
   * Toggle main menu (not logged in)
   */
  toggleMenu() {
    this.menuOpen = !this.menuOpen;
  }

  /**
   * Close main menu (not logged in)
   */
  closeMenu() {
    this.menuOpen = false;
  }

  /**
   * Check screen size - update on window resize
   */
  @HostListener('window:resize', ['$event'])
  onWindowResize() {
    this.checkScreenSize();
  }

  /**
   * Determine if screen is mobile size
   */
  checkScreenSize() {
    this.isMobile = window.innerWidth < 768;

    // Reset menus when switching to desktop
    if (!this.isMobile) {
      this.menuOpen = false;
      this.sidebarOpen = false;
    }
  }
  navigateAndClose() {
    setTimeout(() => {
      this.menuOpen = false;
    }, 200);
  }
  /**
   * Navigate to home section (not logged in)
   */
  navigateToSection(section: string) {
    this.closeMenu();
    this.router.navigate(['/'], { fragment: section });
  }

  /**
   * Check if user is logged in
   */
  isLoggedIn(): boolean {
    return this.isLoggedInUser;
  }

  /**
   * Logout user
   */
  logout() {

    this.alert.confirm("Are you sure you want to log out?")
      .then((result) => {

        if (!result.isConfirmed) return;

        localStorage.removeItem('token');

        this.authService.logout(); // this already clears user$

        this.menuOpen = false;
        this.sidebarOpen = false;

        this.alert.success("Logged out successfully");

        this.router.navigate(['/']);

      });

  }

  goToProfile() {
    this.sidebarOpen = false;
    this.menuOpen = false;

    this.router.navigate(['/profile'], {
      queryParams: { tab: 'personal' }
    });
  }

  goToSecurity() {
    this.sidebarOpen = false;
    this.menuOpen = false;

    this.router.navigate(['/profile'], {
      queryParams: { tab: 'security' }
    });
  }

  goToPlan() {
    this.sidebarOpen = false;
    this.menuOpen = false;

    this.router.navigate(['/profile'], {
      queryParams: { tab: 'plan' }
    });
  }
}