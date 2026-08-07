import { HttpClient, HttpParams } from "@angular/common/http";
import { Component, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, FormControl } from "@angular/forms";
import { MatDialog } from "@angular/material/dialog";
import { Router } from "@angular/router";
import { ToastrService } from "ngx-toastr";
import { ApiService } from "../../services/api.service";
import { RefreshService } from "../../services/refresh.service";
import { Subscription } from "rxjs";
import { ActivatedRoute } from "@angular/router";
import { RtoEditComponent } from "../../Dialog/rto-edit/rto-edit.component";
import { RtoChangeStatusComponent } from "../../Dialog/rto-change-status/rto-change-status.component";
import { RtoStateService } from "../../services/States/RTO/rto-state.service";
import { RtoUploadComponent } from "../../Dialog/rto-upload/rto-upload.component";

interface StatusData {
  role: number;
}

@Component({
  selector: "app-rto",
  templateUrl: "./rto.component.html",
  styleUrl: "./rto.component.css",
})
export class RtoComponent implements OnInit {
  showFiltersForm: boolean = false;
  buttonText: string = "Filters";
  buttonIcon: string = "ri-filter-fill";
  paginatedOrders: any[] = [];
  sellerData: any[] = [];
  courierData: any[] = [];
  currentFilters: any = {};
  statusData: any[] = [];
  isExporting: boolean = false;
  rtoOrders: any[] = [];
  totalOrders: number = 0;
  vault: number = 0;
  redispatchOA: number = 0;
  redispatchNA: number = 0;
  destroy: number = 0;
  finalize: number = 0;
  rtoFile: number = 0;
  pageIndex: number = 0;
  pageSize: number = 10;
  statusId: number = 0;
  sellerId: string = "";
  courierId: string = "";
  //orderIds: string = '';
  orderIds: any;
  selectedMethod: string = "";
  awbnumber: string = "";
  kitnumber: string = "";
  phone: string = "";
  selectedDateRange: { startDate: string; endDate: string } = {
    startDate: "",
    endDate: "",
  };
  private refreshSubscription?: Subscription;

  constructor(
    private apiservice: ApiService,
    private toastr: ToastrService,
    private dialog: MatDialog,
    private fb: FormBuilder,
    private http: HttpClient,
    private router: Router,
    private refreshservice: RefreshService,
    private rtoStateService: RtoStateService,
    private route: ActivatedRoute
  ) {
    const endDate = new Date(); // Today
    const startDate = new Date(); // Clone today
    startDate.setDate(startDate.getDate() - 29); // Last 30 days

    this.selectedDateRange = {
      startDate: this.formatDate(startDate.toISOString()),
      endDate: this.formatDate(endDate.toISOString()),
    };
  }

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

  getAddressTooltip(order: any): string {
    const customer = order.customerName ? `${order.customerName}:` : "";
    const address1 = order.nAddress1 || "";
    const address2 = order.nAddress2 || "";
    const city = order.nCity || "";
    const state = order.nState || "";
    const pincode = order.nPincode || "";
    const contact = order.nContact || "";

    const parts = [address1, address2, city, state, pincode, contact];
    const filteredParts = parts.filter((part) => part); // Remove any empty parts

    return `${customer}\n${filteredParts.join(", ")}`;
  }

  statusdata = [];
  isActive: string | null = "All";

  ngOnInit(): void {
    const savedStatusId = this.rtoStateService.getStatusId();
    const savedPageIndex = this.rtoStateService.getPageIndex();

    if (savedStatusId !== null) {
      this.statusId = savedStatusId;
      this.applyStatusFilter(this.statusId);
    }

    if (savedPageIndex !== null) {
      this.pageIndex = savedPageIndex;
    }
    this.applyFilters();
    this.fetchRtoOrders(this.pageIndex, this.pageSize);
    this.loadSellerData();
    this.loadCourierData();
    this.loadStatus();
    this.refreshSubscription = this.refreshservice.refreshNeeded.subscribe(
      () => {
        this.fetchRtoOrders(this.pageIndex, this.pageSize);
      }
    );
  }

  getCountByStatusId(statusId: number): number {
    switch (statusId) {
      case 1:
        return this.vault;
      case 2:
        return this.redispatchOA;
      case 3:
        return this.redispatchNA;
      case 4:
        return this.destroy;
      case 5:
        return this.finalize;
      default:
        return 0;
    }
  }

  setActiveAll(): void {
    this.isActive = "All";
  }

  setActive(statusId: string): void {
    this.isActive = statusId;
  }

  rtoEditDialog(order: any): void {
    this.dialog.open(RtoEditComponent, {
      data: {
        rto: parseInt(order.rtoId, 10),
        name: order.customerName,
        courier: order.courier,
        address1: order.nAddress1,
        address2: order.nAddress2,
        city: order.nCity,
        state: order.nState,
        pincode: order.nPincode,
        contact: order.nContact,
      },
    });
  }

