import { Component } from '@angular/core';
import { AuthService } from 'src/app/core/services/auth.service';
import { AlertService } from 'src/app/core/services/alert.service';
import { DebounceService } from 'src/app/core/services/debounce.service';
import { CacheService } from 'src/app/core/services/cache.service';


type PrescriptionEvent =
  | { type: 'analyze'; id: number };

@Component({
  selector: 'app-upload-prescription',
  templateUrl: './upload-prescription.component.html',
  styleUrls: ['./upload-prescription.component.css']
})
export class UploadPrescriptionComponent {

  doctorName: string = '';
  prescriptionText: string = '';
  manualDoctorName: string = '';
  manualPrescriptionText: string = '';
  selectedFile: File | null = null;
  prescriptions: any[] = [];
  analysisMap: { [key: number]: any } = {};
  loadingId: number | null = null;
  debouncer: any;
  uploading = false;
  isPremium = false;
  isTrialActive = false;

  get canAccessAI(): boolean {
    return this.isPremium || this.isTrialActive;
  }
  constructor(
    private authService: AuthService,
    private alert: AlertService,
    private debounceService: DebounceService,
    private cache: CacheService
  ) { }

  ngOnInit() {
    this.loadPrescriptions();
    this.authService.getProfile().subscribe((res: any) => {

      const plan = this.authService.getUserPlanState(res);

      this.isPremium = plan.isPremium;
      this.isTrialActive = plan.isTrialActive;

    });

    this.debouncer = this.debounceService.createDebouncer<PrescriptionEvent>(500);

    this.debouncer.subscribe((event: PrescriptionEvent) => {

      if (event.type === 'analyze') {
        this.handleAnalyze(event.id);
      }

    });
  }

  handleAnalyze(id: number) {

    // 🔁 Toggle (hide if open)
    if (this.analysisMap[id]) {
      delete this.analysisMap[id];
      return;
    }

    const cacheKey = `prescription_upload_${id}`;

    // ✅ CACHE HIT
    const cached = this.cache.get<any>(cacheKey);
    if (cached) {
      console.log("Prescription from cache 🚀");
      this.analysisMap[id] = cached;
      return;
    }

    // 🔥 LOADING
    this.loadingId = id;

    this.authService.analyzePrescription(id).subscribe({
      next: (res: any) => {

        this.analysisMap[id] = res;

        // 🔥 STORE CACHE
        this.cache.set(cacheKey, res);

        this.loadingId = null;
      },
      error: (err) => {
        console.error(err);
        this.loadingId = null;
        this.alert.error("Analysis failed");
      }
    });
  }

  onDragOver(event: DragEvent) {
    event.preventDefault();
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    if (event.dataTransfer?.files.length) {
      this.selectedFile = event.dataTransfer.files[0];
    }
  }

  onFileSelected(event: any) {
    this.selectedFile = event.target.files[0];
  }

  loadPrescriptions() {
    this.authService.getPrescriptions().subscribe((data: any) => {
      this.prescriptions = data;
    });
  }
  saveManualPrescription() {
    if (!this.manualPrescriptionText) return;

    const data = {
      doctorName: this.manualDoctorName,
      manualText: this.manualPrescriptionText
    };

    this.authService.saveManualPrescription(data).subscribe(() => {
      this.manualDoctorName = '';
      this.manualPrescriptionText = '';
      this.loadPrescriptions();
    });
  }

  deletePrescription(id: number) {

    this.alert.confirm("Are you sure you want to DELETE Prescription?")
      .then((result: any) => {

        if (!result.isConfirmed) return;

        this.authService.deletePrescription(id).subscribe({
          next: () => {
            this.prescriptions = this.prescriptions.filter(p => p.id !== id);
            this.cache.delete(`prescription_upload_${id}`);
            this.alert.success("Prescription deleted successfully!");
          },
          error: (err) => {
            console.error('Delete failed:', err);
          }
        });

      });
  }

  submit() {
    if (!this.selectedFile || this.uploading) return;

    this.uploading = true;

    const formData = new FormData();
    formData.append('prescription', this.selectedFile);
    formData.append('doctorName', this.doctorName);
    formData.append('notes', this.prescriptionText);

    this.authService.uploadPrescription(formData).subscribe({
      next: () => {
        this.uploading = false;

        this.selectedFile = null;
        this.doctorName = '';
        this.prescriptionText = '';

        // 🔥 reset state
        this.analysisMap = {};
        this.loadingId = null;

        // 🔥 alert FIRST
        this.alert.success("Prescription uploaded successfully");

        // 🔥 reload AFTER
        setTimeout(() => {
          this.loadPrescriptions();
        }, 100);
      },
      error: () => {
        this.uploading = false;
        this.alert.error("Upload failed");
      }
    });
  }

  onAnalyzeClick(id: number) {
    this.debouncer.next({ type: 'analyze', id });
  }
}