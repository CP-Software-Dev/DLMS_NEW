import { Component, OnInit } from "@angular/core";
import { FormGroup, FormControl, FormBuilder } from "@angular/forms";
import { SellerService } from "../../services/seller.service";
import { HttpClient, HttpParams } from "@angular/common/http";
import { ApiService } from "../../services/api.service";
import { ActivatedRoute, Router } from "@angular/router";
import { OrderStateService } from "../../services/States/Orders/order-state.service";

interface StatusData {
  role: number;
}

@Component({
  selector: "app-user-orders",
  templateUrl: "./user-orders.component.html",
  styleUrl: "./user-orders.component.css",
})
export class UserOrdersComponent implements OnInit {
  showFiltersForm: boolean = false;
  buttonText: string = "Filters";
  buttonIcon: string = "ri-filter-fill";
  orders: any[] = [];
  statusData: any[] = [];
  paginatedOrders: any[] = [];
  courierData: any[] = [];
  totalOrders: number = 0;
  requested: number = 0;
  planning: number = 0;
  process: number = 0;
  dispatch: number = 0;
  shipped: number = 0;
  rto: number = 0;
  statusId: number = 0;
  pageIndex: number = 0;
  pageSize: number = 10;
  orderIds: string = "";
  cardId: string = "";
  sellerId: string = "";
  courierId: string = "";
  phone: string = "";
  awbnumber: string = "";
  kitnumber: string = "";
  currentFilters: any = {};
  sellerData: any[] = [];
  seller: any;
  product: string = "";
  selectedDateRange: { startDate: string; endDate: string } = {
    startDate: "",
    endDate: "",
  };
  dateRange = new FormGroup({
    start: new FormControl(),
    end: new FormControl(),
  });

