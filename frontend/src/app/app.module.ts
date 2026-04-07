import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { RouterModule } from '@angular/router';
import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { AuthInterceptor } from './core/intercptors/auth.interceptor';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { CommonModule } from '@angular/common';

import { HomeComponent } from './features/home/home.component';
import { LoginComponent } from './features/auth/login/login.component';
import { AdminDashboardComponent } from './features/dashboard/admin-dashboard/admin-dashboard.component';
import { RegisterComponent } from './features/auth/register/register.component';
import { DashboardComponent } from './features/dashboard/dashboard.component';
import { NavbarComponent } from './shared/navbar/navbar.component';

import { UploadReportsComponent } from './features/upload-reports/upload-reports.component';
import { UploadPrescriptionComponent } from './features/upload-prescription/upload-prescription.component';
import { AddInfoComponent } from './features/add-info/add-info.component';
import { ProfileComponent } from './features/profile/profile.component';
import { VerifyOtpComponent } from './features/auth/verify-otp/verify-otp.component';
import { ForgotPasswordComponent } from './features/auth/forgot-password/forgot-password.component';
import { PaymentFailureComponent } from './features/payment-failure/payment-failure.component';
import { PaymentSuccessComponent } from './features/payment-success/payment-success.component';

@NgModule({
    declarations: [
        AppComponent,
        HomeComponent,
        LoginComponent,
        AdminDashboardComponent,
        RegisterComponent,
        VerifyOtpComponent,
        DashboardComponent,
        NavbarComponent,
        UploadReportsComponent,
        UploadPrescriptionComponent,
        AddInfoComponent,
        ProfileComponent,
        ForgotPasswordComponent,
        PaymentSuccessComponent,
        PaymentFailureComponent,

    ],
    imports: [
        BrowserModule,
        FormsModule,
        AppRoutingModule,
        HttpClientModule,
        RouterModule,
        CommonModule
    ],
    providers: [{
        provide: HTTP_INTERCEPTORS,
        useClass: AuthInterceptor,
        multi: true
    }],
    bootstrap: [AppComponent]
})
export class AppModule { }