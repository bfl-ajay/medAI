import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-payment-failure',
  templateUrl: './payment-failure.component.html',
//   styleUrls: ['./payment-failure.component.css']
})
export class PaymentFailureComponent implements OnInit {

  status: string = '';
  txnid: string = '';
  errorMessage: string = '';

  constructor(private route: ActivatedRoute) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.status = params['status'];
      this.txnid = params['txnid'];
      this.errorMessage = params['error_Message'] || 'Payment failed. Please try again.';
    });
  }
}