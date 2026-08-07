import { Component, OnDestroy, OnInit } from "@angular/core";
import { FormBuilder, FormControl, FormGroup } from "@angular/forms";
import { MatDialog } from "@angular/material/dialog";
import { HttpClient, HttpParams } from "@angular/common/http";
import { ToastrService } from "ngx-toastr";
import { ActivatedRoute, Router } from "@angular/router";
import { ApiService } from "../services/api.service";
import { RefreshService } from "../services/refresh.service";
import { Subscription } from "rxjs";
import { ShipmentStateService } from "../services/States/Shipments/shipment-state.service";
import { InvoiceDataService } from "../services/invoice-data.service";
import * as XLSX from "xlsx";
import { InvoiceDataFiltersService } from "../services/invoice-data-filters.service";

@Component({
  selector: "app-billings",
  templateUrl: "./billings.component.html",
  styleUrl: "./billings.component.css",
})
export class BillingsComponent {
  showFiltersForm: boolean = true;
  buttonText: string = "Filters";
  buttonIcon: string = "ri-filter-fill";
  orders: any[] = [];
  paginatedOrders: any[] = [];
  statusData: any[] = [];
  sellerData: any[] = [];
  courierData: any[] = [];
  currentFilters: any = {};
  totalOrders: number = 0;
  booked: number = 0;
  inTransit: number = 0;
  pendingPickup: number = 0;
  outForDelivery: number = 0;
  cancelled: number = 0;
  statusId: number = 0;
  pageIndex: number = 0;
  pageSize: number = 50;
  Delivered: number = 0;
  sellerId: string = "";
  courierId: string = "";
  orderIds: string = "";
  selectedMethod: string = "";
  awbnumber: string = "";
  kitnumber: string = "";
  phone: string = "";
  private refreshSubscription?: Subscription;
  selectedDateRange: { startDate: string; endDate: string } = {
    startDate: "",
    endDate: "",
  };

  activeTab: string = "perso";
  serviceType: number = 0;

