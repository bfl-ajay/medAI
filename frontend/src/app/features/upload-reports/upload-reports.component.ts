import { Component } from '@angular/core';
import * as Tesseract from 'tesseract.js';

import { AuthService } from 'src/app/core/services/auth.service';
import { AlertService } from 'src/app/core/services/alert.service';

import * as pdfjsLib from 'pdfjs-dist';
(pdfjsLib as any).GlobalWorkerOptions.workerSrc =
  'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

@Component({
  selector: 'app-upload-reports',
  templateUrl: './upload-reports.component.html',
  styleUrls: ['./upload-reports.component.css']
})
export class UploadReportsComponent {

  selectedFile: File | null = null;
  reports: any[] = [];
  uploading = false;
  uploadSuccess = false;
  reportAnalysisMap: { [key: number]: any } = {};
  reportLoadingId: number | null = null;
  constructor(private authService: AuthService, private alert: AlertService) { }

  ngOnInit() {
    this.loadReports();
  }

  onFileSelected(event: any) {
    this.selectedFile = event.target.files[0];
  }

  upload() {
    if (!this.selectedFile) return;

    this.uploading = true;
    this.uploadSuccess = false;

    const formData = new FormData();
    formData.append('report', this.selectedFile);

    this.authService.uploadReport(formData).subscribe({
      next: () => {
        this.uploading = false;
        this.uploadSuccess = true;
        this.selectedFile = null;
        this.loadReports();
      },
      error: () => {
        this.uploading = false;
        this.alert.error("Upload failed");
      }
    });
  }
  deleteReport(id: number) {
    this.authService.deleteReport(id).subscribe(() => {
      this.loadReports();
    });
  }

  loadReports() {
    this.authService.getReports().subscribe((data: any) => {
      this.reports = data;
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

  async analyzeReport(id: number) {

    if (this.reportAnalysisMap[id]) {
      delete this.reportAnalysisMap[id];
      return;
    }

    const report = this.reports.find(r => r.id === id);
    if (!report) return;

    const fileUrl = 'http://localhost:5000/uploads/reports/' + report.file_path;

    this.reportLoadingId = id;

    try {

      let fullText = '';

      // ===== PDF FILE =====
      if (report.file_name.toLowerCase().endsWith('.pdf')) {

        const pdf = await pdfjsLib.getDocument(fileUrl).promise;

        for (let i = 1; i <= pdf.numPages; i++) {

          const page = await pdf.getPage(i);

          const viewport = page.getViewport({ scale: 2 });

          const canvas = document.createElement('canvas');
          const context = canvas.getContext('2d');

          if (!context) continue;

          canvas.width = viewport.width;
          canvas.height = viewport.height;

          await page.render({
            canvasContext: context,
            canvas: canvas,
            viewport: viewport
          }).promise;

          const imageData = canvas.toDataURL('image/png');

          if (!imageData || typeof imageData !== 'string') continue;

          const result = await Tesseract.recognize(
            imageData,
            'eng',
            { logger: m => console.log(m) }
          );

          fullText += result.data.text + "\n";
        }

      }

      // ===== IMAGE FILE =====
      else {

        const result = await Tesseract.recognize(
          fileUrl,
          'eng',
          { logger: m => console.log(m) }
        );

        fullText = result.data.text;

      }
      fullText = fullText
        .replace(/Total Iron Binding Capacity/gi, "TIBC")
        .replace(/µg\/dl/gi, "µg/dL")
        .replace(/ug\/dl/gi, "µg/dL")
        .replace(/pg\/ml/gi, "pg/mL")
        .replace(/ng\/ml/gi, "ng/mL");
      console.log("FULL OCR TEXT:", fullText);

      const metrics = this.extractMedicalMetrics(fullText);
      const reportType = this.detectReportType(fullText);

      this.reportAnalysisMap[id] = {
        reportType,
        metrics
      };

    } catch (err) {

      console.error("OCR ERROR:", err);
      this.alert.error("Report analysis failed");

    }

    this.reportLoadingId = null;

  }

  extractMedicalMetrics(text: string) {

    const metrics: any[] = [];

    const regex =
      /([A-Za-z \(\)\/;,-]+?)\s+(\d+\.?\d*)\s*(ng\/mL|pg\/mL|µg\/dL|ug\/dL|mg\/dL|g\/dL|%|mmol\/L|pg\/dL)\s*(\d+\.?\d*)\s*-\s*(\d+\.?\d*)/gi;

    let match;

    while ((match = regex.exec(text)) !== null) {

      let name = match[1]
        .replace(/\(.*?\)/g, "")
        .replace(/serum/gi, "")
        .replace(/;/g, "")
        .trim();

      let value = match[2];
      let unit = match[3];
      let range = match[4] + " - " + match[5];

      // Fix OCR unit mistakes
      if (unit === "g/dL") unit = "µg/dL";
      if (unit === "ug/dL") unit = "µg/dL";
      if (unit === "pg/dL") unit = "µg/dL";

      // ignore junk names
      if (name.length < 3) continue;
      if (name.toLowerCase().includes("note")) continue;
      if (name.toLowerCase().includes("comment")) continue;

      metrics.push({
        name,
        value,
        unit,
        range,
        status: getStatus(parseFloat(value), range)
      });

    }

    return metrics;
  }

  detectReportType(text: string) {

    const lower = text.toLowerCase();

    if (
      lower.includes('hemoglobin') ||
      lower.includes('glucose') ||
      lower.includes('cholesterol')
    ) {
      return 'Blood Test';
    }

    if (
      lower.includes('ketones') ||
      lower.includes('urine') ||
      lower.includes('protein')
    ) {
      return 'Urine Test';
    }

    return 'General Medical Report';

  }

}

function getStatus(value: number, range: string) {

  if (!range || range === "-") return "normal";

  const parts = range.split("-");
  const min = parseFloat(parts[0]);
  const max = parseFloat(parts[1]);

  if (value < min) return "low";
  if (value > max) return "high";

  return "normal";
}