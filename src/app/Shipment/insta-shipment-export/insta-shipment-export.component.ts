import { HttpClient, HttpParams } from "@angular/common/http";
import { Component, OnInit } from "@angular/core";
import { FormGroup, FormControl, FormBuilder } from "@angular/forms";
import { Router } from "@angular/router";
import { ApiService } from "../../services/api.service";

@Component({
  selector: 'app-insta-shipment-export',
  templateUrl: './insta-shipment-export.component.html',
  styleUrl: './insta-shipment-export.component.css'
})
export class InstaShipmentExportComponent implements OnInit {
  showFiltersForm: boolean = false;
  buttonText: string = "Filters";
  buttonIcon: string = "ri-filter-fill";
  sellerData: any[] = [];
  importList: any[] = [];
  exportFileData: any[] = [];
  exportInstaFileData: any[] = [];
  sellerId: string = "";
  status: string = "";
  FileId: string = "";
  currentFilters: any = {};
  totalUsers: number = 0;

  pageIndex: number = 0;
  pageSize: number = 10;
  selectedDateRange: { startDate: string; endDate: string } = {
    startDate: "",
    endDate: "",
  };

  constructor(
    private apiservice: ApiService,
    private http: HttpClient,
    private router: Router,
    private fb: FormBuilder
  ) {
    //  const startDate = '01-01-2024'
    // const currentDate = new Date();
    // this.selectedDateRange = {
    //   startDate: this.formatDate(startDate),
    //   endDate: this.formatDate(currentDate.toISOString())
    // };

    const endDate = new Date(); // Today
    const startDate = new Date(); // Clone today
    startDate.setDate(startDate.getDate() - 29); // Last 30 days

    this.selectedDateRange = {
      startDate: this.formatDate(startDate.toISOString()),
      endDate: this.formatDate(endDate.toISOString()),
    };
  }

  formatDate(date: string): string {
    return new Date(date).toISOString().split("T")[0];
  }

  onDateRangeSelected(dateRange: { startDate: string; endDate: string }): void {
    this.selectedDateRange = {
      startDate: this.formatDate(dateRange.startDate),
      endDate: this.formatDate(dateRange.endDate),
    };
  }

  ngOnInit(): void {
    //this.fetchImportList(this.pageIndex, this.pageSize);
    this.loadSellerData();
    this.applyFilters();
  }

  loadSellerData(): void {
    this.http.get<any>(this.apiservice.SellerData).subscribe((response) => {
      this.sellerData = response.data;
    });
  }

  fetchImportList(
    pageIndex: number,
    pageSize: number,
    filters: any = this.currentFilters
  ) {
    let params = new HttpParams()
      .set("page", (pageIndex + 1).toString())
      .set("dataCount", pageSize.toString());

    if (filters.sellerId) {
      params = params.set("sellerId", filters.sellerId);
    }
    if (filters.FileId) {
      params = params.set("fileId", filters.FileId);
    }
    if (filters.status) {
      params = params.set("status", filters.status);
    }
    let startDate = filters.startDate;
    let endDate = filters.endDate;

    if (!startDate || !endDate) {
      const currentDate = new Date();
      const adjustedDate = new Date(
        currentDate.getTime() - currentDate.getTimezoneOffset() * 60000
      )
        .toISOString()
        .split("T")[0];
      startDate = startDate || adjustedDate;
      endDate = endDate || adjustedDate;
    }

    params = params.set("startDate", startDate).set("endDate", endDate);

    this.http.get(this.apiservice.ImportList, { params }).subscribe(
      (res: any) => {
        if (res.status) {
          this.importList = res.data.importFiles;
          this.totalUsers = res.data.dataCount;
        }
      },
      (error) => {}
    );
  }

  applyFilters() {
    this.currentFilters = {};

    if (this.sellerId) {
      this.currentFilters.sellerId = this.sellerId;
    }
    if (this.FileId) {
      this.currentFilters.FileId = this.FileId;
    }
    if (this.status) {
      this.currentFilters.status = this.status;
    }

    if (this.selectedDateRange) {
      const { startDate, endDate } = this.selectedDateRange;
      this.currentFilters.startDate = startDate;
      this.currentFilters.endDate = endDate;
    }

    this.fetchImportList(this.pageIndex, this.pageSize, this.currentFilters);
  }

  clearFilters() {
    this.dateRange.reset({
      start: new Date(),
      end: new Date(),
    });
    this.sellerId = "";
    this.status = "";
    this.FileId = "";

    // const start = this.dateRange.get("start")?.value;
    // const end = this.dateRange.get("end")?.value;
    // if (start && end) {
    //   const adjustedStart = new Date(
    //     start.getTime() - start.getTimezoneOffset() * 60000
    //   );
    //   const adjustedEnd = new Date(
    //     end.getTime() - end.getTimezoneOffset() * 60000
    //   );

    //   this.currentFilters.startDate = adjustedStart.toISOString().split("T")[0];
    //   this.currentFilters.endDate = adjustedEnd.toISOString().split("T")[0];
    // }

    const currentDate = new Date();
    const startDate = new Date(); // Clone today
    startDate.setDate(startDate.getDate() - 29);
    this.selectedDateRange = {
      startDate: this.formatDate(startDate.toISOString()),
      endDate: this.formatDate(currentDate.toISOString()),
    };
    this.currentFilters.startDate = this.selectedDateRange.startDate;
    this.currentFilters.endDate = this.selectedDateRange.endDate;

    this.fetchImportList(this.pageIndex, this.pageSize, this.currentFilters);
    this.toggleFiltersForm();
  }

  toggleFiltersForm() {
    this.showFiltersForm = !this.showFiltersForm;
    if (this.showFiltersForm) {
      this.buttonText = "Close";
      this.buttonIcon = "ri-close-fill";
    } else {
      this.buttonText = "Filters";
      this.buttonIcon = "ri-filter-fill";
    }
  }

  dateRange = new FormGroup({
    start: new FormControl(),
    end: new FormControl(),
  });

  isActive: string = "All";

  makeActive(label: string) {
    this.isActive = label;
  }

  navigateToOrders() {
    this.router.navigate(["admin/orders"]);
  }

  handlePageEvent(event: { pageIndex: number; pageSize: number }) {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.fetchImportList(this.pageIndex, this.pageSize);
  }

  exportFile(fileID: string): void {
    const params = new HttpParams().set("fileID", fileID);
    this.http.get(this.apiservice.ExportFile, { params }).subscribe(
      (res: any) => {
        if (res.status) {
          this.exportFileData = res.data;
          this.downloadCSV(this.exportFileData, fileID);
        } else {
          console.error("Failed to fetch data");
        }
      },
      (error) => {
        console.error("HTTP Error:", error);
      }
    );
  }

  downloadCSV(data: any[], fileID: string) {
    const csvData = this.convertToCSV(data);
    const date = new Date().toISOString().slice(0, 10).replace(/-/g, "");
    const fileName = `File_${fileID}_${date}.csv`;
    const blob = new Blob([csvData], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }

  convertToCSV(data: any[]) {
    const headers = Object.keys(data[0]);
    const csvRows = [];
    csvRows.push(headers.join(","));
    for (const row of data) {
      const values = headers.map((header) => row[header]);
      csvRows.push(values.join(","));
    }
    return csvRows.join("\n");
  }
}