  constructor(
    private apiservice: ApiService,
    private toastr: ToastrService,
    private dialog: MatDialog,
    private fb: FormBuilder,
    private http: HttpClient,
    private router: Router,
    private shipmentStateService: ShipmentStateService,
    private refreshservice: RefreshService,
    private invoiceService: InvoiceDataService,
    private invoiceFilters: InvoiceDataFiltersService,
    private dailog: MatDialog,
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

  // ngOnInit(): void {
  //   this.isSelectAllChecked = false;
  //   this.route.queryParams.subscribe((params) => {
  //     this.initializeFiltersFromParams(params);
  //   });
  //   const savedPageIndex = this.shipmentStateService.getPageIndex();

  //   if (savedPageIndex !== null) {
  //     this.pageIndex = savedPageIndex;
  //   }

  //   this.applyFilters();
  //   this.fetchOrders(this.pageIndex, this.pageSize);
  //   this.loadSellerData();
  //   this.loadCourierData();
  //   this.refreshSubscription = this.refreshservice.refreshNeeded.subscribe(
  //     () => {
  //       this.fetchOrders(this.pageIndex, this.pageSize);
  //     }
  //   );
  // }

  ngOnInit(): void {
    this.serviceType = Number(localStorage.getItem("serviceType"));

    const savedTab = localStorage.getItem("activeInvoiceTab");
    if (savedTab) {
      this.activeTab = savedTab;
    } else {
      // fallback logic (your existing logic)
      if (this.serviceType === 2) {
        this.activeTab = "insta";
        localStorage.setItem("activeInvoiceTab",this.activeTab);
      }

      if (this.serviceType === 1 || this.serviceType === 3) {
        this.activeTab = "perso";
        localStorage.setItem("activeInvoiceTab",this.activeTab);
      }
    }

    this.isSelectAllChecked = false;

    // ✅ FIRST: Check if status filter exists
    const statusFilter = this.invoiceFilters.getStatusData();

    if (statusFilter) {
      this.sellerId = statusFilter.institutionName || "";
      this.courierId = statusFilter.courierName || "";

      this.selectedDateRange = {
        startDate: this.formatDate(statusFilter.invoicestartDate),
        endDate: this.formatDate(statusFilter.invoiceendDate),
      };

      // Apply and fetch
      this.applyFilters();

      // Optional: clear after use
      this.invoiceService.clearStatusData();
    } else {
      // ✅ Normal flow
      this.route.queryParams.subscribe((params) => {
        this.initializeFiltersFromParams(params);
      });

      const savedPageIndex = this.shipmentStateService.getPageIndex();
      if (savedPageIndex !== null) {
        this.pageIndex = savedPageIndex;
      }

      this.applyFilters();
    }

    this.fetchOrders(this.pageIndex, this.pageSize);
    this.loadSellerData();
    this.loadCourierData();

    this.refreshSubscription = this.refreshservice.refreshNeeded.subscribe(
      () => {
        this.fetchOrders(this.pageIndex, this.pageSize);
      }
    );
  }

  setTab(tab: string) {
    this.activeTab = tab;
    localStorage.setItem("activeInvoiceTab", tab);
    this.fetchOrders(this.pageIndex, this.pageSize);
  }

  ngOnDestroy(): void {
    this.shipmentStateService.setPageIndex(this.pageIndex);
    if (this.refreshSubscription) {
      this.refreshSubscription.unsubscribe();
    }
  }

  initializeFiltersFromParams(params: any): void {
    if (!params || Object.keys(params).length === 0) {
      return;
    }

    if (params["institutionId"]) {
      this.sellerId = params["institutionId"];
    }
    if (params["startDate"] && params["endDate"]) {
      this.selectedDateRange = {
        startDate: this.formatDate(new Date(params["startDate"]).toISOString()),
        endDate: this.formatDate(new Date(params["endDate"]).toISOString()),
      };
    }
    this.applyFilters();
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

  isActive: string | null = "All";

  loadSellerData(): void {
    this.http.get<any>(this.apiservice.SellerData).subscribe((response) => {
      this.sellerData = response.data;
    });
  }

  loadCourierData(): void {
    this.http.get<any>(this.apiservice.CourierData).subscribe((response) => {
      this.courierData = response.data;
    });
  }

  //-----Status Data

  //-----Fetching Shipments Data

  loading: boolean = false;

  fetchOrders(
    pageIndex: number,
    pageSize: number,
    filters: any = this.currentFilters
  ) {

     this.orders = [];
     this.totalOrders = 0;
     this.paginatedOrders = [];
    let params = new HttpParams()
      .set("page", (pageIndex + 1).toString())
      .set("dataCount", pageSize.toString());
    this.loading = true;

    this.isSelectAllChecked = false;

    if (filters.sellerId && filters.sellerId !== "0") {
      params = params.set("institutionId", filters.sellerId);
    }

    if (filters.courierId) {
      params = params.set("courierId", filters.courierId);
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

    const invoicestartDate = this.currentFilters.startDate;
    const invoiceendDate = this.currentFilters.endDate;
    const institutionName = filters.sellerId;
    const courierName = filters.courierId;
    this.invoiceFilters.setStatusData({
      institutionName,
      courierName,
      invoicestartDate,
      invoiceendDate,
    });



    if (this.activeTab == "perso") {
      this.http.get(this.apiservice.Invoice, { params }).subscribe(
        (res: any) => {
          if (res.status) {
            this.orders = res.data.dispatchesAndRtos;
            this.totalOrders = res.data.total;
            this.paginatedOrders = this.orders;
          }
          this.loading = false;
        },
        (error) => {
          this.loading = false;
        }
      );
    }
    else if (this.activeTab == "insta") {
      this.http.get(this.apiservice.InstaInvoice, { params }).subscribe(
        (res: any) => {
          if (res.status) {
            this.orders = res.data.dispatchesAndRtos;
            this.totalOrders = res.data.total;
            this.paginatedOrders = this.orders;
          }
          this.loading = false;
        },
        (error) => {
          this.loading = false;
        }
      );
    }
  }

  applyFilters() {
    this.currentFilters = {};

    if (this.sellerId) {
      this.currentFilters.sellerId = this.sellerId;
    }

    if (this.courierId) {
      this.currentFilters.courierId = this.courierId;
    }

    if (this.selectedDateRange) {
      const { startDate, endDate } = this.selectedDateRange;
      this.currentFilters.startDate = startDate;
      this.currentFilters.endDate = endDate;
    }

    this.pageIndex = 0;
    this.fetchOrders(this.pageIndex, this.pageSize, this.currentFilters);
    if (this.statusId == null || this.statusId == 0) {
      this.isActive = "All";
    }
  }

  clearFilters() {
    this.sellerId = "";
    this.courierId = "";
    this.currentFilters = {};
    // const startDate = "01-01-2024";
    const currentDate = new Date();
    const startDate = new Date(); // Clone today
    startDate.setDate(startDate.getDate() - 29);
    this.selectedDateRange = {
      startDate: this.formatDate(startDate.toISOString()),
      endDate: this.formatDate(currentDate.toISOString()),
    };
    this.currentFilters.startDate = this.selectedDateRange.startDate;
    this.currentFilters.endDate = this.selectedDateRange.endDate;
    this.fetchOrders(this.pageIndex, this.pageSize, this.currentFilters);
    this.toggleFiltersForm();
  }

  toggleFiltersForm() {
    this.showFiltersForm = !this.showFiltersForm;
    this.buttonText = this.showFiltersForm ? "Close" : "Filters";
    this.buttonIcon = this.showFiltersForm ? "ri-close-fill" : "ri-filter-fill";
  }

  makeActive(label: string) {
    this.isActive = label;
  }

  isSelectAllChecked: boolean = false;

  toggleAllCheckboxes(event: any) {
    const isChecked = event.target.checked;
    this.isSelectAllChecked = isChecked;

    if (this.orders) {
      for (const key in this.orders) {
        if (Object.prototype.hasOwnProperty.call(this.orders, key)) {
          this.orders[key].selected = isChecked;
        }
      }
    }
  }

  handlePageEvent(event: { pageIndex: number; pageSize: number }) {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.shipmentStateService.setPageIndex(this.pageIndex);
    this.fetchOrders(this.pageIndex, this.pageSize);
  }

  onStatusClick(
    institutionName: string,
    courierName: string,
    statusCode: number
  ): void {
    const startDate = this.currentFilters.startDate;
    const endDate = this.currentFilters.endDate;

    this.invoiceService.setStatusData({
      institutionName,
      courierName,
      startDate,
      endDate,
    });

    this.router.navigate(["admin/courier-details"]);
  }

  onStatusClick_new(institutionName: string): void {
    const startDate = this.currentFilters.startDate;
    const endDate = this.currentFilters.endDate;
    const courierName = this.courierId;

    this.invoiceService.setStatusData({
      institutionName,
      courierName,
      startDate,
      endDate,
    });

    this.router.navigate(["admin/courier-details"]);
  }

  export() {
    let params = new HttpParams();

    params = params.set("dataCount", 1000000);
    params = params.set("page", 1);

    params = params.set("institutionId", this.sellerId);
    params = params.set("courierId", this.courierId);
    params = params.set("startDate", this.currentFilters.startDate);
    params = params.set("endDate", this.currentFilters.endDate);

    this.http.get(this.apiservice.Invoice, { params }).subscribe(
      (res: any) => {
        if (res.status && res.data?.dispatchesAndRtos?.length) {
          const startDate = this.currentFilters.startDate; // or extract it from elsewhere
          const endDate = this.currentFilters.endDate;

          const filteredData = res.data.dispatchesAndRtos.map((item: any) => ({
            "Bank Name": item.institutionName,
            "Courier Name": item.courierName,
            Dispatched: item.dispatchedQty,
            "RTO Recieved": item.rtoReceived,
          }));

          const worksheet: XLSX.WorkSheet =
            XLSX.utils.json_to_sheet(filteredData);
          const workbook: XLSX.WorkBook = {
            Sheets: { "Courier Data": worksheet },
            SheetNames: ["Courier Data"],
          };

          const firstItem = res.data.dispatchesAndRtos[0]; // Accessing correct nested data

          const today = new Date();
          const dd = String(today.getDate()).padStart(2, "0");
          const mm = String(today.getMonth() + 1).padStart(2, "0"); // Months are 0-based
          const yyyy = today.getFullYear();
          const formattedDate = `${dd}${mm}${yyyy}`;

          const filename = `Invoice_${formattedDate}.xlsx`;

          XLSX.writeFile(workbook, filename);
        } else {
          this.toastr.warning("No data found to export", "Warning");
        }
      },
      (error) => {
        console.error("Error exporting data:", error);
      }
    );
  }
}
