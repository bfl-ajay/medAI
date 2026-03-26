import { NgModule } from '@angular/core';
import { RouterModule, Routes, ExtraOptions } from '@angular/router';
import { AuthGuard } from './core/guards/auth.guards';

import { DashboardComponent } from './features/dashboard/dashboard.component';
import { HomeComponent } from './features/home/home.component';
import { LoginComponent } from './features/auth/login/login.component';
import { RegisterComponent } from './features/auth/register/register.component';

import { UploadReportsComponent } from './features/upload-reports/upload-reports.component';
import { UploadPrescriptionComponent } from './features/upload-prescription/upload-prescription.component';
import { AddInfoComponent } from './features/add-info/add-info.component';
import { ProfileComponent } from './features/profile/profile.component';
import { VerifyOtpComponent } from './features/auth/verify-otp/verify-otp.component';
import { ForgotPasswordComponent } from './features/auth/forgot-password/forgot-password.component';
import { PaymentFailureComponent } from './features/payment-failure/payment-failure.component';
import {PaymentSuccessComponent } from './features/payment-success/payment-success.component'

const routes: Routes = [
    { path: '', component: HomeComponent },
    { path: 'login', component: LoginComponent },
    { path: 'register', component: RegisterComponent },
    { path: 'forgot-password', component: ForgotPasswordComponent },
    { path: 'verify-otp', component: VerifyOtpComponent },
    //{ path: 'proytected', component: DashboardComponent, canActivate: [AuthGuard] },
    { path: 'dashboard', component: DashboardComponent, canActivate: [AuthGuard] },
    { path: 'profile', component: ProfileComponent, canActivate: [AuthGuard] },
    { path: 'upload-reports', component: UploadReportsComponent, canActivate: [AuthGuard] },
    { path: 'upload-prescription', component: UploadPrescriptionComponent, canActivate: [AuthGuard] },
    { path: 'add-info', component: AddInfoComponent, canActivate: [AuthGuard] },
    { path: 'payment-success', component: PaymentSuccessComponent },
    { path: 'payment-failure', component: PaymentFailureComponent }
];

const routerOptions: ExtraOptions = {
    anchorScrolling: 'enabled',
    scrollPositionRestoration: 'enabled',
    scrollOffset: [0, 72]
};



@NgModule({
    imports: [
        RouterModule.forRoot(routes, {
            anchorScrolling: 'enabled',
            scrollPositionRestoration: 'enabled'
        })
    ],
    exports: [RouterModule]
})
export class AppRoutingModule { }