import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-payment-success',
  templateUrl: './payment-success.component.html',
//   styleUrls: ['./payment-success.component.css']
})
export class PaymentSuccessComponent implements OnInit {

  status: string = '';
  txnid: string = '';
  amount: string = '';

  constructor(
    private route: ActivatedRoute,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    // PayU sends data via POST, but Angular captures via query (sometimes fallback)
    this.route.queryParams.subscribe(params => {
      this.status = params['status'];
      this.txnid = params['txnid'];
      this.amount = params['amount'];

      // 🔐 Call backend to verify
      this.verifyPayment();
    });
  }

  verifyPayment() {
    this.http.post('http://localhost:5000/api/payment/verify', {
      status: this.status,
      txnid: this.txnid
    }).subscribe({
      next: (res: any) => {
        console.log('Verification response:', res);
      },
      error: (err) => {
        console.error('Verification failed:', err);
      }
    });
  }
}