import { Component, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { AuthService } from 'src/app/core/services/auth.service';
import { Router, ActivatedRoute } from '@angular/router';
import { AlertService } from 'src/app/core/services/alert.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements AfterViewInit {

  name: string = '';
  email: string = '';
  message: string = '';

  @ViewChild('carousel') carousel!: ElementRef;

  activeIndex = 0;
  totalSlides = 0;

  constructor(
    private router: Router,
    private authService: AuthService,
    private route: ActivatedRoute,
    private alert: AlertService
  ) {}

  ngAfterViewInit() {

    // carousel setup
    this.totalSlides = this.carousel.nativeElement.children.length;

    // 🔹 Listen for fragment (#section)
    this.route.fragment.subscribe(fragment => {
      if (fragment) {
        setTimeout(() => {
          const element = document.getElementById(fragment);
          if (element) {
            element.scrollIntoView({
              behavior: 'smooth',
              block: 'start'
            });
          }
        }, 100);
      }
    });

  }

  submitContact() {
    const data = {
      name: this.name,
      email: this.email,
      message: this.message
    };

    this.authService.sendContactMessage(data).subscribe({
      next: () => {
        this.alert.success("Message sent successfully!");
        this.name = '';
        this.email = '';
        this.message = '';
      },
      error: () => {
        this.alert.error("Failed to send message.");
      }
    });
  }

  scrollLeft() {
    if (this.activeIndex > 0) {
      this.activeIndex--;
    } else {
      this.activeIndex = this.totalSlides - 1;
    }
    this.scrollToIndex();
  }

  scrollRight() {
    if (this.activeIndex < this.totalSlides - 1) {
      this.activeIndex++;
    } else {
      this.activeIndex = 0;
    }
    this.scrollToIndex();
  }

  goToSlide(index: number) {
    this.activeIndex = index;
    this.scrollToIndex();
  }

  private scrollToIndex() {
    const slideWidth = this.carousel.nativeElement.offsetWidth;

    this.carousel.nativeElement.scrollTo({
      left: slideWidth * this.activeIndex,
      behavior: 'smooth'
    });
  }

}