import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
    providedIn: 'root'
})
export class AuthService {

    private apiUrl = environment.apiUrl;

    private userSubject = new BehaviorSubject<any>(null);
    user$ = this.userSubject.asObservable();

    constructor(private http: HttpClient) {

        const storedUser = localStorage.getItem('user');

        if (storedUser && storedUser !== 'undefined') {
            try {
                this.userSubject.next(JSON.parse(storedUser));
            } catch {
                localStorage.removeItem('user');
            }
        }

    }

    // ================= AUTH =================

    register(data: any) {
        return this.http.post(`${this.apiUrl}/api/auth/register`, data);
    }

    login(data: any) {
        return this.http.post(`${this.apiUrl}/api/auth/login`, data);
    }

    saveToken(token: string) {
        localStorage.setItem('token', token);
    }

    getToken() {
        return localStorage.getItem('token');
    }

    logout() {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        this.userSubject.next(null);
    }

    isLoggedIn() {
        return !!localStorage.getItem('token');
    }

    getAuthHeaders() {
        const token = this.getToken();

        return {
            headers: new HttpHeaders({
                Authorization: `Bearer ${token}`
            })
        };
    }

    update2FA(enabled: boolean) {
        return this.http.post(
            `${this.apiUrl}/api/auth/update-2fa`,
            { enabled },
            this.getAuthHeaders()
        );
    }

    changePassword(data: any) {
        return this.http.post(
            `${this.apiUrl}/api/auth/change-password`,
            data,
            this.getAuthHeaders()
        );
    }

    getUser() {
        return JSON.parse(localStorage.getItem('user') || '{}');
    }

    forgotPassword(email: string) {
        return this.http.post(`${this.apiUrl}/api/auth/forgot-password`, { email });
    }

    sendOTP(email: string) {
        return this.http.post(`${this.apiUrl}/api/auth/send-otp`, { email });
    }

    verifyOTP(email: string, otp: string) {
        return this.http.post(`${this.apiUrl}/api/auth/verify-forgot-otp`, {
            email,
            otp
        });
    }

    resetPassword(email: string, newPassword: string) {
        return this.http.post(
            `${this.apiUrl}/api/auth/reset-password`,
            {
                email: email,
                newPassword: newPassword
            }
        );
    }

    // ================= PROFILE =================

    getProfile() {
        return this.http.get(`${this.apiUrl}/api/auth/profile`, this.getAuthHeaders());
    }

    updateProfile(profile: any) {
        return this.http.put(
            `${this.apiUrl}/api/auth/profile`,
            profile,
            this.getAuthHeaders()
        );
    }

    setUser(user: any) {
        localStorage.setItem('user', JSON.stringify(user));
        this.userSubject.next(user);
    }

    getCurrentUser() {
        return this.userSubject.value;
    }
    updateRecoveryEmail(email: string) {
        return this.http.post(`${environment.apiUrl}/api/auth/update-recovery-email`, {
            recoveryEmail: email
        });
    }

    deactivateAccount() {
        return this.http.post(
            `${this.apiUrl}/api/auth/deactivate-account`,
            {}
        );
    }

    // ================= AI =================

    getAIPlan(profile: any) {
        return this.http.post(
            `${this.apiUrl}/api/auth/ai-plan`,
            profile,
            this.getAuthHeaders()
        );
    }

    // ================= MEDICINE =================

    setMedicine(data: any) {
        return this.http.post(
            `${this.apiUrl}/api/auth/medicine`,
            data,
            this.getAuthHeaders()
        );
    }

    // ================= REMINDERS =================

    getReminders() {
        return this.http.get(
            `${this.apiUrl}/api/auth/reminders`,
            this.getAuthHeaders()
        );
    }

    addReminder(data: any) {
        return this.http.post(
            `${this.apiUrl}/api/auth/reminders`,
            data,
            this.getAuthHeaders()
        );
    }

    updateReminder(id: number, data: any) {
        return this.http.put(
            `${this.apiUrl}/api/auth/reminders/${id}`,
            data,
            this.getAuthHeaders()
        );
    }

