import { Component } from '@angular/core';
import { AuthService } from '../../core/services/auth.service';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { DiseaseService } from 'src/app/core/services/disease.service';
import { Chart } from 'chart.js/auto';
import { AlertService } from 'src/app/core/services/alert.service';
import { ActivatedRoute } from '@angular/router';
import { environment
    
 } from 'src/environments/environment';
@Component({
    selector: 'app-profile',
    templateUrl: './profile.component.html',
    styleUrls: ['./profile.component.css']
})
export class ProfileComponent {

    user: any;
    reports: any[] = [];
    prescriptions: any[] = [];
    knownDiseases: string[] = [];
    diseaseInput = '';
    filteredDiseases: any[] = [];
    pastRecords: any[] = [];
    profile: any;
    showBPChart = false
    bpRecords: any[] = [];
    bpChart: any;
    selectedMonth: string = 'all';
    availableMonths: string[] = [];
    filteredBPRecords: any[] = [];
    activeTab: 'personal' | 'security' = 'personal';
    emailOtp: string = '';
    phoneNumber: string = '';
    phoneOtp: string = '';
    emailOtpSent = false;
    phoneOtpSent = false;
    twoFactorEnabled = false;
    showPasswordForm = false;
    currentPassword = '';
    newPassword = '';
    confirmPassword = '';
    recoveryEmail: string = '';
    latestInfo: any;

    get profileCompletion(): number {
        return this.getProfileCompletion();
    }
    constructor(private http: HttpClient, private router: Router, private route: ActivatedRoute, private authService: AuthService, private diseaseService: DiseaseService, private alert: AlertService) { }

    ngOnInit() {
        this.route.queryParams.subscribe(params => {

            if (params['tab'] === 'security') {
                this.activeTab = 'security';
            } else {
                this.activeTab = 'personal';
            }

        });
        this.authService.getProfile().subscribe((data: any) => {
            this.profile = data;
            this.user = data;

            this.twoFactorEnabled = data.two_factor_enabled === 1;

            if (data.knownDiseases) {
                this.knownDiseases = [...data.knownDiseases];
            }
            this.recoveryEmail = data.recovery_email || '';


        });

        this.authService.getReports().subscribe((data: any) => {

            this.reports = data;
        });

        this.authService.getPrescriptions().subscribe((data: any) => {

            this.prescriptions = data;
        });
        this.authService.getAdditionalInfo().subscribe((data: any) => {
            this.pastRecords = data;
        });
        this.authService.getBloodPressure().subscribe((data: any) => {

            this.bpRecords = data;

            this.extractMonths();

        });


    }

    saveProfile() {

        const updateData = {
            name: this.user?.name,
            email: this.user?.email,
            height: this.user?.height,
            weight: this.user?.weight,
            bloodGroup: this.user?.bloodGroup,
            knownDiseases: this.knownDiseases
        };



        this.authService.updateProfile(updateData).subscribe(() => {

            this.authService.getProfile().subscribe((freshProfile: any) => {

                this.authService.setUser(freshProfile);

                this.router.navigate(['/dashboard']);

            });

        });

    }

