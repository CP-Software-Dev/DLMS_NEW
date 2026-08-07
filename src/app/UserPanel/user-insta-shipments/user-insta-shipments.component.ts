import { Component, OnInit } from "@angular/core";
import { FormGroup, FormControl, FormBuilder } from "@angular/forms";
import { ApiService } from "../../services/api.service";
import { SellerService } from "../../services/seller.service";
import { HttpClient, HttpParams } from "@angular/common/http";
import { ActivatedRoute, Router } from "@angular/router";
import { ToastrService } from "ngx-toastr";
import { RefreshService } from "../../services/refresh.service";
import { MatDialog } from "@angular/material/dialog";
import { ShipmentStateService } from "../../services/States/Shipments/shipment-state.service";

interface StatusData {
  role: number;
  id: number;
}

@Component({
  selector: "app-user-insta-shipments",
  templateUrl: "./user-insta-shipments.component.html",
  styleUrl: "./user-insta-shipments.component.css",
})
export class UserInstaShipmentsComponent implements OnInit {
  showFiltersForm: boolean = false;
  buttonText: string = "Filters";
  buttonIcon: string = "ri-filter-fill";

  currentFilters: any = {};
  orders: any[] = [];
  statusData: any[] = [];
  paginatedOrders: any[] = [];
  totalOrders: number = 0;
  booked: number = 0;
  inTransit: number = 0;
  pendingPickup: number = 0;
  outForDelivery: number = 0;
  Delivered: number = 0;
  cancelled: number = 0;

  sellerData: any[] = [];
  courierData: any[] = [];
  seller: any;
  pageIndex: number = 0;
  pageSize: number = 10;
  orderIds: string = "";
  cardId: string = "";
  sellerId: string = "";
  courierId: string = "";
  phone: string = "";
  awbnumber: string = "";
  kitnumber: string = "";
  product: string = "";
  statusId: number = 0;
  selectedDateRange: { startDate: string; endDate: string } = {
    startDate: "",
    endDate: "",
  };

