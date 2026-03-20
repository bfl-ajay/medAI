import { Injectable } from '@angular/core';
import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  constructor(
    private router: Router,
    private authService: AuthService
  ) { }

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {

    const token = this.authService.getToken();

    // ✅ PUBLIC ROUTES (no token)
    const isPublicRoute =
      req.url.includes('send-otp') ||
      req.url.includes('login') ||
      req.url.includes('register') ||
      req.url.includes('forgot-password');

    let authReq = req;

    if (token && !isPublicRoute) {
      authReq = req.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      });
    }

    return next.handle(authReq).pipe(
      catchError((error: HttpErrorResponse) => {

        if (error.status === 401) {

          // ⚠️ Only logout if it's NOT a public route
          if (!isPublicRoute && token) {
            this.authService.logout();
            this.router.navigate(['/login']);
          }

        }

        return throwError(() => error);
      })
    );
  }
}