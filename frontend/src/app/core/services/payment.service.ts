import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class PaymentService {

  constructor(private http: HttpClient) { }

  initiatePayment(data: any) {
    return this.http.post(`${environment.apiUrl}/api/payment/pay`, data);
  }
}