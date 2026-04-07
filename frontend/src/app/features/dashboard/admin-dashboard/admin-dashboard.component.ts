import { Component, OnInit } from '@angular/core';
import { AdminService } from 'src/app/core/services/admin.service';
import Chart from 'chart.js/auto';

@Component({
    selector: 'app-admin-dashboard',
    templateUrl: './admin-dashboard.component.html',
    styleUrls: ['./admin-dashboard.component.css']
})
export class AdminDashboardComponent implements OnInit {

    stats: any = {};
    users: any[] = [];
    prescriptions: any[] = [];
    payments: any[] = [];
    reports: any[] = [];
    bpRecords: any[] = [];
    additionalInfo: any[] = [];
    contacts: any[] = [];

    selectedUser: string = '';
    filteredUsers: any[] = [];
    filteredReports: any[] = [];
    filteredPrescriptions: any[] = [];
    filteredPayments: any[] = [];
    filteredBP: any[] = [];
    filteredAdditional: any[] = [];
    filteredContacts: any[] = [];
    loading = true;

    constructor(private adminService: AdminService) { }

    ngOnInit() {
        this.loadData();
    }


    loadData() {
        this.loading = true;

        this.adminService.getStats().subscribe((res: any) => {
            this.stats = res;
        });

        this.adminService.getUsers().subscribe((res: any) => {
            this.users = res;
            this.filteredUsers = res;
        });

        this.adminService.getPrescriptions().subscribe((res: any) => {
            this.prescriptions = res;
            this.filteredPrescriptions = res;
        });

        this.adminService.getPayments().subscribe((res: any) => {
            this.payments = res;
            this.filteredPayments = res;
            this.loading = false;
        });
        this.adminService.getReports().subscribe((res: any) => {
            this.reports = res;
            this.filteredReports = res;
        });

        this.adminService.getBPRecords().subscribe((res: any) => {
            this.bpRecords = res;
            this.filteredBP = res;
        });

        this.adminService.getAdditionalInfo().subscribe((res: any) => {
            this.additionalInfo = res;
            this.filteredAdditional = res;
        });

        this.adminService.getContacts().subscribe((res: any) => {
            this.contacts = res;
            this.filteredContacts = res;
        });
    }
    applyFilter() {
        if (!this.selectedUser) {
            this.filteredUsers = this.users;
            this.filteredReports = this.reports;
            this.filteredPrescriptions = this.prescriptions;
            this.filteredPayments = this.payments;
            this.filteredBP = this.bpRecords;
            this.filteredAdditional = this.additionalInfo;
            this.filteredContacts = this.contacts;
            return;
        }

        const search = this.selectedUser.toLowerCase();

        this.filteredUsers = this.users.filter(u => u.name.toLowerCase().includes(search));
        this.filteredReports = this.reports.filter(r => r.user_name.toLowerCase().includes(search));
        this.filteredPrescriptions = this.prescriptions.filter(p => p.user_name.toLowerCase().includes(search));
        this.filteredPayments = this.payments.filter(p => p.user_name.toLowerCase().includes(search));
        this.filteredBP = this.bpRecords.filter(b => b.user_name.toLowerCase().includes(search));
        this.filteredAdditional = this.additionalInfo.filter(a => a.user_name.toLowerCase().includes(search));
        this.filteredContacts = this.contacts.filter(c => c.name.toLowerCase().includes(search));
    }
    deleteUser(id: number) {

        const currentUser = JSON.parse(localStorage.getItem('user') || '{}');

        if (currentUser.id === id) {
            alert("You cannot delete yourself");
            return;
        }

        if (!confirm("Delete this user?")) return;

        this.adminService.deleteUser(id).subscribe(() => {
            this.loadData();
        });
    }
    logout() {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
    }
}