  constructor(
    private apiservice: ApiService,
    private shipmentStateService: ShipmentStateService,
    private http: HttpClient,
    private router: Router,
    private route: ActivatedRoute,
    private refreshservice: RefreshService,
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

  ngOnInit(): void {
    this.seller = this.sellerService.getItem("seller");
    this.loadStatus();
    this.loadCourierData();
    this.route.queryParams.subscribe((params) => {
      this.initializeFiltersFromParams(params);
    });
    const savedStatusId = this.shipmentStateService.getStatusId();
    const savedPageIndex = this.shipmentStateService.getPageIndex();

    if (savedStatusId !== null) {
      this.statusId = savedStatusId;
      this.applyStatusFilter(this.statusId);
    }

    if (savedPageIndex !== null) {
      this.pageIndex = savedPageIndex;
    }
    this.applyFilters();
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

  dateRange = new FormGroup({
    start: new FormControl(),
    end: new FormControl(),
  });

  loadCourierData(): void {
    this.http.get<any>(this.apiservice.CourierData).subscribe((response) => {
      this.courierData = response.data;
    });
  }

  isActive: string | null = "All";

  initializeFiltersFromParams(params: any): void {
    if (!params || Object.keys(params).length === 0) {
      return;
    }
    if (params["sellerId"]) {
      this.sellerId = params["sellerId"];
    }
    if (params["startDate"] && params["endDate"]) {
      this.dateRange.setValue({
        start: new Date(params["startDate"]),
        end: new Date(params["endDate"]),
      });
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

  getCountByStatusId(statusId: number): number {
    switch (statusId) {
      case 6:
        return this.booked;
      case 7:
        return this.pendingPickup;
      case 8:
        return this.inTransit;
      case 9:
        return this.outForDelivery;
      case 10:
        return this.Delivered;
      case 19:
        return this.cancelled;
      default:
        return 0;
    }
  }

  loadStatus(): void {
    const allowedIds = [6, 7, 8, 9, 10, 19];
    this.http.get<any>(this.apiservice.StatusData).subscribe((response) => {
      this.statusData = response.data.filter(
        (item: StatusData) => item.role === 2 && allowedIds.includes(item.id)
      );
    });
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

  isActive1: string | null = null;
  makeActivebutton(item: string) {
    this.isActive1 = item;
  }

  handlePageEvent(event: { pageIndex: number; pageSize: number }) {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.shipmentStateService.setPageIndex(this.pageIndex);
    this.fetchOrders(this.pageIndex, this.pageSize);
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

  loading: boolean = false;

  fetchOrders(
    pageIndex: number,
    pageSize: number,
    filters: any = this.currentFilters
  ) {
    let params = new HttpParams()
      .set("page", (pageIndex + 1).toString())
      .set("dataCount", pageSize.toString())
      .set("sellerID", this.seller)
      .set("fileType", "3");

    this.loading = true;

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
      params = params.set("courierId", this.courierId);
    }
    if (filters.statusId !== undefined) {
      if (filters.statusId !== null) {
        params = params.set("shipmentId", filters.statusId.toString());
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

    this.http.get(this.apiservice.Shipments, { params }).subscribe(
      (res: any) => {
        if (res.status) {
          this.orders = res.data.orders;
          this.totalOrders = res.data.total;
          this.paginatedOrders = this.orders;
          this.booked = res.data.booked;
          this.pendingPickup = res.data.pendingPickup;
          this.inTransit = res.data.inTransit;
          this.outForDelivery = res.data.outForDelivery;
          this.Delivered = res.data.delivered;
          this.cancelled = res.data.cancelled;
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
    this.kitnumber = "";
    this.phone = "";
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

  makeActive(label: string) {
    this.isActive = label;
  }

  navigateToOrderDetail(orderID: string): void {
    this.router.navigate(["user/shipment/details", orderID]);
  }

  navigateToAwbStatus(awb: string): void {
    this.router.navigate(["user/status", awb]);
  }

  isActiveDropdownButton: boolean = false;

  moreButtonText = "More";

  applyStatusFilter(statusId: number | null, statusName?: string) {
    if (statusId === null) {
      this.isActive = "All";
      this.moreButtonText = "More";
    } else {
      this.isActive = statusId.toString();
      if (statusName) {
        this.updateMoreButtonText(statusName);
      }
    }

    if (statusId !== null) {
      this.currentFilters.statusId = statusId;
      this.shipmentStateService.setStatusId(Number(statusId));
    } else {
      delete this.currentFilters.statusId;
      this.shipmentStateService.setStatusId(null);
    }
    this.pageIndex = 0;
    this.shipmentStateService.setPageIndex(this.pageIndex);
    this.fetchOrders(this.pageIndex, this.pageSize, this.currentFilters);
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

  navigatetoInstaDetails(orderID: string): void {
    this.router.navigate(["/user/insta/details", orderID]);
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
          .set("fileType", "3");

        if (this.currentFilters.orderIds) {
          params = params.set(
            "orderId",
            this.currentFilters.orderIds.join(",")
          );
        }
        if (this.currentFilters.method) {
          params = params.set("method", this.currentFilters.method);
        }
        if (this.currentFilters.kitnumber) {
          params = params.set("kitnumber", this.currentFilters.kitnumber);
        }
        if (this.currentFilters.courierId) {
          params = params.set("courierId", this.currentFilters.courierId);
        }
        if (this.currentFilters.statusId !== undefined) {
          if (this.currentFilters.statusId !== null) {
            params = params.set(
              "shipmentId",
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
          params = params.set("awb", this.currentFilters.awbnumber);
        }
        if (this.currentFilters.phone) {
          params = params.set("phone", this.currentFilters.phone);
        }

        this.http.get(this.apiservice.ShipmentsExport, { params }).subscribe(
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
    const fileName = `Shipments_17185${randomNumber}.csv`;
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

  updateMoreButtonText(text: string) {
    this.moreButtonText = text;
  }

  isDropdownItemActive(): boolean {
    return this.statusData
      .slice(5)
      .some((button) => this.isActive === button.id.toString());
  }
}
