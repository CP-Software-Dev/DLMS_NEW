import {
  ChangeDetectorRef,
  Component,
  Input,
  OnDestroy,
  OnInit,
} from "@angular/core";
import { FormBuilder, FormGroup, FormControl } from "@angular/forms";
import {
  trigger,
  state,
  style,
  animate,
  transition,
} from "@angular/animations";
import { MatDialog } from "@angular/material/dialog";
import { ActivatedRoute } from "@angular/router";
import { HttpClient, HttpParams } from "@angular/common/http";
import { OrderUploadComponent } from "../Dialog/order-upload/order-upload.component";
import { ChangestatusDialogComponent } from "../Dialog/changestatus-dialog/changestatus-dialog.component";
import { Router } from "@angular/router";
import { BulkshipComponent } from "../Dialog/bulkship/bulkship.component";
import { WebhookViewComponent } from "../Dialog/webhook-view/webhook-view.component";
import { ApiService } from "../services/api.service";
import { SellerService } from "../services/seller.service";
import { Subscription } from "rxjs";
import { RefreshService } from "../services/refresh.service";
import { OrderStateService } from "../services/States/Orders/order-state.service";
import { ToastrService } from "ngx-toastr";
import { InstaOrdersService } from "../services/States/Orders/insta-orders.service";

interface StatusData {
  id: number;
  name: string;
  shortName?: string;
  description?: string | null;
  createdAt?: string;
  role: number;
}

@Component({
  selector: "app-insta-orders",
  templateUrl: "./insta-orders.component.html",
  styleUrl: "./insta-orders.component.css",
  animations: [
    trigger("fadeInOut", [
      state(
        "void",
        style({
          opacity: 0,
        })
      ),
      transition("void <=> *", animate(300)),
    ]),
  ],
})
export class InstaOrdersComponent implements OnInit {
  // ---------- role / view ----------
  rolenum = 0;
  isAdminView = false; // role 1, 2 => admin side
  basePath: "admin" | "user" = "user";
  private userSellerId: any = 0; // user view only (localStorage "seller")

  //@Input() showFiltersForm: boolean = false;
  showFiltersForm: boolean = false;
  buttonText: string = "Filters";
  buttonIcon: string = "ri-filter-fill";
  orders: any[] = [];

  // Full unfiltered status master list (all statuses from API)
  allStatusData: any[] = [];
  // Top card menu statuses (role === 1) — same as before
  statusData: any[] = [];
  paginatedOrders: any[] = [];
  currentFilters: any = {};
  sellerData: any[] = [];
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
  isSelectAllChecked: boolean = false;
  selectedDateRange: { startDate: string; endDate: string } = {
    startDate: "",
    endDate: "",
  };
  // ----------- basetotalorder for color label-----
    baseTotalOrders: number = 0;

  private refreshSubscription?: Subscription;

  shippedSubStatusIds: number[] = [5, 6, 7, 9, 10,  14];

  shippedSubStatuses: any[] = [];

  
  private shippedPillColors: { [id: number]: { tone: string; light: string } } = {
    5: { tone: "#7c6df7", light: "#f2eefc" },  // All Shipped   - violet
    6: { tone: "#9aa0ac", light: "#f1f2f4" },  // Booked        - grey
    7: { tone: "#f5a623", light: "#fff4e2" },  // Waiting for Pickup - orange
    // 8: { tone: "#2f6fed", light: "#eaf1ff" },  // In Transit    - blue
    9: { tone: "#14b8a6", light: "#e6faf7" },  // Out for Delivery - teal
    10: { tone: "#16a34a", light: "#e9f9f1" }, // Delivered     - green
    // 11: { tone: "#fa2048", light: "#fde8ec" }, // Exception     - red
    // 12: { tone: "#8b5cf6", light: "#f2eefc" }, // RTO In Transit - purple
    14: { tone: "#b8a6f5", light: "#f5f2fd" }, // RTO Delivered - light purple
    // 15: { tone: "#e11d48", light: "#fde6ea" }, // Lost          - deep red
  };

  
  getShippedPillTone(statusId: number): string {
    return (this.shippedPillColors[statusId] || this.shippedPillColors[5]).tone;
  }


