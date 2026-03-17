import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/core/services/auth.service';
import { AlertService } from 'src/app/core/services/alert.service';

@Component({
  selector: 'app-add-info',
  templateUrl: './add-info.component.html',
  styleUrls: ['./add-info.component.css']
})
export class AddInfoComponent implements OnInit {

  emergencyContact: string = '';
  allergies: string = '';
  notes: string = '';
  additionalInfos: any[] = [];
  pastRecords: any[] = [];

  constructor(private authService: AuthService, private alert: AlertService) { }

  ngOnInit() {
    this.loadPastRecords();
  }

  loadPastRecords() {
    this.authService.getAdditionalInfo().subscribe((data: any) => {
      
      this.pastRecords = data;
    });
  }

  save() {

    const phone = this.emergencyContact?.trim();

    if (!phone) {
      this.alert.error("Emergency contact is required");
      return;
    }

    // must be 10 digits
    if (!/^[0-9]{10}$/.test(phone)) {
      this.alert.error("Enter a valid 10 digit phone number");
      return;
    }

    // prevent same digit repeated 10 times
    if (/^(\d)\1{9}$/.test(phone)) {
      this.alert.error("Emergency contact cannot contain the same digit repeated");
      return;
    }

    const data = {
      emergencyContact: phone,
      allergies: this.allergies,
      notes: this.notes
    };

    this.authService.saveAdditionalInfo(data).subscribe({

      next: () => {

        this.alert.success("Information saved successfully");

        this.emergencyContact = '';
        this.allergies = '';
        this.notes = '';

        this.loadPastRecords();
      },

      error: () => {
        this.alert.error("Error occurred");
      }

    });

  }
  
  blockLetters(event: KeyboardEvent) {

    const charCode = event.which ? event.which : event.keyCode;

    // Allow only numbers (0-9)
    if (charCode < 48 || charCode > 57) {
      event.preventDefault();
    }

  }

  allowNumbersOnly() {

    // remove any non-numeric characters (for paste cases)
    this.emergencyContact = this.emergencyContact.replace(/[^0-9]/g, '');

  }
}