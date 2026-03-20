import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { AlertService } from 'src/app/core/services/alert.service';
import { AuthService } from 'src/app/core/services/auth.service';
import { environment } from 'src/environments/environment';
@Component({
    selector: 'app-verify-otp',
    templateUrl: './verify-otp.component.html',
    styleUrls: ['./verify-otp.component.css']
})
export class VerifyOtpComponent {

    constructor(private http: HttpClient, private router: Router, private alert: AlertService, private authService: AuthService) { }
    otpArray = ['', '', '', '', '', ''];

    trackByIndex(index: number) {
        return index;
    }

    onInput(event: any, index: number) {

        const value = event.target.value;

        if (!/^[0-9]$/.test(value)) {
            event.target.value = '';
            return;
        }

        this.otpArray[index] = value;

        const next = event.target.nextElementSibling;
        if (next) {
            next.focus();
        }

    }

    onKeyDown(event: any, index: number) {

        if (event.key === "Backspace") {

            this.otpArray[index] = '';

            const prev = event.target.previousElementSibling;
            if (prev) {
                prev.focus();
            }

        }

    }

    verifyOTP() {

        const userId = localStorage.getItem('otpUserId');
        const otp = this.otpArray.join('');

        this.http.post<any>(`${environment.apiUrl}/api/auth/verify-login-otp`, {
            userId,
            otp
        }).subscribe(res => {

            localStorage.setItem('token', res.token);

            this.authService.getProfile().subscribe((user: any) => {

                this.authService.setUser(user);   // 🔴 updates navbar instantly

                this.router.navigate(['/dashboard']);

            });

        });

    }
    resendOTP() {

        this.alert.success("OTP Resend Successfully");
    }

}