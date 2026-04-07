import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';

@Injectable({ providedIn: 'root' })
export class AdminService {

    private api = `${environment.apiUrl}/api/admin`;

    constructor(private http: HttpClient) { }

    getStats() {
        return this.http.get(`${this.api}/stats`);
    }

    getUsers() {
        return this.http.get(`${this.api}/users`);
    }

    getPrescriptions() {
        return this.http.get(`${this.api}/prescriptions`);
    }

    getPayments() {
        return this.http.get(`${this.api}/payments`);
    }
    getReports() {
        return this.http.get(`${this.api}/reports`);
    }

    getBPRecords() {
        return this.http.get(`${this.api}/bp-records`);
    }

    getAdditionalInfo() {
        return this.http.get(`${this.api}/additional-info`);
    }

    getContacts() {
        return this.http.get(`${this.api}/contacts`);
    }
    deleteUser(id: number) {
        return this.http.delete(`${this.api}/user/${id}`);
    }
}