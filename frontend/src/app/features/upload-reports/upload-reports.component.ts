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

          // const viewport = page.getViewport({ scale: 2 });

          // const canvas = document.createElement('canvas');
          // const context = canvas.getContext('2d');

          // if (!context) continue;

          // canvas.width = viewport.width;
          // canvas.height = viewport.height;

          // await page.render({
          //   canvasContext: context,
          //   // canvas: canvas,
          //   viewport: viewport
          // }).promise;

          // const imageData = canvas.toDataURL('image/png');

          // if (!imageData || typeof imageData !== 'string') continue;

          const textContent = await page.getTextContent();

          const pageText = textContent.items
            .map((item: any) => item.str)
            .join('\n');

          fullText += pageText + "\n";
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

      // fetch description for each metric
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

    const tokens = text
      .replace(/\s{2,}/g, '\n')
      .split('\n')
      .map(t => t.trim())
      .filter(t => t.length > 0);

    for (let i = 0; i < tokens.length; i++) {

      let name = tokens[i];
      const sectionHeaders = [
        "chemical test",
        "microscopic test",
        "physical examination",
        "lipid profile",
        "haemogram",
        "electrolytes",
        "biochemistry",
        "department",
        "investigation",
        "self pay"
      ];

      if (sectionHeaders.some(h => name.toLowerCase().includes(h))) continue;
      const unitTokens = [
        "ng/ml", "pg/ml", "µg/dl", "mg/dl", "%", "fl", "pg",
        "cells/ul", "x10³cells/ul", "million/ul", "g/dl",
        "mmol/l", "mmol/l.", "mmol/l:",
        "/ul", "mm/hr", "u/l", "iu/ml"
      ];

      if (unitTokens.includes(name.toLowerCase())) continue;
      // detect pattern: Test : value unit range
      const inlineMatch = name.match(
        /^([A-Za-z\s\(\)\/\-\.,]+)\s*:\s*([\d\.]+)\s*([A-Za-z%\/³]+)\s*([\d\.]+\s*-\s*[\d\.]+)/
      );

      if (inlineMatch) {
        const metricName = inlineMatch[1].trim();
        const value = parseFloat(inlineMatch[2]);
        const unit = inlineMatch[3];
        const range = inlineMatch[4];

        metrics.push({
          name,
          value,
          unit,
          range,
          status: getStatus(value, range),
          wikiLoaded: false,
          wikiLink: ""
        });

        continue;
      }
      const invalidNames = [
        "clear",
        "pale yellow",
        "absent",
        "present",
        "normal"
      ];

      if (invalidNames.includes(name.toLowerCase())) continue;

      if (!/[a-zA-Z]{3,}/.test(name)) continue;

      if (name.toLowerCase().includes("method")) continue;

      let value: number | null = null;
      let unit = "";
      let range = "";

      for (let j = i + 1; j < i + 6 && j < tokens.length; j++) {

        const t = tokens[j];
        // skip method lines
        if (t.toLowerCase().includes("method")) continue;
        if (t.toLowerCase().includes("clia")) continue;
        if (/^[a-zA-Z\/%]+$/.test(name) && tokens[i + 1]?.match(/^\d/)) continue;
        // detect value + unit on same line
        const valueUnitMatch = t.match(/^(\d+(\.\d+)?)\s*([a-zA-Z%\/³]+)/);
        if (value === null && valueUnitMatch) {
          value = parseFloat(valueUnitMatch[1]);
          unit = valueUnitMatch[3];
          continue;
        }

        // detect range first
        if (range === "" && /^\d+(\.\d+)?\s*-\s*\d+(\.\d+)?/.test(t)) {
          range = t;
          continue;
        }

        // detect unit
        // detect unit but avoid next test name
        if (
          unit === "" &&
          /[a-zA-Z%\/³]/.test(t) &&
          !/^\d/.test(t) &&
          !/[A-Za-z]{3,}\s+[A-Za-z]{3,}/.test(t) // prevents "Gamma GT"
        ) {
          unit = t;
          continue;
        }
        // detect numeric value
        if (/^\d+\.?\d*$/.test(t)) {
          value = parseFloat(t);
        }

      }

      // must have value + range
      if (value === null || range === "") continue;

      // name should not be long sentence
      if (name.split(" ").length > 10) continue;

      // ignore brackets like (CLIA) or (Microscopy)
      if (/^\(.*\)$/.test(name)) continue;

      // ignore notes/comments words
      const ignore = [
        "note",
        "comment",
        "management",
        "deficiency",
        "disease",
        "pregnancy",
        "toxicity"
      ];
      const sectionWords = [
        "note",
        "notes",
        "comments",
        "decreased levels",
        "increased levels",
        "management",
        "deficiency",
        "disease",
        "pregnancy",
        "toxicity"
      ];
      const unitLike = [
        "ng/ml",
        "pg/ml",
        "µg/dl",
        "mg/dl",
        "%",
        "fl",
        "pg",
        "cells/ul"
      ];

      if (unitLike.includes(name.toLowerCase())) continue;
      if (sectionWords.some(w => name.toLowerCase().includes(w))) continue;

      if (ignore.some(w => name.toLowerCase().includes(w))) continue;
      const normalizedName = name
        .toLowerCase()
        .replace(/serum|plasma/g, "")
        .replace(/[^a-z]/g, "")
        .trim();

      if (
        metrics.some(m =>
          m.name
            .toLowerCase()
            .replace(/serum|plasma/g, "")
            .replace(/[^a-z]/g, "")
            .trim() === normalizedName
        )
      ) {
        continue;
      }
      if (
        name.toLowerCase().includes("studies") ||
        name.toLowerCase().includes("picture") ||
        name.toLowerCase().includes("examination")
      ) continue;

      // valid lab test name pattern
      name = name
        .replace(/\(.*?\)/g, "")
        .replace(/,\s*serum/i, "")
        .trim();
      // reject very long names (comments)
      if (name.length > 40) continue;
      metrics.push({
        name,
        value,
        unit,
        range,
        status: getStatus(value, range)
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


  simplifyMetricName(name: string): string {

    return name
      .toLowerCase()

      // remove brackets
      .replace(/\(.*?\)/g, "")

      // remove common lab words
      .replace(/\b(serum|plasma|level|levels|test|total|count)\b/g, "")

      // remove symbols
      .replace(/[^a-z\s]/g, "")

      // remove extra spaces
      .replace(/\s+/g, " ")

      .trim();
  }
  

}



function getStatus(value: number, range: string) {

  if (!range || range === "-") return "normal";

  const parts = range.split("-");
  const min = parseFloat(parts[0]);
  const max = parseFloat(parts[1]);

  const margin = (max - min) * 0.05;

  if (value < min) return "low";

  if (value > max) return "high";

  if (value < min + margin || value > max - margin)
    return "borderline";

  return "normal";
}