  loadSellerData(): void {
    this.http.get<any>(this.apiservice.SellerData).subscribe((response) => {
      this.sellerData = response.data;
    });
  }

  loadStatus(): void {
    this.http.get<any>(this.apiservice.RtoStatus).subscribe((response) => {
      this.statusData = response.data;
    });
  }

  loadCourierData(): void {
    this.http.get<any>(this.apiservice.CourierData).subscribe((response) => {
      this.courierData = response.data;
    });
  }

  uploadRto(): void {
    this.dialog.open(RtoUploadComponent, {
      panelClass: "rounded-dialog",
    });
  }

  loading: boolean = false;

  fetchRtoOrders(
    pageIndex: number,
    pageSize: number,
    filters: any = this.currentFilters
  ) {
    this.isSelectAllChecked = false;
    this.loading = true;

    let params = new HttpParams()
      .set("page", (pageIndex + 1).toString())
      .set("dataCount", pageSize.toString());
    if (filters.sellerId) {
      params = params.set("sellerId", filters.sellerId);
    }
    if (filters.awbnumber) {
      params = params.set("oldAwb", filters.awbnumber);
    }
    if (filters.kitNumber) {
      params = params.set("kitnumber", filters.kitNumber);
    }
    if (filters.courierId) {
      params = params.set("courierId", filters.courierId);
    }
    if (filters.statusId !== undefined) {
      if (filters.statusId !== null) {
        params = params.set("rtoStatusId", filters.statusId.toString());
      }
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

    this.http.get(this.apiservice.RtoOrders, { params }).subscribe(
      (res: any) => {
        if (res.status) {
          this.rtoOrders = res.data.rtoOrders;
          this.totalOrders = res.data.total;
          this.vault = res.data.vault;
          this.redispatchNA = res.data.reDispatchedNA;
          this.redispatchOA = res.data.reDispatchedOA;
          this.destroy = res.data.destroyed;
          this.finalize = res.data.finalized;
        }
        this.loading = false;
      },
      (error) => {
        this.loading = false;
      }
    );
  }

  isStatusId1(): boolean {
    return this.isActive === "3";
  }

  applyFilters() {
    this.currentFilters = {};

    if (this.selectedMethod) {
      this.currentFilters.method = this.selectedMethod;
    }

    if (this.sellerId) {
      this.currentFilters.sellerId = this.sellerId;
    }

    if (this.courierId) {
      this.currentFilters.courierId = this.courierId;
    }

    if (this.awbnumber) {
      this.currentFilters.awbnumber = this.awbnumber;
    }

    if (this.kitnumber) {
      this.currentFilters.kitNumber = this.kitnumber;
    }
    if (this.statusId) {
      this.currentFilters.statusId = this.statusId;
    }
    if (this.selectedDateRange) {
      const { startDate, endDate } = this.selectedDateRange;
      this.currentFilters.startDate = startDate;
      this.currentFilters.endDate = endDate;
    }

    this.pageIndex = 0;
    this.fetchRtoOrders(this.pageIndex, this.pageSize, this.currentFilters);
    if (this.statusId == null || this.statusId == 0) {
      this.isActive = "All";
    }
  }

  clearFilters() {
    this.dateRange.reset({
      start: new Date(),
      end: new Date(),
    });
    this.sellerId = "";
    this.awbnumber = "";
    this.courierId = "";
    this.kitnumber = "";
    this.currentFilters = {};
     const currentDate = new Date();
    const startDate = new Date(); // Clone today
    startDate.setDate(startDate.getDate() - 29);
    this.selectedDateRange = {
      startDate: this.formatDate(startDate.toISOString()),
      endDate: this.formatDate(currentDate.toISOString()),
    };
    this.currentFilters.startDate = this.selectedDateRange.startDate;
    this.currentFilters.endDate = this.selectedDateRange.endDate;
    this.fetchRtoOrders(this.pageIndex, this.pageSize);
    this.toggleFiltersForm();
  }

  openStatusdialog(): void {
    debugger;
    const selectedOrderIds = this.getSelectedOrderIds();
    this.dialog.open(RtoChangeStatusComponent, {
      panelClass: "rounded-dialog",
      data: { orderIds: selectedOrderIds },
    });
  }

  getSelectedOrderIds() {
    if (this.isActive == "5") {
      return this.rtoOrders
        .filter((order) => order.selected && order.isProcessed != "1")
        .map((order) => order.rtoId);
    } else {
      return this.rtoOrders
        .filter((order) => order.selected)
        .map((order) => order.rtoId);
    }
  }

  toggleAllCheckboxes(event: any) {
    const isChecked = event.target.checked;
    this.isSelectAllChecked = isChecked;

    if (this.rtoOrders) {
      for (const key in this.rtoOrders) {
        if (Object.prototype.hasOwnProperty.call(this.rtoOrders, key)) {
          this.rtoOrders[key].selected = isChecked;
        }
      }
    }
  }

  updateSelectAllCheckbox() {
    const ordersArray = Object.values(this.rtoOrders);
    this.isSelectAllChecked = ordersArray.every((order: any) => order.selected);
  }

  getSelectedCount(): number {
    const ordersArray = Object.values(this.rtoOrders);
    return ordersArray.filter((order: any) => {
      if (this.isActive == "1") {
        return order.selected && order.order !== "selectAll";
      } else if (this.isActive == "5") {
        return (
          order.selected &&
          order.order !== "selectAll" &&
          order.isProcessed != "1"
        );
      }
      return false;
    }).length;
  }

  toggleFiltersForm() {
    this.showFiltersForm = !this.showFiltersForm;
    this.buttonText = this.showFiltersForm ? "Close" : "Filters";
    this.buttonIcon = this.showFiltersForm ? "ri-close-fill" : "ri-filter-fill";
  }

  dateRange = new FormGroup({
    start: new FormControl(),
    end: new FormControl(),
  });

  makeActive(label: string) {
    this.isActive = label;
  }

  isSelectAllChecked: boolean = false;

  handlePageEvent(event: { pageIndex: number; pageSize: number }) {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.rtoStateService.setPageIndex(this.pageIndex);
    this.fetchRtoOrders(this.pageIndex, this.pageSize);
  }

  exportToCSV() {
    this.isExporting = true;
    this.fetchAllOrders()
      .then((allOrders) => {
        this.downloadCSV(allOrders);
        this.isExporting = false;
      })
      .catch((error) => {
        console.error("Error fetching orders:", error);
        this.isExporting = false
      });
  }

  fetchAllOrders(): Promise<any[]> {
    const pageSize = 100;
    let pageIndex = 0;
    const allOrders: any[] = [];

    const fetchPage = (pageIndex: number): Promise<any> => {
      return new Promise((resolve, reject) => {
        let params = new HttpParams()
          .set("page", (pageIndex + 1).toString())
          .set("dataCount", pageSize.toString());

        if (this.currentFilters.orderIds) {
          params = params.set(
            "orderId",
            this.currentFilters.orderIds.join(",")
          );
        }
        if (this.currentFilters.sellerId) {
          params = params.set("sellerId", this.currentFilters.sellerId);
        }

        if (this.currentFilters.statusId !== undefined) {
          if (this.currentFilters.statusId !== null) {
            params = params.set(
              "rtoStatusId",
              this.currentFilters.statusId.toString()
            );
          }
        }
        let startDate = this.currentFilters.startDate;
        let endDate = this.currentFilters.endDate;

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
        if (this.currentFilters.awbnumber) {
          params = params.set("oldAwb", this.currentFilters.awbnumber);
        }
        this.http.get(this.apiservice.RtoOrders, { params }).subscribe(
          (res: any) => {
            if (res.status) {
              resolve(res.data.rtoOrders);
            } else {
              reject("Failed to fetch data");
            }
          },
          (error) => {
            console.error("API Error:", error);
            reject(error);
          }
        );
      });
    };

    const fetchAll = async () => {
      let moreData = true;
      while (moreData) {
        const orders = await fetchPage(pageIndex);
        if (orders.length > 0) {
          allOrders.push(...orders);
          pageIndex++;
        } else {
          moreData = false;
        }
      }
      return allOrders;
    };

    return fetchAll();
  }

  downloadCSV(data: any[]) {
    const csvData = this.convertToCSV(data);
    const randomNumber = Math.floor(Math.random() * 90000) + 10000; // Generate a 5-digit random number
    const fileName = `RTO_17185${randomNumber}.csv`;
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

  isActiveDropdownButton: boolean = false;

  applyStatusFilter(statusId: number | null) {
    if (statusId === null) {
      this.isActive = "All";
    } else {
      this.isActive = statusId.toString();
    }

    if (statusId !== null) {
      this.currentFilters.statusId = statusId;
      this.rtoStateService.setStatusId(Number(statusId));
    } else {
      delete this.currentFilters.statusId;
      this.rtoStateService.setStatusId(null);
    }
    this.pageIndex = 0;
    this.rtoStateService.setPageIndex(this.pageIndex);
    this.fetchRtoOrders(this.pageIndex, this.pageSize, this.currentFilters);

    this.isSelectAllChecked = false;
  }

  navigateToRtoImportList() {
    this.router.navigate(["admin/rto/list"]);
  }

  navigateTostatus() {
    this.router.navigate(["admin/shipment/status"]);
  }

  navigateToShipmentDetail(orderID: string): void {
    this.router.navigate(["/admin/shipment/details", orderID]);
  }

  ProcessRtoData(): void {
    const selectedOrderDetails = this.getSelectedOrderIds();
    const requestBody = {
      rtoIds: selectedOrderDetails,
    };
    this.http.post(this.apiservice.ProcessRtoData, requestBody).subscribe(
      (res: any) => {
        if (res.status) {
          this.toastr.info(res.data);
          this.refreshservice.triggerRefresh();
        } else {
          this.toastr.error(res.error, "Failure");
        }
      },
      (error) => {
        this.toastr.error(error, "Failure");
      }
    );
  }
}
