import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/core/services/auth.service';

@Component({
    selector: 'app-forgot-password',
    templateUrl: './forgot-password.component.html',
    styleUrls: ['./forgot-password.component.css']
})
export class ForgotPasswordComponent {

    email = '';
    otp = '';

    newPassword = '';
    confirmPassword = '';

    otpSent = false;
    otpVerified = false;

    isLoading = false;
    errorMessage = '';

    constructor(private router: Router, private authService: AuthService) { }

    sendOTP() {

        this.isLoading = true;

        this.authService.sendOTP(this.email).subscribe({

            next: () => {

                this.isLoading = false;
                this.otpSent = true;

                console.log("OTP sent");

            },

            error: () => {

                this.isLoading = false;
                this.errorMessage = "Failed to send OTP";

            }

        });

    }

    verifyOTP() {

        this.authService.verifyOTP(this.email, this.otp).subscribe({

            next: () => {

                this.otpVerified = true;

                console.log("OTP verified");

            },

            error: () => {

                this.errorMessage = "Invalid OTP";

            }

        });

    }

    resetPassword() {

  if (this.newPassword !== this.confirmPassword) {
    this.errorMessage = "Passwords do not match";
    return;
  }

  this.authService.resetPassword(
    this.email,
    this.newPassword
  ).subscribe({

    next: () => {

      alert("Password reset successfully");

      this.router.navigate(['/login']);

    },

    error: () => {

      this.errorMessage = "Failed to reset password";

    }

  });

}

    goToLogin() {
        this.router.navigate(['/login']);
    }

}