  getShippedPillLight(statusId: number): string {
    return (this.shippedPillColors[statusId] || this.shippedPillColors[5]).light;
  }

  statusCounts: { [id: number]: number } = {};

  constructor(
    private apiservice: ApiService,
    private dialog: MatDialog,
    private http: HttpClient,
    private refreshservice: RefreshService,
    private router: Router,
    private toastr: ToastrService,
    private ordersStateService: InstaOrdersService,
    private route: ActivatedRoute,
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

  // ================= role helpers =================
  private initRole(): void {
    this.rolenum = Number(this.sellerService.getItem("role"));
    this.isAdminView = this.rolenum === 1 || this.rolenum === 2;
    this.basePath = this.isAdminView ? "admin" : "user";
    if (!this.isAdminView) {
      this.userSellerId = this.sellerService.getItem("seller");
    }
  }

 
  get showSelect(): boolean {
    return (
      this.isAdminView &&
      this.isActive !== "All" &&
      this.isActive !== "5" &&
      this.isActive !== "4" &&
      this.isActive != "AWB_Success"
    );
  }


  private applySellerParam(params: HttpParams, sellerId: any): HttpParams {
    if (!this.isAdminView) {
      return params.set("sellerID", this.userSellerId);
    }
    if (sellerId && sellerId !== "0") {
      return params.set("sellerId", sellerId);
    }
    return params;
  }

  ngOnInit(): void {
    this.initRole();

    this.isSelectAllChecked = false;
    this.route.queryParams.subscribe((params) => {
      this.initializeFiltersFromParams(params);
    });

    const savedStatusId = this.ordersStateService.getStatusId();
    const savedPageIndex = this.ordersStateService.getPageIndex();
    if (savedStatusId !== null && savedStatusId != 0) {
      this.statusId = savedStatusId;
      this.applyStatusFilter(this.statusId);
    }

    if (savedPageIndex !== null) {
      this.pageIndex = savedPageIndex;
    }

    this.applyFilters();
    this.fetchOrders(this.pageIndex, this.pageSize);
    if (this.isAdminView) {
      this.loadSellerData();
    }
    this.loadCourierData();
    this.loadStatus();

    this.refreshSubscription = this.refreshservice.refreshNeeded.subscribe(
      () => {
        this.fetchOrders(this.pageIndex, this.pageSize);
      }
    );
  }

  initializeFiltersFromParams(params: any): void {
    if (!params || Object.keys(params).length === 0) {
      return;
    }

   
    if (this.isAdminView && params["sellerId"]) {
      this.sellerId = params["sellerId"];
    }

    if (params["startDate"] && params["endDate"]) {
      this.selectedDateRange = {
        startDate: this.formatDate(new Date(params["startDate"]).toISOString()),
        endDate: this.formatDate(new Date(params["endDate"]).toISOString()),
      };
    }

    if (params["statusId"]) {
      this.statusId = params["statusId"].toString();
      this.isActive = this.statusId.toString();
    } else {
      this.isActive = "All";
    }

    this.applyStatusFilter(this.statusId);
    this.applyFilters();
  }

  ngOnDestroy(): void {
    this.ordersStateService.setPageIndex(this.pageIndex);
    if (this.refreshSubscription) {
      this.refreshSubscription.unsubscribe();
    }
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

  //--------Status Data

  loadStatus(): void {
    this.http.get<any>(this.apiservice.StatusData).subscribe((response) => {
      // Full master list (all statuses)
      this.allStatusData = response.data || [];

      // Top card menu — same behaviour as before (role === 1)
      this.statusData = this.allStatusData.filter(
        (item: StatusData) => item.role === 1
      );

      this.shippedSubStatuses = this.allStatusData.filter((item: any) =>
        this.shippedSubStatusIds.includes(item.id)
      );
    });
  }

  //--------Courier Data

  loadCourierData(): void {
    this.http.get<any>(this.apiservice.CourierData).subscribe((response) => {
      this.courierData = response.data;
    });
  }

  //--------Bank Data (admin only)

  loadSellerData(): void {
    this.http.get<any>(this.apiservice.SellerData).subscribe((response) => {
      this.sellerData = response.data;
    });
  }
  isActive: string = "All";

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
     
        return this.statusCounts[statusId] || 0;
    }
  }
  isShippedGroupActive(): boolean {
    return this.shippedSubStatusIds
      .map((id) => id.toString())
      .includes(this.isActive);
  }

