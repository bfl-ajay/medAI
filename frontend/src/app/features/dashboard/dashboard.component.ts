import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/core/services/auth.service';
import { Chart } from 'chart.js/auto';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AlertService } from 'src/app/core/services/alert.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
})
export class DashboardComponent implements OnInit {

  profile: any;
  aiPlan: any;

  medicines: any[] = [];
  medicineName: string = '';
  medicineTime: string = '';
  bpRecords: any[] = [];
  bpDates: string[] = [];
  currentBP: any[] = [];
  previousBP: any[] = [];
  filteredBP: any[] = [];
  systolic: number[] = [];
  diastolic: number[] = [];
  pulse: number[] = [];
  prescriptions: any[] = [];
  analyzedPrescriptionId: number | null = null;
  selectedPrescriptionId: number | null = null;
  showAll: boolean = false;
  isMobile = false;
  showBPChart = true
  bpChart: any;
  selectedMonth: string = 'all';
  availableMonths: string[] = [];
  filteredBPRecords: any[] = [];
  labMetrics: any = {};

  isSidebarOpen = false;
  checkScreen() {
    this.isMobile = window.innerWidth <= 768;
  }
  reminders: { id: number; name: string; time: string; editing: boolean }[] = [];
  latestInfo: any;

  constructor(private router: Router, private authService: AuthService, private alert: AlertService) { }

  ngOnInit() {

    this.loadBP();
    this.authService.getPrescriptions().subscribe((data: any) => {
      this.prescriptions = data;
    });
    this.authService.getProfile().subscribe({
      next: (res: any) => {
        this.profile = res;

        // Calculate health score AFTER profile loads
        this.profile.healthScore = this.calculateHealthScore();

        // Wait for DOM to render

      },
      error: (err) => {
        console.log(err);
      }

    });

    this.authService.getLatestAdditionalInfo()
      .subscribe((data: any) => {
        this.latestInfo = data;
      });
    // Load reminders
    this.authService.getReminders().subscribe((data: any) => {
      console.log("REMINDERS FROM DB:", data);
      this.reminders = data;
    });
    this.checkScreen();
    window.addEventListener('resize', () => this.checkScreen());

    this.checkScreen();

    this.authService.getReports().subscribe((reports: any[]) => {

      const allMetrics: any = {};

      reports.forEach((r: any) => {

        if (r.metrics) {

          r.metrics.forEach((m: any) => {

            allMetrics[m.name.toLowerCase()] = m;

          });

        }

      });

      this.labMetrics = allMetrics;

    });
  }

  // HEALTH SCORE
  calculateHealthScore(): number {

    if (!this.profile) return 0;

    let score = 0;
    const bmi = this.profile.bmi;
    const diseases = this.profile.knownDiseases || [];

    if (bmi >= 18.5 && bmi < 25) {
      score = 90;
    } else if (bmi >= 25 && bmi < 30) {
      score = 70;
    } else if (bmi < 18.5) {
      score = 65;
    } else {
      score = 50;
    }

    score -= diseases.length * 10;

    if (score < 20) score = 20;

    return score;
  }

  calculateLabRisks() {

    const m = this.labMetrics || {};

    let nutritionRisk = 20;
    let kidneyRisk = 20;
    let liverRisk = 20;
    let diabetesRisk = 20;

    if (m["iron"]?.status === "low" || m["vitamin b12"]?.status === "low") {
      nutritionRisk = 70;
    }

    if (m["creatinine"]?.status === "high") {
      kidneyRisk = 80;
    }

    if (m["sgpt"]?.status === "high" || m["sgot"]?.status === "high") {
      liverRisk = 80;
    }

    if (m["glycosylated haemoglobin"]?.status === "high") {
      diabetesRisk = 85;
    }

    return {
      nutritionRisk,
      kidneyRisk,
      liverRisk,
      diabetesRisk
    };

  }

  // AI PLAN
  getPlan() {
    this.authService.getAIPlan(this.profile).subscribe({
      next: (res: any) => {
        console.log("PLAN:", res);

        this.aiPlan = res;
      },
      error: (err) => {
        console.log(err);
        this.alert.error("Failed to load Plan");
      }
    });
  }
  // REMINDERS
  setReminder() {
    if (!this.medicineName || !this.medicineTime) {
      this.alert.warning("Please enter medicine name and time");
      return;
    }
    this.authService.addReminder({
      medicineName: this.medicineName,
      time: this.medicineTime
    }).subscribe((newReminder: any) => {
      this.reminders.push(newReminder);
      this.medicineName = '';
      this.medicineTime = '';
    });
    this.alert.success("Reminder added successfully");
  }
  deleteReminder(index: number) {
    const reminder = this.reminders[index];

    this.authService.deleteReminder(reminder.id).subscribe(() => {
      this.reminders.splice(index, 1);
    });
    this.alert.success("Reminder deleted");
  }

