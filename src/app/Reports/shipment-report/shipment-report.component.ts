import { HttpClient, HttpParams } from "@angular/common/http";
import { Component, HostListener, OnInit } from "@angular/core";
import { FormGroup, FormControl, FormBuilder } from "@angular/forms";
import { Router } from "@angular/router";
import { ApiService } from "../../services/api.service";
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

@Component({
  selector: "app-shipment-report",
  templateUrl: "./shipment-report.component.html",
  styleUrl: "./shipment-report.component.css",
})
export class ShipmentReportComponent implements OnInit {
  orderCategoryType: number | null = null;
  serviceType: number = 0;

  ngOnInit(): void {
    this.loadSellerData();
    this.filterStatuses();
    this.serviceType = Number(localStorage.getItem("serviceType"));
    if (this.serviceType === 1) {
      this.orderCategoryType = 2; // default Insta
    }
  }

  statuses: string[] = ["Open", "Done", "In Progress", "To Verify", "On Hold"];
  shipmentCheckboxes = [
    { id: "OrderID", label: "Order ID", checked: false },
    { id: 'CardID', label: 'Card ID', checked: false },
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
  searchText: string = "";
  dropdownOpen: boolean = false;
  allSelected: boolean = false;
  selectAllShipmentChecked: boolean = false;
  selectedStatuses: any[] = [];
  filteredStatuses: any[] = [];
  sellerData: any[] = [];
  selectedStatusIds: any[] = []; // Store status IDs
  selectedStatusNames: any[] = []; // Store status names
  sellerId: string = "";
  selectAllOrderChecked: boolean = false;
  pageIndex: number = 0;
  pageSize: number = 1000000;
  reportData: any[] = [];
  isCreating: boolean = false;

  reportName: string = "";
  selectedReportType: string = "";
  dateRange = new FormGroup({
    start: new FormControl(),
    end: new FormControl(),
  });

  constructor(
    private router: Router,
    private toastr: ToastrService,
    private http: HttpClient,
    private apiservice: ApiService
  ) {}

  selectedDateRange: { startDate: string; endDate: string } = {
    startDate: "",
    endDate: "",
  };

  formatDate(date: string): string {
    const parsedDate = new Date(date);
    const adjustedDate = new Date(
      parsedDate.getTime() - parsedDate.getTimezoneOffset() * 60000
    );
    return adjustedDate.toISOString().split("T")[0];
  }

  onDateRangeSelected(dateRange: { startDate: string; endDate: string }): void {
    this.selectedDateRange = {
      startDate: this.formatDate(dateRange.startDate),
      endDate: this.formatDate(dateRange.endDate),
    };
  }

  onReportTypeChange(event: Event): void {
    const inputElement = event.target as HTMLInputElement;
    this.selectedReportType = inputElement.value;
  }
  toggleDropdown() {
    this.dropdownOpen = !this.dropdownOpen;
    if (!this.dropdownOpen) {
      this.selectedStatusIds = [];
      this.selectedStatusNames = [];
      this.allSelected = false;
    }
  }

  loadSellerData(): void {
    this.http.get<any>(this.apiservice.SellerData).subscribe((response) => {
      this.sellerData = response.data;
    });
  }

  filterStatuses() {
    this.http.get<any>(this.apiservice.StatusData).subscribe((response) => {
      this.filteredStatuses = response.data.filter(
        (item: StatusData) => item.role === 2
      );
    });
  }

  toggleSelection(status: { id: string; name: string }) {
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

  toggleSelectAll(event: Event) {
    const isChecked = (event.target as HTMLInputElement).checked;
    if (isChecked) {
      this.selectedStatusIds = this.filteredStatuses.map((status) => status.id);
      this.selectedStatusNames = this.filteredStatuses.map(
        (status) => status.name
      );
    } else {
      this.selectedStatusIds = [];
      this.selectedStatusNames = [];
    }
    this.allSelected = isChecked;
  }

  @HostListener("document:click", ["$event"])
  onClick(event: MouseEvent) {
    if (!this.isClickInsideDropdown(event)) {
      this.dropdownOpen = false; // Close dropdown if clicked outside
    }
  }

  private isClickInsideDropdown(event: MouseEvent): boolean {
    const dropdownElement = document.getElementById("statusFilterDropdown");
    if (dropdownElement && dropdownElement.contains(event.target as Node)) {
      return true;
    }
    return false;
  }

  selectAllShipmentCheckboxChanged() {
    this.shipmentCheckboxes.forEach((checkbox) => {
      checkbox.checked = this.selectAllShipmentChecked;
    });
  }

  checkboxChanged() {
    this.selectAllShipmentChecked = this.shipmentCheckboxes.every(
      (checkbox) => checkbox.checked
    );
  }

  createReport(): void {
    this.isCreating = true;

    const startDate = this.selectedDateRange?.startDate || "";
    const endDate = this.selectedDateRange?.endDate || "";

    const selectedColumns = this.shipmentCheckboxes
      .filter((checkbox) => checkbox.checked)
      .map((checkbox) => checkbox.id);
    const selectedStatuses = this.selectedStatusNames;

    if (this.selectedReportType === "" || this.selectedReportType === null) {
      this.toastr.error(
        "Insufficient details for Report generation.",
        "Failure"
      );
      this.isCreating = false;
    } else {
      if (this.selectedReportType === "Table") {
        if (
          this.reportName &&
          selectedColumns.length > 0 &&
          selectedStatuses.length > 0
        ) {
          let params = new HttpParams()
            .set("sellerId", this.sellerId)
            .set("fileType", Number(this.orderCategoryType))
            .set("startDate", startDate)
            .set("endDate", endDate);

            selectedColumns.forEach((column) => {
            params = params.append('columns', column);
          });

          this.http
            .get(this.apiservice.ShipmentsFileExport, {
              params,
              responseType: 'blob',
            })
            .subscribe({
              next: (blob: Blob) => {
                const fileName = `${this.reportName}_${new Date().getTime()}.xlsx`;

                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = fileName;
                a.click();

                window.URL.revokeObjectURL(url);

                this.toastr.success(
                  'Report generated successfully.',
                  'Success',
                );
                this.isCreating = false;
              },
              error: () => {
                this.toastr.error('Failed to generate report.', 'Failure');
                this.isCreating = false;
              },
            });
        } else {
          this.toastr.error(
            "Please provide complete details for report.",
            "Failure"
          );
          this.isCreating = false;
        }
      } else {
        this.toastr.error("Bar and Pie report is not functional.", "Failure");
        this.isCreating = false;
      }
    }
  }

  downloadCSV(data: any[], columns: string[], statuses: string[]): void {
    const filteredData = data.filter((item) =>
      statuses.includes(item.shipmentStatus)
    );
    const columnLabels = columns.map((col) => {
      const checkbox = this.shipmentCheckboxes.find(
        (checkbox) => checkbox.id === col
      );
      return checkbox ? checkbox.label.replace(/\s+/g, "_") : col;
    });

    debugger;

    columnLabels.unshift("Bank");
    columns.unshift("seller");

    const csvData = filteredData.map((item) => {
      const row: { [key: string]: any } = { seller: item.company };
      columns.slice(1).forEach((col) => (row[col] = item[col]));
      return row;
    });

    const csvRows = [];
    const headers = columnLabels.join(",");
    csvRows.push(headers);

    csvData.forEach((row) => {
      const values = columns.map((col) => row[col]);
      csvRows.push(values.join(","));
    });

    const csvString = csvRows.join("\n");

    const blob = new Blob([csvString], { type: "text/csv" });

    const name = this.reportName;
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${this.reportName}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  }

  navigatetoReports() {
    this.router.navigate(["/admin/reports"]);
  }
}
