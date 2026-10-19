import { Component, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { HttpClient, HttpParams } from "@angular/common/http";
import { ApiService } from "../../services/api.service";
import { SellerService } from "../../services/seller.service";
import { ToastrService } from "ngx-toastr";

interface StatusData {
  id: number;
  name: string;
  shortName: string;
  description: string;
  createdAt: string;
  role: number;
  isActive: number;
}

interface ColumnOption {
  id: string;
  label: string;
  checked: boolean;
}

interface SavedReport {
  name: string;
  type: string;
  bank: string;
  createdAt: string;
}

@Component({
  selector: "app-shipment-report",
  templateUrl: "./shipment-report.component.html",
  styleUrl: "./shipment-report.component.css",
})
export class ShipmentReportComponent implements OnInit {
  // Role is detected from the route: /admin/... or /user/...
  isAdmin: boolean = false;

  // Form state
  reportName: string = "";
  sellerId: any = "";
  fromDate: string = "";
  toDate: string = "";
  orderCategoryType: number | null = 2; // 2 = Perso, 3 = Insta
  selectedReportType: string = "Table";
  isCreating: boolean = false;
  serviceType: number = 0;

  shipmentCheckboxes: ColumnOption[] = [];
  selectAllShipmentChecked: boolean = false;
  allSelected: boolean = false;

  // Data
  sellerData: any[] = [];
  filteredStatuses: any[] = [];
  selectedStatusIds: any[] = [];
  selectedStatusNames: any[] = [];

  // Saved reports (UI only, not connected to an API yet)
  savedReports: SavedReport[] = [
    { name: "Shri Ram Jun–July", type: "Shipments", bank: "Shri Ram", createdAt: "2026-10-04" },
    { name: "JIO Insta weekly", type: "Shipments", bank: "JIO", createdAt: "2026-10-02" },
    { name: "RTO ageing — all banks", type: "RTO", bank: "all banks", createdAt: "2026-09-26" },
  ];
  savedPage: number = 1;
  savedPageSize: number = 25;

  constructor(
    private router: Router,
    private toastr: ToastrService,
    private http: HttpClient,
    private apiservice: ApiService,
    private sellerService: SellerService
  ) {}

  ngOnInit(): void {
    this.isAdmin = this.router.url.startsWith("/admin");
    this.serviceType = Number(localStorage.getItem("serviceType"));

    this.shipmentCheckboxes = this.buildColumns();
    this.checkboxChanged();
    this.orderCategoryType = this.getDefaultCategory();
    this.setDefaultDates();
    this.filterStatuses();

    if (this.isAdmin) {
      this.loadSellerData();
    } else {
      this.sellerId = this.sellerService.getItem("seller");
    }
  }

  // Order category radio is always shown for admin, and only for serviceType 1 for user
  get showOrderCategory(): boolean {
    return this.isAdmin || this.serviceType === 1;
  }

  private getDefaultCategory(): number {
    if (!this.isAdmin && this.serviceType === 3) {
      return 3;
    }
    return 2;
  }

  private buildColumns(): ColumnOption[] {
    return [
      { id: "OrderID", label: "Order ID", checked: false },
      { id: "CardID", label: "Card ID", checked: false },
      { id: "KitNumber", label: "Kit Number", checked: false },
      { id: "Customer", label: "Customer Name", checked: false },
      { id: "Contact", label: "Phone No.", checked: false },
      { id: "Date", label: "Order Date", checked: false },
      { id: "Courier", label: "Courier", checked: false },
      { id: "Awb", label: "AWB Number", checked: false },
      { id: "ShipmentStatus", label: "Shipment Status", checked: false },
      { id: "StatusUpdateAt", label: "Status Updated At", checked: false },
      { id: "DeliveredDate", label: "Delivery Date", checked: false },
      { id: "State", label: "State", checked: false },
      { id: "Pincode", label: "Pincode", checked: false },
    ];
  }

  // Dates
  private setDefaultDates(): void {
    const today = new Date();
    const past = new Date();
    past.setDate(today.getDate() - 30);
    this.toDate = this.toYMD(today);
    this.fromDate = this.toYMD(past);
  }

  private toYMD(d: Date): string {
    const local = new Date(d.getTime() - d.getTimezoneOffset() * 60000);
    return local.toISOString().split("T")[0];
  }

  // API loads
  loadSellerData(): void {
    this.http.get<any>(this.apiservice.SellerData).subscribe((response) => {
      this.sellerData = response.data;
    });
  }

  // Shipment statuses use role 2
  filterStatuses(): void {
    this.http.get<any>(this.apiservice.StatusData).subscribe((response) => {
      this.filteredStatuses = response.data.filter(
        (item: StatusData) => item.role === 2
      );
    });
  }

  // Columns: Select All
  selectAllShipmentCheckboxChanged(): void {
    this.shipmentCheckboxes.forEach((checkbox) => {
      checkbox.checked = this.selectAllShipmentChecked;
    });
  }

  checkboxChanged(): void {
    this.selectAllShipmentChecked = this.shipmentCheckboxes.every(
      (checkbox) => checkbox.checked
    );
  }

  // Statuses: Select All
  private selectAllStatuses(): void {
    this.selectedStatusIds = this.filteredStatuses.map((s) => s.id);
    this.selectedStatusNames = this.filteredStatuses.map((s) => s.name);
    this.allSelected = true;
  }

  toggleSelectAll(event: Event): void {
    const isChecked = (event.target as HTMLInputElement).checked;
    if (isChecked) {
      this.selectAllStatuses();
    } else {
      this.selectedStatusIds = [];
      this.selectedStatusNames = [];
      this.allSelected = false;
    }
  }

  toggleSelection(status: { id: any; name: string }): void {
    const index = this.selectedStatusIds.indexOf(status.id);
    if (index === -1) {
      this.selectedStatusIds.push(status.id);
      this.selectedStatusNames.push(status.name);
    } else {
      this.selectedStatusIds.splice(index, 1);
      this.selectedStatusNames.splice(index, 1);
    }
    this.allSelected =
      this.selectedStatusIds.length === this.filteredStatuses.length;
  }

  // Create report
  createReport(): void {
    if (this.selectedReportType !== "Table") {
      this.toastr.error("Bar and Pie report is not functional.", "Failure");
      return;
    }

    const selectedColumns = this.shipmentCheckboxes
      .filter((c) => c.checked)
      .map((c) => c.id);

    if (
      !this.reportName ||
      !this.sellerId ||
      !this.fromDate ||
      !this.toDate ||
      selectedColumns.length === 0 ||
      this.selectedStatusNames.length === 0
    ) {
      this.toastr.error("Please provide complete details for report.", "Failure");
      return;
    }

    this.isCreating = true;

    let params = new HttpParams()
      .set("sellerId", this.sellerId)
      .set("fileType", Number(this.orderCategoryType))
      .set("startDate", this.fromDate)
      .set("endDate", this.toDate);

    selectedColumns.forEach((column) => {
      params = params.append("columns", column);
    });

    this.http
      .get(this.apiservice.ShipmentsFileExport, { params, responseType: "blob" })
      .subscribe({
        next: (blob: Blob) => {
          const fileName = `${this.reportName}_${new Date().getTime()}.xlsx`;
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = fileName;
          a.click();
          window.URL.revokeObjectURL(url);

          this.toastr.success("Report generated successfully.", "Success");
          this.isCreating = false;
        },
        error: () => {
          this.toastr.error("Failed to generate report.", "Failure");
          this.isCreating = false;
        },
      });
  }

  // Saved reports: run and pagination (static for now)
  runSavedReport(report: SavedReport): void {
    this.toastr.info(`Running "${report.name}"…`, "Report");
  }

  get totalPages(): number {
    return Math.max(1, Math.ceil(this.savedReports.length / this.savedPageSize));
  }

  get pageNumbers(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }

  get pagedReports(): SavedReport[] {
    const start = (this.savedPage - 1) * this.savedPageSize;
    return this.savedReports.slice(start, start + this.savedPageSize);
  }

  get rangeStart(): number {
    return this.savedReports.length === 0
      ? 0
      : (this.savedPage - 1) * this.savedPageSize + 1;
  }

  get rangeEnd(): number {
    return Math.min(this.savedPage * this.savedPageSize, this.savedReports.length);
  }

  navigatetoReports(): void {
    this.router.navigate([this.isAdmin ? "/admin/reports" : "/user/reports"]);
  }
}