import { Component } from '@angular/core';
import * as Tesseract from 'tesseract.js';
import { HttpClient } from '@angular/common/http';

import { AuthService } from 'src/app/core/services/auth.service';
import { AlertService } from 'src/app/core/services/alert.service';
import { environment } from 'src/environments/environment';
import { DebounceService } from 'src/app/core/services/debounce.service';
import { CacheService } from 'src/app/core/services/cache.service';

import * as pdfjsLib from 'pdfjs-dist';
(pdfjsLib as any).GlobalWorkerOptions.workerSrc =
  'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

type ReportEvent = { type: 'analyze'; id: number };


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
  debouncer: any;
  isPremium = false;
  isTrialActive = false;

  get canAccessAI(): boolean {
    return this.isPremium || this.isTrialActive;
  }

  constructor(
    private authService: AuthService,
    private alert: AlertService,
    private http: HttpClient,
    private debounceService: DebounceService,
    private cache: CacheService
  ) { }

  ngOnInit() {
    this.loadReports();

    this.debouncer = this.debounceService.createDebouncer<ReportEvent>(500);

    this.debouncer.subscribe((event: ReportEvent) => {
      if (event.type === 'analyze') {
        this.handleAnalyze(event.id);
      }
    });
    this.authService.getProfile().subscribe((res: any) => {

      const plan = this.authService.getUserPlanState(res);

      this.isPremium = plan.isPremium;
      this.isTrialActive = plan.isTrialActive;

    });
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

      this.cache.delete(`report_${id}`);
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

  async handleAnalyze(id: number) {

    // 🔁 TOGGLE (hide if already open)
    if (this.reportAnalysisMap[id]) {
      delete this.reportAnalysisMap[id];
      return;
    }

    const cacheKey = `report_${id}`;

    // ✅ CACHE HIT
    const cached = this.cache.get<any>(cacheKey);
    if (cached) {
      console.log("Report from cache 🚀");
      this.reportAnalysisMap[id] = cached;
      return;
    }

    // 🔥 LOADING
    this.reportLoadingId = id;

    try {
      const res: any = await this.http
        .get(`${environment.apiUrl}/api/auth/analyze-report/${id}?t=${Date.now()}`)
        .toPromise();

      let text = res.extractedText || '';

      text = text
        .replace(/Total Iron Binding Capacity/gi, "TIBC")
        .replace(/µg\/dl|ug\/dl/gi, "µg/dL")
        .replace(/pg\/ml/gi, "pg/mL")
        .replace(/ng\/ml/gi, "ng/mL");

      const isTableFormat =
        /:\s*\d+\.?\d*\s*[a-z%\/]+\s*\d+\.?\d*\s*-\s*\d+/i.test(text);

      let metrics;

      if (isTableFormat) {
        metrics = this.parseTableReport(text);
      } else {
        metrics = this.parseMetrics(text);
      }

      const reportType = this.detectReportType(text);

      const result = { reportType, metrics };

      // 🔥 STORE CACHE
      this.cache.set(cacheKey, result);

      this.reportAnalysisMap[id] = result;

    } catch (err) {
      console.error(err);
      this.alert.error("Report analysis failed");
    }

    this.reportLoadingId = null;
  }


  parseTableReport(text: string) {

    const metrics: any[] = [];
    const lines = text.split('\n').map(l => l.trim()).filter(l => l);

    for (let i = 0; i < lines.length; i++) {

      let nameLine = lines[i];

      if (
        nameLine.toLowerCase().includes("haemogram") ||
        nameLine.toLowerCase().includes("department") ||
        nameLine.toLowerCase().includes("investigation")
      ) {
        continue;
      }

      if (
        lines[i + 1] &&
        !lines[i + 1].toLowerCase().includes("method") &&
        lines[i + 1] !== ":" &&
        lines[i].toUpperCase() === lines[i]
      ) {
        nameLine = lines[i + 1];
      }
      if (
        nameLine.toLowerCase().includes("method") ||
        nameLine === ":" ||
        nameLine.length < 3
      ) continue;

      let colonIndex = -1;

      for (let j = 1; j <= 3; j++) {
        if (lines[i + j] === ":") {
          colonIndex = i + j;
          break;
        }
      }

      if (colonIndex !== -1 && lines[colonIndex + 1]) {

        const dataLine = lines[colonIndex + 1];

        const match = dataLine.match(
          /(\d+\.?\d*)\s*(x10³\s*[a-zA-Z\/]+|[a-zA-Z%\/]+)\s*(\d+\.?\d*\s*-\s*\d+\.?\d*)/
        );

        if (!match) continue;

        const name = this.normalizeTestName(nameLine);
        const value = parseFloat(match[1]);
        const unit = match[2].replace(/\s+/g, ' ').trim();
        const range = match[3];

        if (
          !name ||
          name.length > 50 ||
          name.toLowerCase().includes("department") ||
          name.toLowerCase().includes("investigation")
        ) continue;

        if (metrics.some(m => m.name === name)) continue;

        metrics.push({
          name,
          value,
          unit,
          range,
          status: getStatus(value, range)
        });

        i = colonIndex + 1;
      }
    }

    return metrics;
  }

  cleanLines(text: string): string[] {
    return text
      .split('\n')
      .map(l => l.trim())
      .filter(l =>
        l.length > 5 &&

        //  remove headers
        !/test name|results|units|bio|interval/i.test(l) &&

        //  remove report junk
        !/report|note|comment|page|lab|collected|processed/i.test(l) &&

        // remove paragraphs
        l.split(" ").length < 12
      );
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

  parseMetrics(text: string) {

    const metrics: any[] = [];

    const blocks = text
      .split(/\n(?=[A-Z][A-Za-z\s\(\),;-]{5,})/g);

    for (let block of blocks) {

      const lower = block.toLowerCase();

      let name = this.normalizeTestName(block);

      if (!name || name.length > 40) continue;

      // ---- VALUE ----
      let valueMatch = block.match(/(\d+\.?\d*)\s*(?=(µg\/dL|mg\/dL|ng\/mL|pg\/mL|%))/i)
        || block.match(/(µg\/dL|mg\/dL|ng\/mL|pg\/mL|%)\s*(\d+\.?\d*)/i)
        || block.match(/\n(\d+\.?\d*)\n/);

      // ---- RANGE ----
      let rangeMatch = block.match(/(\d+\.?\d*)\s*-\s*(\d+\.?\d*)/);

      // ---- UNIT ----
      let unitMatch = block.match(/(µg\/dL|mg\/dL|ng\/mL|pg\/mL|%)/i);

      if (!valueMatch || !rangeMatch || !unitMatch) continue;

      const min = parseFloat(rangeMatch[1]);
      const max = parseFloat(rangeMatch[2]);

      // find unit position
      const unitIndex = block.search(/(µg\/dL|mg\/dL|ng\/mL|pg\/mL|%)/i);

      // get substring AFTER unit (most reliable for value)
      const afterUnit = block.slice(unitIndex);

      // extract numbers AFTER unit
      let numsAfterUnit = [];

      // handle merged decimals like 24.806.20
      const mergedMatch = afterUnit.match(/(\d+\.\d{2})(\d+\.\d{2})/);

      if (mergedMatch) {
        numsAfterUnit = [
          parseFloat(mergedMatch[1]),
          parseFloat(mergedMatch[2])
        ];
      } else {
        numsAfterUnit = afterUnit.match(/\d+\.?\d*/g)?.map(n => parseFloat(n)) || [];
      }
      // remove range numbers
      let value = numsAfterUnit.find(n =>
        Math.abs(n - min) > 0.01 &&
        Math.abs(n - max) > 0.01
      );

      // fallback if still not found
      if (!value) {
        const allNums = block.match(/\d+\.?\d*/g)?.map(n => parseFloat(n)) || [];
        value = allNums[allNums.length - 1];
      }

      if (!value) continue;

      let range = `${rangeMatch[1]}-${rangeMatch[2]}`;
      let unit = unitMatch[1];

      // sanity fix (avoid picking range as value)

      if (value === min || value === max) {
        const nums = block.match(/\d+\.?\d*/g);
        if (nums && nums.length >= 3) {
          value = parseFloat(nums[nums.length - 1]);
        }
      }

      // dedupe
      if (metrics.some(m => m.name === name)) continue;

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


  normalizeTestName(name: string): string {
    name = name.replace(/\./g, " ");
    const map: any = {
      // existing
      "ferritin": "Ferritin",
      "iron": "Iron",
      "tibc": "TIBC",
      "transferrin saturation": "Transferrin Saturation",
      "vitamin b12": "Vitamin B12",
      "cyanocobalamin": "Vitamin B12",
      "folate": "Folate",

      // 🔥 ADD THESE
      "wbc": "WBC Count",
      "wbc count": "WBC Count",
      "wbccount": "WBC Count",

      "rbc": "RBC Count",
      "rbccount": "RBC Count",

      "haemoglobin": "Hemoglobin",
      "hemoglobin": "Hemoglobin",

      "haematocrit": "Hematocrit",
      "hematocrit": "Hematocrit",

      "platelet": "Platelet Count",
      "platelet count": "Platelet Count",

      "neutrophils": "Neutrophils",
      "lymphocytes": "Lymphocytes",
      "monocytes": "Monocytes",
      "eosinophils": "Eosinophils",
      "basophils": "Basophils"
    };
    const clean = name.toLowerCase();

    for (let key in map) {
      if (clean.includes(key)) return map[key];
    }

    return name
      .replace(/\(.*?\)/g, "")
      .replace(/[^a-zA-Z\s\.]/g, "")
      .trim();
  }

  onAnalyzeClick(id: number) {
    this.debouncer.next({ type: 'analyze', id });
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