  //--------Daata for table
  loading: boolean = false;

  fetchOrders(
    pageIndex: number,
    pageSize: number,
    filters: any = this.currentFilters
  ) {
    let params = new HttpParams()
      .set("page", (pageIndex + 1).toString())
      .set("dataCount", pageSize.toString())
      .set("fileType", "3");

    this.loading = true;
    this.isSelectAllChecked = false;
    if (filters.orderIds) {
      params = params.set("orderId", filters.orderIds.join(","));
    }
    if (filters.method) {
      params = params.set("method", filters.method);
    }
    if (filters.kitnumber) {
      params = params.set("kitnumber", filters.kitnumber);
    }
    params = this.applySellerParam(params, filters.sellerId);
    if (filters.awbnumber) {
      params = params.set("awb", filters.awbnumber);
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

          if (res.data.statusCounts && Array.isArray(res.data.statusCounts)) {
            this.statusCounts = {};
            res.data.statusCounts.forEach((item: any) => {
              this.statusCounts[item.id ?? item.statusId] =
                item.count ?? item.total ?? 0;
            });
          }
        }
        if (!filters.statusId) {
          this.baseTotalOrders = res.data.total;
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

    
    if (this.isAdminView && this.sellerId) {
      this.currentFilters.sellerId = this.sellerId;
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
    if (this.statusId) {
      this.currentFilters.statusId = this.statusId;
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
    this.orderIds = "";
    this.sellerId = "";
    this.awbnumber = "";
    this.phone = "";
    this.currentFilters = {};
    this.courierId = "";
    this.kitnumber = "";
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

  //--------Dailog boxes (admin only: upload, change status, bulk ship)

  openDialog(): void {
    this.dialog.open(OrderUploadComponent, {
      panelClass: "rounded-dialog",
    });
  }

  openWebhookDialog(order: any): void {
    this.dialog.open(WebhookViewComponent, {
      data: {
        order: order.orderID,
        awb: order.awb,
        shipmentStatus: order.shipmentStatus || order.orderStatus,
        company: `${order.company} - Perso`,
      },
      position: { right: "1%", top: "10px" },
      height: "calc(100vh - 40px)",
      maxHeight: "calc(100vh - 40px)",
      width: "700px",
      maxWidth: "700px",
      panelClass: "right-slide-panel",
      backdropClass: "remake-blur-backdrop",
      hasBackdrop: true,
    });
  }

  openStatusdialog(): void {
    if (!this.isAdminView) return;
    const selectedOrderIds = this.getSelectedOrderIds();
    const statusID = Number(this.isActive);
    this.dialog.open(ChangestatusDialogComponent, {
      panelClass: "rounded-dialog",
      data: {
        orderIds: selectedOrderIds,
        statusID: statusID,
        source: "orders",
      },
    });
  }

  openBulkShipdialog(): void {
    if (!this.isAdminView) return;
    const selectedOrderDetails = this.getSelectedOrderDetails();
    this.dialog.open(BulkshipComponent, {
      panelClass: "rounded-dialog",
      data: { orderDetails: selectedOrderDetails },
    });
  }

  toggleFiltersForm() {
    this.showFiltersForm = !this.showFiltersForm;
    this.buttonText = this.showFiltersForm ? "Close" : "Filters";
    this.buttonIcon = this.showFiltersForm ? "ri-close-fill" : "ri-filter-fill";
  }

  toggleAllCheckboxes(event: any) {
    const isChecked = event.target.checked;
    this.isSelectAllChecked = isChecked;

    if (this.orders) {
      for (const key in this.orders) {
        if (Object.prototype.hasOwnProperty.call(this.orders, key)) {
          const order = this.orders[key];

          // Skip hidden checkbox rows
          if (!(this.isActive == "1" && order.instaCardCount == 0)) {
            order.selected = isChecked;
          } else {
            order.selected = false;
          }
        }
      }
    }
  }

  updateSelectAllCheckbox() {
    const ordersArray = Object.values(this.orders);

    // Only count rows where checkbox is visible
    const validOrders = ordersArray.filter(
      (order: any) => !(this.isActive == "1" && order.instaCardCount == 0)
    );

    this.isSelectAllChecked =
      validOrders.length > 0 &&
      validOrders.every((order: any) => order.selected);
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
  getSelectedOrderDetails() {
    return this.paginatedOrders
      .filter((order) => order.selected)
      .map((order) => ({
        orderID: order.orderID,
        status: order.orderStatus,
      }));
  }

  handlePageEvent(event: { pageIndex: number; pageSize: number }) {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.ordersStateService.setPageIndex(this.pageIndex);
    this.fetchOrders(this.pageIndex, this.pageSize);
  }

  //--------Export Order Data

  exportToCSV(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.fetchAllOrders()
        .then((allOrders) => {
          this.downloadCSV(allOrders);
          resolve();
        })
        .catch((error) => {
          console.error("Error fetching orders:", error);
          this.toastr.error("Error fetching orders" , "Error");
          reject(error);
        });
    });
  }

  fetchAllOrders(): Promise<any[]> {
    return new Promise((resolve, reject) => {
      let params = new HttpParams().set("fileType", "3");

      if (this.currentFilters.orderIds) {
        params = params.set("orderId", this.currentFilters.orderIds.join(","));
      }

      if (this.currentFilters.method) {
        params = params.set("method", this.currentFilters.method);
      }

      if (this.currentFilters.kitnumber) {
        params = params.set("kitnumber", this.currentFilters.kitnumber);
      }

      if (this.currentFilters.cardId) {
        params = params.set("cardId", this.currentFilters.cardId);
      }

      params = this.applySellerParam(params, this.currentFilters.sellerId);

      if (this.currentFilters.courierId) {
        params = params.set("courierId", this.currentFilters.courierId);
      }

      if (
        this.currentFilters.statusId !== undefined &&
        this.currentFilters.statusId !== null
      ) {
        params = params.set(
          "shipmentId",
          this.currentFilters.statusId.toString()
        );
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
            const orders = res.data?.orders || [];
            if (!orders.length) {
              this.toastr.warning("No data to export");
              reject("No data");
              return;
            }
            resolve(orders); 
          } else {
            this.toastr.error("Failed to fetch data");
            reject("Failed to fetch data");
          }
        },
        (error) => {
          console.error("API Error:", error);
          this.toastr.error("Something went wrong");
          reject(error);
        }
      );
    });
  }

  downloadCSV(data: any[]) {
    const csvData = this.convertToCSV(data);
    const randomNumber = Math.floor(Math.random() * 90000) + 10000; 
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

  //-------Status FIlter

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

    this.isSelectAllChecked = false;
    this.pageIndex = 0;
    this.ordersStateService.setPageIndex(this.pageIndex);
    this.fetchOrders(this.pageIndex, this.pageSize, this.currentFilters);
  }

  //--AWB FIlter

  awbFilter(isAttempted: number, hasAwb: number, status: string = "") {
    this.currentFilters.isAttempted = isAttempted;
    this.currentFilters.hasAwb = hasAwb;
    this.currentFilters.statusId = null;
    this.pageIndex = 0;
    this.fetchOrders(this.pageIndex, this.pageSize, this.currentFilters);
    // this.isActive = '';
    this.isActive = status;
  }



  navigateToImportList() {
    this.router.navigate(["admin/orders/list"]); // admin only
  }

  navigateToOrderDetail(orderID: string): void {
    this.router.navigate([`/${this.basePath}/orders/details`, orderID]);
  }

  navigatetoInstaDetails(orderID: string): void {
    this.router.navigate([`/${this.basePath}/insta/details`, orderID]);
  }

  navigateToAwbStatus(awb: string): void {
    this.router.navigate([`${this.basePath}/status`, awb]);
  }


  // -------------
    getPercentage(count: number): number {
    if (!this.baseTotalOrders) {
      return 0;
    }
    const pct = (count / this.baseTotalOrders) * 100;
    return pct > 100 ? 100 : pct;
  }
   getLabelOpacity(count: number): number {
    if (count === 0) {
      return 0.65;
    }
    const opacity = this.getPercentage(count) / 100;
    return Math.max(opacity, 0.4);
  }
}