  editReminder(index: number) {
    this.reminders[index].editing = true;
  }

  saveReminder(index: number) {
    const reminder = this.reminders[index];

    this.authService.updateReminder(reminder.id, {
      name: reminder.name,

      time: reminder.time
    }).subscribe(() => {
      reminder.editing = false;
    });
    this.alert.success("Reminder updated");
  }
  cancelEdit(index: number) {
    this.reminders[index].editing = false;
  }
  addReminder(med: any, time: string) {

    this.authService.addReminder({
      medicineName: med.name,
      time: time
    }).subscribe((newReminder: any) => {

      this.reminders = [
        ...this.reminders,
        {
          id: newReminder.id,
          name: newReminder.name,
          time: newReminder.time,
          editing: false
        }
      ];
      this.alert.success("Medicine reminders added");

    });

  }
  isReminderAdded(med: any, time: string): boolean {

    if (!this.reminders?.length) return false;

    const compareName = this.cleanString(med.name);
    const compareTime = this.cleanTime(time);

    return this.reminders.some(r => {

      const reminderName = this.cleanString(r.name);
      const reminderTime = this.cleanTime(r.time);

      return reminderName === compareName && reminderTime === compareTime;

    });
  }

  cleanString(value: string): string {
    if (!value) return '';

    return value
      .toString()
      .trim()
      .toLowerCase()
      .replace(/\s+/g, ' '); // remove extra spaces
  }

  cleanTime(value: string): string {
    if (!value) return '';

    const t = value.toString().trim().toUpperCase();

    if (t === 'PRN') return 'PRN';

    if (t.includes(':')) return t.substring(0, 5);

    return t;
  }
  normalizeTime(time: string): string {
    if (!time) return '';

    const t = time.toString().trim().toUpperCase();

    // Handle PRN
    if (t === 'PRN') return 'PRN';

    // Handle HH:MM:SS
    if (t.includes(':')) {
      return t.substring(0, 5);
    }

    return t;
  }

  addBP() {
    const data = {
      systolic: this.systolic,
      diastolic: this.diastolic,
      pulse: this.pulse
    };

    this.authService.addBloodPressure(data).subscribe(() => {
      this.systolic;
      this.diastolic;
      this.pulse;
      this.loadBP();
    });
    this.alert.success("Blood pressure recorded");
  }

  loadBP() {
    this.authService.getBloodPressure().subscribe((data: any) => {

      this.bpRecords = data || [];

      this.extractMonths();
      setTimeout(() => {
        this.createBPChart();
      }, 100);

    });
  }

  getBPStatus(s: number, d: number): string {

    if (s >= 180 || d > 120) {
      return "Hypertensive Crisis";
    }
    if (s >= 140 || d >= 90) {
      return "Stage 2 Hypertension";
    }
    if (s >= 130 || d >= 80) {
      return "Stage 1 Hypertension";
    }
    if (s >= 120 && d < 80) {
      return "Elevated";
    }
    return "Normal";
  }

  getBPClass(s: number, d: number): string {
    if (s >= 180 || d >= 120) {
      return "crisis";
    }
    if (s >= 140 || d >= 90) {
      return "stage2";
    }
    if (s >= 130 || d >= 80) {
      return "stage1";
    }
    if (s >= 120 && d < 80) {
      return "elevated";
    }
    return "normal";
  }

  applyFilter() {
    if (this.showAll) {
      this.filteredBP = this.bpRecords;
    } else {
      this.filteredBP = this.bpRecords.slice(0, 7); // Last 7 records
    }
  }
  toggleView() {
    this.showAll = !this.showAll;
    this.applyFilter();
  }

