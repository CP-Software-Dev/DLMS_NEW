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
import { SellerService } from "../../services/seller.service";
import { RtoStateService } from "../../services/States/RTO/rto-state.service";
import { RtoUploadComponent } from "../../Dialog/rto-upload/rto-upload.component";

interface StatusData {
  role: number;
}

@Component({
  selector: "app-user-rto",
  templateUrl: "./user-rto.component.html",
  styleUrl: "./user-rto.component.css",
})
export class UserRtoComponent {
  showFiltersForm: boolean = false;
  buttonText: string = "Filters";
  buttonIcon: string = "ri-filter-fill";

  paginatedOrders: any[] = [];
  totalOrders: number = 0;
  vault: number = 0;
  redispatchOA: number = 0;
  redispatchNA: number = 0;
  destroy: number = 0;
  finalize: number = 0;
  courierData: any[] = [];
  currentFilters: any = {};

  seller: any;
  sellerId: string = "";
  courierId: string = "";
  orderIds: string = "";
  statusId: number = 0;
  selectedMethod: string = "";
  awbnumber: string = "";
  kitNumber: string = "";
  rtoFile: number = 0;

  pageIndex: number = 0;
  pageSize: number = 10;
  statusData: any[] = [];

  rtoOrders: any[] = [];
  private refreshSubscription?: Subscription;
  selectedDateRange: { startDate: string; endDate: string } = {
    startDate: "",
    endDate: "",
  };

  constructor(
    private apiservice: ApiService,
    private toastr: ToastrService,
    private dialog: MatDialog,
    private rtoStateService: RtoStateService,
    private http: HttpClient,
    private router: Router,
    private refreshservice: RefreshService,
    private sellerService: SellerService,
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
    const address1 = order.nAddress1 || "";
    const address2 = order.nAddress2 || "";
    const city = order.nCity || "";
    const state = order.nState || "";
    const pincode = order.nPincode || "";
    const contact = order.nContact || "";

    const parts = [address1, address2, city, state, pincode, contact];
    const filteredParts = parts.filter((part) => part); // Remove any empty parts

    return filteredParts.join(", ");
  }

  statusdata = [];
  isActive: string | null = "All";

  ngOnInit(): void {
    this.seller = this.sellerService.getItem("seller");
    this.fetchRtoOrders(this.pageIndex, this.pageSize);
    this.loadCourierData();
    this.loadStatus();
    const savedStatusId = this.rtoStateService.getStatusId();
    const savedPageIndex = this.rtoStateService.getPageIndex();

    if (savedStatusId !== null) {
      this.statusId = savedStatusId;
      this.applyStatusFilter(this.statusId);
    }

    if (savedPageIndex !== null) {
      this.pageIndex = savedPageIndex;
    }
    this.refreshSubscription = this.refreshservice.refreshNeeded.subscribe(
      () => {
        this.fetchRtoOrders(this.pageIndex, this.pageSize);
      }
    );
    this.applyFilters();
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

  loading: boolean = false;

  fetchRtoOrders(
    pageIndex: number,
    pageSize: number,
    filters: any = this.currentFilters
  ) {
    let params = new HttpParams()
      .set("page", (pageIndex + 1).toString())
      .set("dataCount", pageSize.toString())
      .set("sellerId", this.seller);

    this.loading = true;

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

  uploadRto(): void {
    this.dialog.open(RtoUploadComponent, {
      panelClass: "rounded-dialog",
    });
  }

  applyFilters() {
    this.currentFilters = {};

    if (this.selectedMethod) {
      this.currentFilters.method = this.selectedMethod;
    }

    if (this.courierId) {
      this.currentFilters.courierId = this.courierId;
    }

    if (this.awbnumber) {
      this.currentFilters.awbnumber = this.awbnumber;
    }
    if (this.statusId) {
      this.currentFilters.statusId = this.statusId;
    }
    if (this.kitNumber) {
      this.currentFilters.kitNumber = this.kitNumber;
    }
    if (this.selectedDateRange) {
      const { startDate, endDate } = this.selectedDateRange;
      this.currentFilters.startDate = startDate;
      this.currentFilters.endDate = endDate;
    }
    this.isSelectAllChecked = false;
    this.pageIndex = 0;
    this.fetchRtoOrders(this.pageIndex, this.pageSize, this.currentFilters);
    this.isActive = "All";
  }

  clearFilters() {
    this.dateRange.reset();
    this.awbnumber = "";
    this.courierId = "";
    this.kitNumber = "";
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
    const selectedOrderIds = this.getSelectedOrderIds();
    this.dialog.open(RtoChangeStatusComponent, {
      panelClass: "rounded-dialog",
      data: { orderIds: selectedOrderIds },
    });
  }

  getSelectedOrderIds() {
    return this.rtoOrders
      .filter((order) => order.selected)
      .map((order) => order.rtoId);
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
    return ordersArray.filter(
      (order: any) => order.selected && order.order !== "selectAll"
    ).length;
  }

  handlePageEvent(event: { pageIndex: number; pageSize: number }) {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.rtoStateService.setPageIndex(this.pageIndex);
    this.fetchRtoOrders(this.pageIndex, this.pageSize);
  }

  exportToCSV() {
    this.fetchAllOrders()
      .then((allOrders) => {
        this.downloadCSV(allOrders);
      })
      .catch((error) => {
        console.error("Error fetching orders:", error);
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
          .set("dataCount", pageSize.toString())
          .set("sellerId", this.seller);

        if (this.currentFilters.statusId !== undefined) {
          if (this.currentFilters.statusId !== null) {
            params = params.set(
              "rtoStatusId",
              this.currentFilters.statusId.toString()
            );
          }
        }

        if (this.currentFilters.courierId) {
          params = params.set("courierId", this.currentFilters.courierId);
        }

        if (this.currentFilters.awbnumber) {
          params = params.set("awb", this.currentFilters.awbnumber);
        }
        if (this.currentFilters.phone) {
          params = params.set("phone", this.currentFilters.phone);
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
  }

  navigateToImportList() {
    this.router.navigate(["user/rto/files"]);
  }

  ProcessRtoData(): void {
    let params = new HttpParams().set("rtofileid", this.rtoFile);
    this.http.post(this.apiservice.ProcessRtoData, {}, { params }).subscribe(
      (res: any) => {
        if (res.status) {
          this.toastr.success("Changes made Successfully.", "Success");
          this.refreshservice.triggerRefresh();
        } else {
          this.toastr.error(
            "Failed to Process Orders. Please try again.",
            "Failure"
          );
        }
      },
      (error) => {
        this.toastr.error(error.message, "Failure");
      }
    );
  }

  navigateToRtoImportList() {
    this.router.navigate(["user/rto/list"]);
  }
}
