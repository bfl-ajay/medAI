import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class PaymentService {

  constructor(private http: HttpClient) {}

  initiatePayment(data: any) {
    return this.http.post('http://localhost:5000/api/payment/pay', data);
  }
}