import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Router } from '@angular/router';

@Component({
  selector: 'app-payment-failure',
  templateUrl: './payment-failure.component.html',
  styleUrls: ['./payment-failure.component.css']
})
export class PaymentFailureComponent implements OnInit {

  user: any;
  status: string = '';
  txnid: string = '';
  errorMessage: string = '';
  isPaying = false;

  constructor(private route: ActivatedRoute,
    private router: Router,
  ) { }

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.status = params['status'];
      this.txnid = params['txnid'];
      this.errorMessage = params['error_Message'] || 'Payment failed. Please try again.';
    });
  }

  goBack() {
    this.router.navigate(['/profile'], {
      queryParams: { tab: 'plan' }
    });
  }


}