  processBPData() {

    if (!this.bpRecords || this.bpRecords.length === 0) {
      this.currentBP = [];
      this.previousBP = [];
      return;
    }

    // First 7 latest records = current week
    this.currentBP = this.bpRecords.slice(0, 3);

    const older = this.bpRecords.slice(3);

    const grouped: any = {};

    older.forEach(bp => {
      const date = new Date(bp.recorded_at);
      const weekStart = new Date(date);
      weekStart.setDate(date.getDate() - date.getDay());

      const key = weekStart.toDateString();

      if (!grouped[key]) {
        grouped[key] = [];
      }

      grouped[key].push(bp);
    });

    this.previousBP = Object.keys(grouped).map(key => ({
      weekStart: key,
      records: grouped[key],
      expanded: false
    }));
  }
  getLatestBP() {
    if (!this.bpRecords || this.bpRecords.length === 0) {
      return null;
    }

    return this.bpRecords[0]; // assuming newest first
  }
  arePrescriptionRemindersAdded(id: number): boolean {

    if (!this.reminders || this.reminders.length === 0) {
      return false;
    }

    return true; // simple version (since we auto-add all)

  }

  togglePrescriptionMedicines(id: number) {

    // If already opened → close it
    if (this.selectedPrescriptionId === id) {
      this.selectedPrescriptionId = null;
      this.medicines = [];
      return;
    }

    // Otherwise load and show
    this.selectedPrescriptionId = id;

    this.authService.analyzePrescription(id).subscribe((res: any) => {
      this.medicines = res.medicines || [];
    });

  }

  addRemindersFromPrescription(id: number) {

    this.analyzedPrescriptionId = id;

    this.authService.analyzePrescription(id).subscribe((res: any) => {

      const meds = res.medicines || [];

      this.medicines = meds;
      let added = true;

      meds.forEach((med: any) => {

        med.times.forEach((time: string) => {

          if (!this.isReminderAdded(med, time)) {
            added = false;
            this.authService.addReminder({
              medicineName: med.name,
              time: time
            }).subscribe((newReminder: any) => {

              this.reminders = [
                ...this.reminders,
                {
                  id: newReminder.id,
                  name: newReminder.name,
                  time: newReminder.time,
                  editing: false
                }
              ];
            });
          }
        });
      });
    });
  }

