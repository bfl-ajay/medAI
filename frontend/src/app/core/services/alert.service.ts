import { Injectable } from '@angular/core';
import Swal from 'sweetalert2';

@Injectable({
  providedIn: 'root'
})
export class AlertService {

  success(title: string, text?: string) {
    Swal.fire({
      icon: 'success',
      title,
      text,
      confirmButtonColor: '#458FF6'
    });
  }

  error(title: string, text?: string) {
    Swal.fire({
      icon: 'error',
      title,
      text,
      confirmButtonColor: '#458FF6'
    });
  }

  warning(title: string, text?: string) {
    Swal.fire({
      icon: 'warning',
      title,
      text,
      confirmButtonColor: '#458FF6'
    });
  }

  confirm(title: string, text?: string) {
    return Swal.fire({
      icon: 'question',
      title,
      text,
      showCancelButton: true,
      confirmButtonColor: '#458FF6',
      cancelButtonColor: '#aaa',
      confirmButtonText: 'Yes',
      cancelButtonText: 'Cancel'
    });
  }

  loading(title = "Please wait...") {
    Swal.fire({
      title,
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });
  }

  close() {
    Swal.close();
  }

}