  constructor(
    private apiservice: ApiService,
    private http: HttpClient,
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private ordersStateService: OrderStateService,
    private sellerService: SellerService
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
  //   this.seller = this.sellerService.getItem('seller');
  //   this.isSelectAllChecked = false;
  //   this.route.queryParams.subscribe(params => {
  //     this.initializeFiltersFromParams(params);
  //   });
  //   const savedStatusId = this.ordersStateService.getStatusId();
  //   const savedPageIndex = this.ordersStateService.getPageIndex();

  //   if (savedStatusId !== null) {
  //     this.statusId = savedStatusId;
  //     this.applyStatusFilter(this.statusId)
  //   }

  //   if (savedPageIndex !== null) {
  //     this.pageIndex = savedPageIndex;
  //   }
  //   this.applyFilters();

  //   this.fetchOrders(this.pageIndex, this.pageSize);
  //   this.loadStatus();
  //   this.loadCourierData();
  // }

  ngOnInit(): void {
    this.seller = this.sellerService.getItem("seller");
    this.isSelectAllChecked = false;

    // Load saved state
    const savedStatusId = this.ordersStateService.getStatusId();
    const savedPageIndex = this.ordersStateService.getPageIndex();

    if (savedStatusId !== null) {
      this.statusId = savedStatusId;
      this.currentFilters.statusId = this.statusId;
      this.isActive = this.statusId.toString();
    } else {
      this.isActive = "All";
    }

    if (savedPageIndex !== null) {
      this.pageIndex = savedPageIndex;
    }

    // Handle query parameters
    this.route.queryParams.subscribe((params) => {
      this.initializeFiltersFromParams(params);
      // Fetch orders after initializing filters from query params
      this.fetchOrders(this.pageIndex, this.pageSize, this.currentFilters);
    });

    // Load additional data
    this.loadStatus();
    this.loadCourierData();
  }

  // initializeFiltersFromParams(params: any): void {
  //   if (!params || Object.keys(params).length === 0) {
  //     return;
  //   }

  //   if (params['sellerId']) {
  //     this.sellerId = params['sellerId'];
  //   }
  //   if (params['startDate'] && params['endDate']) {
  //     this.dateRange.setValue({
  //       start: new Date(params['startDate']),
  //       end: new Date(params['endDate'])
  //     });
  //   }
  //   if (params['statusId']) {
  //     this.statusId = params['statusId'].toString();
  //     this.isActive = this.statusId.toString();
  //   } else {
  //     this.isActive = 'All';
  //   }
  //   this.applyStatusFilter(this.statusId);
  //   this.applyFilters();
  // }

  initializeFiltersFromParams(params: any): void {
    if (!params || Object.keys(params).length === 0) {
      // If no query params, apply default filters
      this.currentFilters.startDate = this.selectedDateRange.startDate;
      this.currentFilters.endDate = this.selectedDateRange.endDate;
      return;
    }

    if (params["sellerId"]) {
      this.sellerId = params["sellerId"];
      this.currentFilters.sellerId = this.sellerId;
    }
    if (params["startDate"] && params["endDate"]) {
      this.dateRange.setValue({
        start: new Date(params["startDate"]),
        end: new Date(params["endDate"]),
      });
      this.currentFilters.startDate = this.formatDate(params["startDate"]);
      this.currentFilters.endDate = this.formatDate(params["endDate"]);
    }
    if (params["statusId"]) {
      this.statusId = params["statusId"].toString();
      this.currentFilters.statusId = this.statusId;
      this.isActive = this.statusId.toString();
    } else {
      this.isActive = "All";
    }
  }

  //------- Date Range

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

  getCountByStatusId(statusId: number): number {
    switch (statusId) {
      case 1:
        return this.requested;
      case 2:
        return this.planning;
      case 3:
        return this.process;
      case 4:
        return this.dispatch;
      case 5:
        return this.shipped;
      case 20:
        return this.rto;
      default:
        return 0;
    }
  }

  //---------Status Data

  loadStatus(): void {
    this.http.get<any>(this.apiservice.StatusData).subscribe((response) => {
      this.statusData = response.data.filter(
        (item: StatusData) => item.role === 1
      );
    });
  }

  //---------Courier Data

  loadCourierData(): void {
    this.http.get<any>(this.apiservice.CourierData).subscribe((response) => {
      this.courierData = response.data;
    });
  }

  handlePageEvent(event: { pageIndex: number; pageSize: number }) {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.ordersStateService.setPageIndex(this.pageIndex);
    this.fetchOrders(this.pageIndex, this.pageSize);
  }

  //---------Order Data

  loading: boolean = false;

  fetchOrders(
    pageIndex: number,
    pageSize: number,
    filters: any = this.currentFilters
  ) {
    this.loading = true;

    let params = new HttpParams()
      .set("page", (pageIndex + 1).toString())
      .set("dataCount", pageSize.toString())
      .set("sellerID", this.seller)
      .set("fileType", "2");

    if (filters.orderIds) {
      params = params.set("orderId", filters.orderIds.join(","));
    }
    if (filters.product) {
      params = params.set("product", filters.product);
    }
    if (filters.awbnumber) {
      params = params.set("awb", filters.awbnumber);
    }
    if (filters.kitnumber) {
      params = params.set("kitnumber", filters.kitnumber);
    }
    if (filters.phone) {
      params = params.set("contact", filters.phone);
    }
    if (filters.courierId) {
      params = params.set("courierId", filters.courierId);
    }
    if (filters.statusId !== undefined) {
      if (filters.statusId !== null) {
        params = params.set("statusID", filters.statusId.toString());
      }
    }
    if (filters.isAttempted || filters.isAttempted == 0) {
      params = params.set("isAttempted", filters.isAttempted);
    }
    if (filters.hasAwb || filters.hasAwb == 0) {
      params = params.set("hasAwb", filters.hasAwb);
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

    this.http.get(this.apiservice.Orders, { params }).subscribe(
      (res: any) => {
        if (res.status) {
          this.orders = res.data.orders;
          this.totalOrders = res.data.total;
          this.requested = res.data.requested || 0;
          this.planning = res.data.planning || 0;
          this.process = res.data.process || 0;
          this.dispatch = res.data.dispatch || 0;
          this.shipped = res.data.shipped || 0;
          this.rto = res.data.rto || 0;
          this.paginatedOrders = this.orders;
        }
        this.loading = false;
      },
      (error) => {
        this.loading = false;
      }
    );
  }

  applyFilters() {
    this.currentFilters = {};

    if (this.orderIds) {
      this.currentFilters.orderIds = this.orderIds
        .split(",")
        .map((id) => id.trim());
    }
    if (this.product) {
      this.currentFilters.product = this.product;
    }

    if (this.awbnumber) {
      this.currentFilters.awbnumber = this.awbnumber;
    }

    if (this.kitnumber) {
      this.currentFilters.kitnumber = this.kitnumber;
    }

    if (this.phone) {
      this.currentFilters.phone = this.phone;
    }

    if (this.courierId) {
      this.currentFilters.courierId = this.courierId;
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
    this.fetchOrders(this.pageIndex, this.pageSize, this.currentFilters);
    if (this.statusId == null || this.statusId == 0) {
      this.isActive = "All";
    }
  }

  clearFilters() {
    this.orderIds = "";
    this.dateRange.reset({
      start: new Date(),
      end: new Date(),
    });
    this.awbnumber = "";
    this.phone = "";
    this.courierId = "";
    this.kitnumber = "";
    this.currentFilters = {};
    this.product = "";
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
    if (this.showFiltersForm) {
      this.buttonText = "Close";
      this.buttonIcon = "ri-close-fill";
    } else {
      this.buttonText = "Filters";
      this.buttonIcon = "ri-filter-fill";
    }
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

  updateSelectAllCheckbox() {
    const ordersArray = Object.values(this.orders);
    this.isSelectAllChecked = ordersArray.every((order: any) => order.selected);
  }

  getSelectedCount(): number {
    const ordersArray = Object.values(this.orders);
    return ordersArray.filter(
      (order: any) =>
        order.selected &&
        order.order !== "selectAll" &&
        order.status !== "Shipped"
    ).length;
  }

  getSelectedOrderIds() {
    return this.paginatedOrders
      .filter((order) => order.selected)
      .map((order) => order.orderID);
  }

  isActive: string = "All";

  makeActive(label: string) {
    this.isActive = label;
  }

  getAddressTooltip(order: any): string {
    const customer = order.customer ? `${order.customer}:` : "";
    const address1 = order.address1 || "";
    const address2 = order.address2 || "";
    const city = order.city || "";
    const state = order.state || "";
    const pincode = order.pincode || "";
    const contact = order.contact || "";

    const parts = [address1, address2, city, state, pincode, contact];
    const filteredParts = parts.filter((part) => part); // Remove any empty parts

    return `${customer}\n${filteredParts.join(", ")}`;
  }

  //---------Export Orders Data

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

    return new Promise((resolve, reject) => {
      let params = new HttpParams()
        .set("page", (pageIndex + 1).toString())
        .set("dataCount", pageSize.toString())
        .set("sellerID", this.seller)
        .set("fileType", "2");

      if (this.currentFilters.orderIds) {
        params = params.set("orderId", this.currentFilters.orderIds.join(","));
      }
      if (this.currentFilters.method) {
        params = params.set("method", this.currentFilters.method);
      }
      if (this.currentFilters.kitnumber) {
        params = params.set("kitnumber", this.currentFilters.kitnumber);
      }
      if (this.currentFilters.courierId) {
        params = params.set("courierId", this.courierId);
      }
      if (this.currentFilters.statusId !== undefined) {
        if (this.currentFilters.statusId !== null) {
          params = params.set(
            "statusID",
            this.currentFilters.statusId.toString()
          );
        }
      }
      if (
        this.currentFilters.isAttempted ||
        this.currentFilters.isAttempted == 0
      ) {
        params = params.set("isAttempted", this.currentFilters.isAttempted);
      }
      if (this.currentFilters.hasAwb || this.currentFilters.has == 0) {
        params = params.set("hasAwb", this.currentFilters.hasAwb);
      }

      if (this.currentFilters.statusId) {
        params = params.set("statusId", this.currentFilters.statusID);
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
        params = params.set("awb", this.currentFilters.awbnumber);
      }
      if (this.currentFilters.phone) {
        params = params.set("phone", this.currentFilters.phone);
      }

      this.http.get(this.apiservice.OrdersExport, { params }).subscribe(
        (res: any) => {
          if (res.status) {
            resolve(res.data.orders);
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
  }

  downloadCSV(data: any[]) {
    const csvData = this.convertToCSV(data);
    const randomNumber = Math.floor(Math.random() * 90000) + 10000; // Generate a 5-digit random number
    const fileName = `Order_17185${randomNumber}.csv`;
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

  //--------Status Filter

  applyStatusFilter(statusId: number | null) {
    if (statusId === null) {
      this.isActive = "All";
    } else {
      this.isActive = statusId.toString();
    }

    if (statusId !== null) {
      this.currentFilters.statusId = statusId;
      this.ordersStateService.setStatusId(Number(statusId));
    } else {
      delete this.currentFilters.statusId;
      this.ordersStateService.setStatusId(null);
    }

    delete this.currentFilters.isAttempted;
    delete this.currentFilters.hasAwb;
    this.pageIndex = 0;
    this.ordersStateService.setPageIndex(this.pageIndex);
    this.fetchOrders(this.pageIndex, this.pageSize, this.currentFilters);
  }

  //--------AWB Filter

  awbFilter(isAttempted: number, hasAwb: number, status: string = "") {
    this.currentFilters.isAttempted = isAttempted;
    this.currentFilters.hasAwb = hasAwb;
    this.currentFilters.statusId = null;
    this.pageIndex = 0;
    this.fetchOrders(this.pageIndex, this.pageSize, this.currentFilters);
    this.isActive = status;
  }

  //--------Routes

  navigateToOrderDetail(orderID: string): void {
    this.router.navigate(["/user/orders/details", orderID]);
  }

  navigateToAwbStatus(awb: string): void {
    this.router.navigate(["user/status", awb]);
  }
}
