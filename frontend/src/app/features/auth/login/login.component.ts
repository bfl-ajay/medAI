import { Component } from '@angular/core';
import { AuthService } from '../../../core/services/auth.service';
import { Router } from '@angular/router';
import { AlertService } from 'src/app/core/services/alert.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  email: string = '';
  password: string = '';
  isLoading = false;
  showPassword: boolean = false;
  errorMessage: string = '';
  loginData = {
    email: '',
    password: ''
  };

  constructor(
    private authService: AuthService,
    private router: Router,
    private alert: AlertService
  ) { }
  /**
   * Handle login
   */

  login() {

    if (this.isLoading) return;

    this.isLoading = true;

    this.authService.login(this.loginData).subscribe({
      next: (res: any) => {

        this.isLoading = false;

        if (res.requires2FA) {

          localStorage.setItem('otpUserId', res.userId);

          this.alert.success("OTP Sent", "Check your email");

          this.router.navigate(['/verify-otp']);

          return; 
        }

        // ✅ normal login
        localStorage.setItem('token', res.token);

        this.authService.getProfile().subscribe((user: any) => {

          this.authService.setUser(user);

          this.router.navigate(['/dashboard']);

        });

      },

      error: (err) => {
        this.isLoading = false;
        this.alert.error(err.error?.message || "Login failed");
      }

    });

  }

  goToForgotPassword() {
    this.router.navigate(['/forgot-password']);
  }
  /**
   * Navigate to register page when Sign Up is clicked
   */
  navigateToRegister(): void {
    this.router.navigate(['/register']);
  }

}