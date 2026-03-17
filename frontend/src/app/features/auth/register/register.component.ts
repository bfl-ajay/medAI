import { Component } from '@angular/core';
import { NgForm } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { Router } from '@angular/router';
import { DiseaseService } from '../../../core/services/disease.service';
import { AlertService } from 'src/app/core/services/alert.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {
  currentStep = 1;

  name = '';
  dob = '';
  mobile_no = '';
  gender = '';
  height: number | null = null;
  weight: number | null = null;
  bloodGroup = '';
  knownDiseases: string[] = [];
  diseaseInput: string = '';
  email = '';
  password = '';
  confirmPassword = '';
  searchDiseases: string[] = [];

  filteredDiseases: string[] = [];
  bloodGroups: string[] = [
    'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'
  ];

  constructor(
    private authService: AuthService,
    private router: Router,
    private diseaseService: DiseaseService,
    private alert: AlertService
  ) { }

  /**
   * Move to next step
   */
  nextStep(): void {
    if (this.isStep1Valid()) {
      this.currentStep = 2;
      window.scrollTo(0, 0);
    }
  }

  /**
   * Move to previous step
   */
  prevStep(): void {
    this.currentStep = 1;
    window.scrollTo(0, 0);
  }

  /**
   * Handle form submission
   */
  handleSubmit(form: NgForm): void {
    if (this.currentStep === 1) {
      if (!this.isStep1Valid()) {
        this.markTouched(form);
        return;
      }
      this.nextStep();
    } else {
      if (!this.isStep2Valid()) {
        this.markTouched(form);
        return;
      }
      this.register();
    }
  }

  /**
   * Validate step 1
   */
  isStep1Valid(): boolean {
    return (
      this.name?.length >= 3 &&
      !!this.dob &&
      /^[0-9]{10}$/.test(this.mobile_no) &&
      !!this.gender &&
      !!this.height && this.height >= 50 &&
      !!this.weight && this.weight >= 10 &&
      !!this.bloodGroup
    );
  }

  /**
   * Validate step 2
   */
  isStep2Valid(): boolean {
    return (
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.email) &&
      this.password?.length >= 6 &&
      this.confirmPassword === this.password
    );
  }

  /**
   * Mark all fields as touched for validation display
   */
  markTouched(form: NgForm): void {
    Object.values(form.controls).forEach(control => {
      control.markAsTouched();
    });
  }

  /**
   * Register user
   */
  register(): void {
    const data = {
      name: this.name,
      dob: this.dob,
      mobile_no: this.mobile_no,
      gender: this.gender,
      height: this.height,
      weight: this.weight,
      bloodGroup: this.bloodGroup,
      knownDiseases: this.knownDiseases,
      email: this.email,
      password: this.password
    };

    

    this.authService.register(data).subscribe({
      next: (res) => {
        
        this.alert.success("Registration successful! Please log in.");
        this.router.navigate(['/login']);
      },
      error: (err) => {
        
        this.alert.error(err.error?.message || 'Registration failed. Please try again.');
      }
    });
  }

  /**
   * Handle disease input and show suggestions
   */
  onDiseaseInput(): void {
    if (!this.diseaseInput.trim()) {
      this.filteredDiseases = [];
      return;
    }

    this.diseaseService.searchDiseases(this.diseaseInput).subscribe(
      (response: any) => {
        const results = response[3] || [];

        this.filteredDiseases = results
          .map((item: any) => ({
            code: item[0],
            name: item[1]
          }))
          .filter((item: any) =>
            !item.name.toLowerCase().includes('poisoning') &&
            !item.name.toLowerCase().includes('underdosing')
          )
          .slice(0, 8); // Limit to 8 suggestions
      },
      (error) => {
        
        this.filteredDiseases = [];
      }
    );
  }

  /**
   * Select disease from suggestions
   */
  selectDisease(disease: any): void {
    const formatted = `${disease.code} - ${disease.name}`;

    if (!this.knownDiseases.includes(formatted)) {
      this.knownDiseases.push(formatted);
    }

    this.diseaseInput = '';
    this.filteredDiseases = [];
  }

  /**
   * Add disease manually on Enter key
   */
  addDisease(event: KeyboardEvent): void {
    event.preventDefault();
    const value = this.diseaseInput.trim();

    if (!value) return;

    if (!this.knownDiseases.includes(value)) {
      this.knownDiseases.push(value);
    }

    this.diseaseInput = '';
    this.filteredDiseases = [];
  }

  /**
   * Remove disease from list
   */
  removeDisease(index: number): void {
    this.knownDiseases.splice(index, 1);
  }

  /**
   * Navigate to login page
   */
  navigateToLogin(): void {
    this.router.navigate(['/login']);
  }
}