    discardPersonalChanges() {

        this.authService.getProfile().subscribe((data: any) => {

            this.user = JSON.parse(JSON.stringify(data));

            // reset diseases also
            this.knownDiseases = data.knownDiseases ? [...data.knownDiseases] : [];

            // reset input helpers
            this.diseaseInput = '';
            this.filteredDiseases = [];

        });

    }
    openFile(filePath: string, type: 'reports' | 'prescriptions') {

        if (!filePath) return;

        const url = `${environment.apiUrl}/uploads/${type}/${filePath}`;
        window.open(url, '_blank');

    }
    onDiseaseInput() {

        if (!this.diseaseInput.trim()) {
            this.filteredDiseases = [];
            return;
        }

        this.diseaseService.searchDiseases(this.diseaseInput)
            .subscribe((response: any) => {

                const results = response[3] || [];

                this.filteredDiseases = results
                    .map((item: any) => ({
                        code: item[0],
                        name: item[1]
                    }))
                    .filter((item: any) =>
                        !item.name.toLowerCase().includes('poisoning') &&
                        !item.name.toLowerCase().includes('underdosing')
                    );
            });

    }
    selectDisease(disease: any) {

        const formatted = `${disease.code} - ${disease.name}`;

        if (!this.knownDiseases.includes(formatted)) {
            this.knownDiseases.push(formatted);
        }

        this.diseaseInput = "";
        this.filteredDiseases = [];

    }
    addDisease(event: KeyboardEvent) {

        event.preventDefault();

        const value = this.diseaseInput.trim();

        if (!value) return;

        if (!this.knownDiseases.includes(value)) {
            this.knownDiseases.push(value);
        }

        this.diseaseInput = "";
        this.filteredDiseases = [];

    }
    removeDisease(index: number) {
        this.knownDiseases.splice(index, 1);
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

                return (
                    d.getFullYear() === Number(year) &&
                    d.getMonth() + 1 === Number(month)
                );

            });

        }

        if (this.showBPChart) {
            setTimeout(() => this.createBPChart(), 100);
        }

    }

    getCurrentMonthKey(): string {

        const now = new Date();

        const year = now.getFullYear();
        const month = now.getMonth() + 1;

        return `${year}-${month}`;

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

    uploadPhoto(event: any) {

        const file = event.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('photo', file);

        this.authService.uploadPhoto(formData).subscribe({
            next: (res: any) => {

                // update UI
                this.user.photo = res.photoUrl;

                this.authService.setUser(this.user);

            },
            error: (err) => {
                console.error(err);
            }
        });
    }
    sendEmailOTP() {

        this.authService.sendEmailOTP().subscribe({
            next: () => {
                this.emailOtpSent = true;
                this.alert.success("OTP sent to your email");
            },
            error: (err) => {
                console.error(err);
            }
        });

    }

    verifyEmailOTP() {

        if (this.user?.two_factor_enabled) {
            this.alert.success("Email already verified");
            return;
        }

        this.authService.verifyEmailOTP(this.emailOtp).subscribe({

            next: () => {

                this.alert.success("Email verified");

                this.user.two_factor_enabled = 1;

                this.emailOtpSent = false;

            },

            error: () => {
                this.alert.error("Invalid OTP");
            }

        });

    }

    sendPhoneOTP() {

        if (!this.phoneNumber) {
            this.alert.warning("Enter phone number first");
            return;
        }

        this.authService.sendPhoneOTP(this.phoneNumber).subscribe({
            next: () => {
                this.phoneOtpSent = true;
                this.alert.success("OTP sent to phone");
            },
            error: (err) => {
                console.error(err);
            }
        });

    }
    verifyPhoneOTP() {

        this.authService.verifyPhoneOTP(this.phoneOtp).subscribe({

            next: () => {
                this.alert.success("Phone verified successfully!");
            },
            error: (err) => {
                this.alert.error("Invalid OTP");
                console.error(err);
            }
        });

    }
    saveSecuritySettings() {

        this.authService.update2FA(this.twoFactorEnabled).subscribe({


            next: () => {

                this.alert.success("Security settings saved");

                // reload profile from backend
                this.authService.getProfile().subscribe((data: any) => {

                    this.user = data;

                    // update toggle from database value
                    this.twoFactorEnabled = data.two_factor_enabled === 1;

                });


                this.authService.getProfile().subscribe((freshProfile: any) => {

                    this.authService.setUser(freshProfile);

                    this.router.navigate(['/dashboard']);

                })

            },

            error: (err) => {
                console.error(err);
            },

        });
    }

    cancelSecurityChanges() {

        this.authService.getProfile().subscribe((data: any) => {

            this.user = JSON.parse(JSON.stringify(data));

            this.twoFactorEnabled = data.two_factor_enabled === 1;
            this.recoveryEmail = data.recovery_email || '';

            // reset temp fields
            this.emailOtp = '';
            this.phoneOtp = '';
            this.phoneNumber = '';

            this.emailOtpSent = false;
            this.phoneOtpSent = false;

            this.showPasswordForm = false;
            this.currentPassword = '';
            this.newPassword = '';
            this.confirmPassword = '';

            this.activeTab = 'personal';

        });

    }

    changePassword() {

        if (this.newPassword !== this.confirmPassword) {
            this.alert.warning("Passwords do not match");
            return;
        }

        this.authService.changePassword({
            currentPassword: this.currentPassword,
            newPassword: this.newPassword
        }).subscribe({

            next: () => {

                this.alert.success("Password updated successfully");

                this.showPasswordForm = false;
                this.currentPassword = '';
                this.newPassword = '';
                this.confirmPassword = '';

            },

            error: (err) => {

                this.alert.error(err.error.message);

            }

        });

    }
    saveRecoveryEmail() {

        if (!this.recoveryEmail) {
            this.alert.warning("Please enter a recovery email");
            return;
        }

        this.authService.updateRecoveryEmail(this.recoveryEmail).subscribe({

            next: () => {
                this.alert.success("Recovery email saved successfully");
            },

            error: (err) => {
                console.error(err);
                this.alert.error("Failed to save recovery email");
            }

        });

    }

    deactivateAccount() {

        this.alert.confirm(
            "Are you sure you want to deactivate your account? This action will disable your account."
        ).then((result) => {

            if (!result.isConfirmed) return;   // 🔴 this is the fix

            this.authService.deactivateAccount().subscribe({

                next: () => {

                    this.alert.success("Account deactivated");

                    localStorage.removeItem("token");

                    this.authService.logout();

                    this.router.navigate(['/login']);

                },

                error: (err) => {
                    console.error(err);
                    this.alert.error("Failed to deactivate account");
                }

            });

        });

    }

    getProfileCompletion(): number {

        let total = 4;
        let completed = 0;

        if (this.user?.email) completed++;
        if (this.user?.name) completed++;
        if (this.knownDiseases?.length) completed++;
        if (this.user?.height && this.user?.weight) completed++;

        return Math.round((completed / total) * 100);

    }

}