    deleteReminder(id: number) {
        return this.http.delete(
            `${this.apiUrl}/api/auth/reminders/${id}`,
            this.getAuthHeaders()
        );
    }

    // ================= REPORTS =================

    uploadReport(formData: FormData) {
        return this.http.post(
            `${this.apiUrl}/api/auth/upload-report`,
            formData,
            this.getAuthHeaders()
        );
    }

    getReports() {
        return this.http.get(
            `${this.apiUrl}/api/auth/reports`,
            this.getAuthHeaders()
        );
    }

    deleteReport(id: number) {
        return this.http.delete(
            `${this.apiUrl}/api/auth/report/${id}`,
            this.getAuthHeaders()
        );
    }

    analyzeReport(id: number) {
        return this.http.get(
            `${this.apiUrl}/api/auth/analyze-report/${id}?t=${Date.now()}`,
            this.getAuthHeaders()
        );
    }

    // ================= PRESCRIPTIONS =================

    uploadPrescription(formData: FormData) {
        return this.http.post(
            `${this.apiUrl}/api/auth/upload-prescription`,
            formData,
            this.getAuthHeaders()
        );
    }

    getPrescriptions() {
        return this.http.get(
            `${this.apiUrl}/api/auth/prescriptions`,
            this.getAuthHeaders()
        );
    }

    deletePrescription(id: number) {
        return this.http.delete(
            `${this.apiUrl}/api/auth/prescriptions/${id}`,
            this.getAuthHeaders()
        );
    }

    saveManualPrescription(data: any) {
        return this.http.post(
            `${this.apiUrl}/api/auth/save-manual-prescription`,
            data,
            this.getAuthHeaders()
        );
    }

    analyzePrescription(id: number) {
        return this.http.get(
            `${this.apiUrl}/api/auth/analyze-prescription/${id}`,
            this.getAuthHeaders()
        );
    }

    // ================= ADDITIONAL INFO =================

    saveAdditionalInfo(data: any) {
        return this.http.post(
            `${this.apiUrl}/api/auth/save-add-info`,
            data,
            this.getAuthHeaders()
        );
    }

    getAdditionalInfo() {
        return this.http.get(
            `${this.apiUrl}/api/auth/get-add-info`,
            this.getAuthHeaders()
        );
    }

    getLatestAdditionalInfo() {
        return this.http.get(
            `${this.apiUrl}/api/auth/get-latest-add-info`,
            this.getAuthHeaders()
        );
    }

    // ================= BLOOD PRESSURE =================

    addBloodPressure(data: any) {
        return this.http.post(
            `${this.apiUrl}/api/auth/blood_pressure_records`,
            data,
            this.getAuthHeaders()
        );
    }

    getBloodPressure() {
        return this.http.get(
            `${this.apiUrl}/api/auth/blood_pressure_records`,
            this.getAuthHeaders()
        );
    }

    // ================= CONTACT =================

    sendContactMessage(data: any) {
        return this.http.post(
            `${this.apiUrl}/api/auth/contact`,
            data
        );
    }

    uploadPhoto(formData: FormData) {
        return this.http.post(
            `${this.apiUrl}/api/auth/upload-photo`,
            formData,
            this.getAuthHeaders()
        );
    }

    sendEmailOTP() {
        return this.http.post(
            `${this.apiUrl}/api/auth/send-email-otp`,
            {},
            this.getAuthHeaders()
        );
    }

    verifyEmailOTP(otp: string) {
        return this.http.post(
            `${this.apiUrl}/api/auth/verify-email-otp`,
            { otp },
            this.getAuthHeaders()
        );
    }

    sendPhoneOTP(phone: string) {
        return this.http.post(
            `${this.apiUrl}/api/auth/send-phone-otp`,
            { phone },
            this.getAuthHeaders()
        );
    }

    verifyPhoneOTP(otp: string) {
        return this.http.post(
            `${this.apiUrl}/api/auth/verify-phone-otp`,
            { otp },
            this.getAuthHeaders()
        );
    }


}