  areAllMedicinesAdded(): boolean {

    if (!this.medicines || this.medicines.length === 0) {
      return false;
    }

    return this.medicines.every(med =>
      med.times.every(time => this.isReminderAdded(med, time))
    );

  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.createRiskRadarChart();
    }, 200);
  }

  createRiskRadarChart() {
    const labRisks = this.calculateLabRisks();
    const bmiRisk = this.profile?.bmi > 30 ? 80 :
      this.profile?.bmi > 25 ? 60 :
        this.profile?.bmi > 18.5 ? 20 : 40;

    const diseaseRisk = (this.profile?.knownDiseases?.length || 0) * 20;

    const lifestyleRisk = this.profile?.lifestyle === 'active' ? 20 : 70;

    const ageRisk = this.profile?.age > 60 ? 80 :
      this.profile?.age > 40 ? 50 : 20;

    const healthScoreRisk = 100 - (this.profile?.healthScore || 50);

    new Chart("riskRadarChart", {

      type: 'radar',

      data: {
        labels: [
          'BMI Risk',
          'Disease Risk',
          'Nutrition Risk',
          'Kidney Risk',
          'Diabetes Risk',
          'Lifestyle Risk'
        ],

        datasets: [{
          label: 'Health Risk Level',
          data: [
            bmiRisk,
            diseaseRisk,
            labRisks.nutritionRisk,
            labRisks.kidneyRisk,
            labRisks.diabetesRisk,
            lifestyleRisk
          ],
          backgroundColor: 'rgba(45,159,149,0.2)',
          borderColor: '#2D9F95',
          borderWidth: 2,
          pointBackgroundColor: '#2D9F95'
        }]
      },

      options: {
        responsive: true,

        scales: {
          r: {
            beginAtZero: true,
            max: 100,

            ticks: {
              display: false
            },

            grid: {
              color: '#eee'
            },

            angleLines: {
              color: '#ddd'
            }
          }
        },

        plugins: {
          legend: {
            display: false
          }
        }
      }

    });

  }

  goToProfile() {
    this.router.navigate(['/profile']);
  }

  getBMILabel(bmi: number): string {

    if (!bmi) return '';

    if (bmi < 18.5) return '⚠ Underweight';

    if (bmi < 25) return '✓ Normal';

    if (bmi < 30) return '⚠ Overweight';

    return '✖ Obese';
  }

  getBMIClass(bmi: number): string {

    if (!bmi) return '';

    if (bmi < 18.5) return 'bmi-warning';

    if (bmi < 25) return 'bmi-good';

    if (bmi < 30) return 'bmi-warning';

    return 'bmi-danger';
  }

  createBPChart() {

    if (!this.filteredBPRecords || this.filteredBPRecords.length === 0) return;

    const canvas = document.getElementById('bpChart') as HTMLCanvasElement;
    if (!canvas) return;

    const labels = this.filteredBPRecords.map(bp =>
      new Date(bp.recorded_at).toLocaleDateString()
    ).reverse();

    const systolic = this.filteredBPRecords.map(bp => bp.systolic).reverse();
    const diastolic = this.filteredBPRecords.map(bp => bp.diastolic).reverse();
    const pulse = this.filteredBPRecords.map(bp => bp.pulse || 0).reverse();
    // Destroy old chart if it exists
    if (this.bpChart) {
      this.bpChart.destroy();
    }

    this.bpChart = new Chart(canvas, {
      type: 'line',
      data: {
        labels: labels,
        datasets: [
          {
            label: 'Systolic',
            data: systolic,
            borderColor: '#e53935',
            backgroundColor: '#e53935',
            tension: 0.3,
            yAxisID: 'y'
          },
          {
            label: 'Diastolic',
            data: diastolic,
            borderColor: '#1e88e5',
            backgroundColor: '#1e88e5',
            tension: 0.3,
            yAxisID: 'y'
          },
          {
            label: 'Pulse',
            data: pulse,
            borderColor: '#43a047',
            backgroundColor: '#43a047',
            tension: 0.3,
            yAxisID: 'y1'
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
          mode: 'index',
          intersect: false
        },
        plugins: {
          legend: {
            position: 'top'
          }
        },
        scales: {

          // Blood pressure axis
          y: {
            type: 'linear',
            position: 'left',
            title: {
              display: true,
              text: 'Blood Pressure (mmHg)'
            }
          },

          // Pulse axis
          y1: {
            type: 'linear',
            position: 'right',
            grid: {
              drawOnChartArea: false
            },
            title: {
              display: true,
              text: 'Pulse (bpm)'
            }
          }

        }
      }
    });
  }

  extractMonths() {

    const months = new Set<string>();

    this.bpRecords.forEach(bp => {

      const date = new Date(bp.recorded_at);

      const monthKey =
        date.getFullYear() + '-' + (date.getMonth() + 1);

      months.add(monthKey);

    });

    this.availableMonths = ['all', ...Array.from(months)];

    // DEFAULT = CURRENT MONTH
    const currentMonth = this.getCurrentMonthKey();

    if (this.availableMonths.includes(currentMonth)) {
      this.selectedMonth = currentMonth;
    } else {
      this.selectedMonth = 'all';
    }

    this.filterByMonth();

  }
  filterByMonth() {

    if (this.selectedMonth === 'all') {
      this.filteredBPRecords = [...this.bpRecords];
    } else {

      const [year, month] = this.selectedMonth.split('-');

      this.filteredBPRecords = this.bpRecords.filter(bp => {
        const d = new Date(bp.recorded_at);
        return d.getFullYear() === +year && d.getMonth() + 1 === +month;
      });

    }

    setTimeout(() => this.createBPChart(), 100);

  }

  getCurrentMonthKey(): string {

    const now = new Date();

    const year = now.getFullYear();
    const month = now.getMonth() + 1;

    return `${year}-${month}`;

  }

  toggleBPView() {

    this.showBPChart = !this.showBPChart;

    if (this.showBPChart) {

      // if user is on ALL → switch to current month
      if (this.selectedMonth === 'all') {

        const currentMonth = this.getCurrentMonthKey();

        if (this.availableMonths.includes(currentMonth)) {

          this.selectedMonth = currentMonth;

          this.filterByMonth();

        }

      }

      setTimeout(() => this.createBPChart(), 100);

    }

  }
  formatMonth(monthKey: string): string {

    if (monthKey === 'all') return 'All Records';

    const [year, month] = monthKey.split('-');

    const date = new Date(Number(year), Number(month) - 1);

    return date.toLocaleString('default', {
      month: 'long',
      year: 'numeric'
    });
  }

  // LOGOUT

  logout() {
    this.authService.logout();
    this.alert.success("Logged out successfully");
    this.router.navigate(['/login']);
  }
}

