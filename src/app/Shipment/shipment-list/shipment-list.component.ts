import { Component, OnDestroy, OnInit } from "@angular/core";
import { FormBuilder, FormControl, FormGroup } from "@angular/forms";
import { MatDialog } from "@angular/material/dialog";
import { HttpClient, HttpParams } from "@angular/common/http";
import {
  trigger,
  state,
  style,
  animate,
  transition,
} from "@angular/animations";
import { ChangestatusDialogComponent } from "../../Dialog/changestatus-dialog/changestatus-dialog.component";
import { ToastrService } from "ngx-toastr";
import { ActivatedRoute, Router } from "@angular/router";
import { ApiService } from "../../services/api.service";
import { RefreshService } from "../../services/refresh.service";
import Swal from "sweetalert2";
import { Subscription } from "rxjs";
import { ShipmentStateService } from "../../services/States/Shipments/shipment-state.service";
import { WebhookViewComponent } from "../../Dialog/webhook-view/webhook-view.component";

interface StatusData {
  role: number;
  id: number;
}

@Component({
  selector: "app-shipment-list",
  templateUrl: "./shipment-list.component.html",
  styleUrl: "./shipment-list.component.css",
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
export class ShipmentListComponent implements OnInit {
  showFiltersForm: boolean = false;
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
  pageSize: number = 10;
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

  constructor(
    private apiservice: ApiService,
    private toastr: ToastrService,
    private dialog: MatDialog,
    private fb: FormBuilder,
    private http: HttpClient,
    private router: Router,
    private shipmentStateService: ShipmentStateService,
    private refreshservice: RefreshService,
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

  ngOnInit(): void {
    this.isSelectAllChecked = false;
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
    this.fetchOrders(this.pageIndex, this.pageSize);
    this.loadSellerData();
    this.loadCourierData();
    this.loadStatus();
    this.refreshSubscription = this.refreshservice.refreshNeeded.subscribe(
      () => {
        this.fetchOrders(this.pageIndex, this.pageSize);
      }
    );
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

    if (params["sellerId"]) {
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
      this.isActive = this.statusId.toString(); // Ensure isActive is set
    } else {
      this.isActive = "All"; // Default to 'All' if no statusId
    }
    this.applyStatusFilter(this.statusId);
    this.applyFilters();
  }

  formatDate(date: string): string {
    return new Date(date).toISOString().split("T")[0];
  }

  onDateRangeSelected(dateRange: { startDate: string; endDate: string }): void {
    console.log("Start Date on Orders", dateRange.startDate);
    console.log("End Date on Orders", dateRange.endDate);
    this.selectedDateRange = {
      startDate: this.formatDate(dateRange.startDate),
      endDate: this.formatDate(dateRange.endDate),
    };
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

  isActive: string | null = "All";

  setActiveAll(): void {
    this.isActive = "All";
  }

  setActive(statusId: string): void {
    this.isActive = statusId;
  }

  getActiveDropdownItemName(): string {
    if (this.isActive === "All") {
      return "All";
    }
    const activeButton = this.statusData.find(
      (button) => this.isActive === button.id.toString()
    );
    return activeButton ? activeButton.name : "More";
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
  //-----Seller Data

  loadSellerData(): void {
    this.http.get<any>(this.apiservice.SellerData).subscribe((response) => {
      this.sellerData = response.data;
    });
  }

  //-----Courier Data

  loadCourierData(): void {
    this.http.get<any>(this.apiservice.CourierData).subscribe((response) => {
      this.courierData = response.data;
    });
  }

  //-----Status Data

  loadStatus(): void {
    const allowedIds = [6, 7, 8, 9, 10, 19];
    this.http.get<any>(this.apiservice.StatusData).subscribe((response) => {
      this.statusData = response.data.filter(
        (item: StatusData) => item.role === 2 && allowedIds.includes(item.id)
      );
    });
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
      .set("fileType", "2");

    this.loading = true;

    this.isSelectAllChecked = false;
    if (filters.orderIds) {
      params = params.set("orderId", filters.orderIds.join(","));
    }
    if (filters.kitnumber) {
      params = params.set("kitnumber", filters.kitnumber);
    }
    if (filters.sellerId && filters.sellerId !== "0") {
      params = params.set("sellerId", filters.sellerId);
    }
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
        params = params.set("shipmentId", filters.statusId);
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

    if (this.selectedMethod) {
      this.currentFilters.method = this.selectedMethod;
    }
    if (this.kitnumber) {
      this.currentFilters.kitnumber = this.kitnumber;
    }

    if (this.sellerId) {
      this.currentFilters.sellerId = this.sellerId;
    }

    if (this.awbnumber) {
      this.currentFilters.awbnumber = this.awbnumber;
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
    this.selectedMethod = "";
    this.sellerId = "";
    this.awbnumber = "";
    this.phone = "";
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
    this.fetchOrders(this.pageIndex, this.pageSize, this.currentFilters);
    this.toggleFiltersForm();
  }

  //---Confirm RTO

  confirmRto(): void {
    const selectedOrders = this.getSelectedOrderIds().map(String);
    const requestBody = {
      orderIds: selectedOrders,
    };
    this.http
      .post(this.apiservice.ConfirmRto, requestBody)
      .subscribe((res: any) => {
        if (res.status) {
          this.toastr.success("Rto Orders Confirmed", "Success");
          this.refreshservice.triggerRefresh();
        } else {
          this.toastr.error(res.errors, "Failure");
        }
      });
  }

  //-------Cancel Order

  cancelOrders(): void {
    const selectedOrders = this.getSelectedOrderIds().map(String);
    const requestBody = {
      orderIds: selectedOrders,
    };
    Swal.fire({
      title: "Are you sure?",
      text: "You want to cancel this order",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      cancelButtonText: "No",
      confirmButtonText: "Yes",
    }).then((result) => {
      if (result.isConfirmed) {
        this.http
          .patch(this.apiservice.CancelOrder, requestBody)
          .subscribe((res: any) => {
            if (res.status) {
              Swal.fire(
                "Cancelled!",
                "Your order has been cancelled.",
                "success"
              );
              this.refreshservice.triggerRefresh();
            } else {
              Swal.fire("Error!", res.errors, "error");
              this.toastr.error(res.errors, "Failure");
            }
          });
      }
    });
  }

  openStatusdialog(): void {
    const statusID = Number(this.isActive);
    const selectedOrderIds = this.getSelectedOrderIds();
    this.dialog.open(ChangestatusDialogComponent, {
      panelClass: "rounded-dialog",
      data: {
        orderIds: selectedOrderIds,
        statusID: statusID,
        source: "shipment",
      },
    });
  }

  getSelectedOrderIds() {
    return this.paginatedOrders
      .filter((order) => order.selected)
      .map((order) => order.orderID);
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

  updateSelectAllCheckbox() {
    const ordersArray = Object.values(this.orders);
    this.isSelectAllChecked = ordersArray.every((order: any) => order.selected);
  }

  getSelectedCount(): number {
    const ordersArray = Object.values(this.orders);
    return ordersArray.filter(
      (order: any) => order.selected && order.order !== "selectAll"
    ).length;
  }

  handlePageEvent(event: { pageIndex: number; pageSize: number }) {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.shipmentStateService.setPageIndex(this.pageIndex);
    this.fetchOrders(this.pageIndex, this.pageSize);
  }

  //-----Export Shipments Data

  // exportToCSV() {
  //   this.fetchAllOrders().then(allOrders => {
  //     this.downloadCSV(allOrders);
  //   }).catch(error => {
  //     console.error("Error fetching orders:", error);
  //   });
  // }

  // exportToCSV() {
  //   if (this.sellerId && this.sellerId.trim() !== "") {
  //     this.fetchAllOrders()
  //       .then((allOrders) => {
  //         this.downloadCSV(allOrders);
  //       })
  //       .catch((error) => {
  //         console.error("Error fetching orders:", error);
  //       });
  //   } else {
  //     this.toastr.error("Please select bank in Filters to export file.");
  //   }
  // }

  exportToCSV(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.sellerId && this.sellerId.trim() !== "") {
        this.fetchAllOrders()
          .then((allOrders) => {
            this.downloadCSV(allOrders);
            resolve();
          })
          .catch((error) => {
            console.error("Error fetching orders:", error);
            reject(error);
          });
      } else {
        this.toastr.error("Please select bank in Filters to export file.");
        reject("Bank not selected");
      }
    });
  }

  // fetchAllOrders(): Promise<any[]> {
  //   const pageSize = 1000000;
  //   let pageIndex = 0;
  //   const allOrders: any[] = [];
  //   debugger;
  //   const fetchPage = (pageIndex: number): Promise<any> => {
  //     return new Promise((resolve, reject) => {
  //       let params = new HttpParams()
  //         .set("page", (pageIndex + 1).toString())
  //         .set("dataCount", pageSize.toString())
  //         .set("fileType", "2");

  //       if (this.currentFilters.orderIds) {
  //         params = params.set(
  //           "orderId",
  //           this.currentFilters.orderIds.join(",")
  //         );
  //       }
  //       if (this.currentFilters.method) {
  //         params = params.set("method", this.currentFilters.method);
  //       }
  //       if (this.currentFilters.kitnumber) {
  //         params = params.set("kitnumber", this.currentFilters.kitnumber);
  //       }
  //       if (this.currentFilters.cardId) {
  //         params = params.set("cardId", this.currentFilters.cardId);
  //       }
  //       if (this.currentFilters.sellerId) {
  //         params = params.set("sellerId", this.currentFilters.sellerId);
  //       }
  //       if (this.currentFilters.courierId) {
  //         params = params.set("courierId", this.currentFilters.courierId);
  //       }

  //       if (this.currentFilters.statusId !== undefined) {
  //         if (this.currentFilters.statusId !== null) {
  //           params = params.set(
  //             "shipmentId",
  //             this.currentFilters.statusId.toString()
  //           );
  //         }
  //       }
  //       let startDate = this.currentFilters.startDate;
  //       let endDate = this.currentFilters.endDate;

  //       if (!startDate || !endDate) {
  //         const currentDate = new Date();
  //         const adjustedDate = new Date(
  //           currentDate.getTime() - currentDate.getTimezoneOffset() * 60000
  //         )
  //           .toISOString()
  //           .split("T")[0];
  //         startDate = startDate || adjustedDate;
  //         endDate = endDate || adjustedDate;
  //       }

  //       params = params.set("startDate", startDate).set("endDate", endDate);
  //       if (this.currentFilters.awbnumber) {
  //         params = params.set("awb", this.currentFilters.awbnumber);
  //       }
  //       if (this.currentFilters.phone) {
  //         params = params.set("phone", this.currentFilters.phone);
  //       }

  //       this.http.get(this.apiservice.Shipments, { params }).subscribe(
  //         (res: any) => {
  //           if (res.status) {
  //             resolve(res.data.orders);
  //           } else {
  //             reject("Failed to fetch data");
  //           }
  //         },
  //         (error) => {
  //           console.error("API Error:", error);
  //           reject(error);
  //         }
  //       );
  //     });
  //   };

  //   const fetchAll = async () => {
  //     let moreData = true;
  //     while (moreData) {
  //       const orders = await fetchPage(pageIndex);
  //       if (orders.length > 0) {
  //         allOrders.push(...orders);
  //         pageIndex++;
  //       } else {
  //         moreData = false;
  //       }
  //     }
  //     return allOrders;
  //   };

  //   return fetchAll();
  // }

  fetchAllOrders(): Promise<any[]> {
    return new Promise((resolve, reject) => {
      let params = new HttpParams().set("fileType", "2");

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

      if (this.currentFilters.sellerId) {
        params = params.set("sellerId", this.currentFilters.sellerId);
      }

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

      // 🚀 SINGLE API CALL
      this.http.get(this.apiservice.ShipmentsExport, { params }).subscribe(
        (res: any) => {
          if (res.status) {
            const orders = res.data?.orders || [];

            if (!orders.length) {
              this.toastr.warning("No data to export");
              reject("No data");
              return;
            }
            resolve(orders); // ✅ full data comes directly
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
    const firstSeller = this.orders[0].company.replace(/\s+/g, "_");
    const csvData = this.convertToCSV(data);

    const now = new Date();
    const day = String(now.getDate()).padStart(2, "0");
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const year = now.getFullYear();
    const dateString = `${day}${month}${year}`;

    const hours = String(now.getHours()).padStart(2, "0");
    const minutes = String(now.getMinutes()).padStart(2, "0");
    const seconds = String(now.getSeconds()).padStart(2, "0");

    const fileName = `Shipments_${firstSeller}_${dateString}.csv`;
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
    debugger;
    const headers = Object.keys(data[0]);
    const csvRows = [];
    csvRows.push(headers.join(","));
    for (const row of data) {
      const values = headers.map((header) => row[header]);
      csvRows.push(values.join(","));
    }
    return csvRows.join("\n");
  }

  // convertToCSV(data: any[]) {
  //   const headers = Object.keys(data[0]);
  //   const csvRows = [];
  //   csvRows.push(headers.join(','));

  //   for (const row of data) {
  //     const values = headers.map(header => {
  //       // Replace commas in address1 and address2 fields with hyphens
  //       if (header === 'address1' || header === 'address2') {
  //         return (row[header] || '').replace(/,/g, '-'); // Replace commas with hyphen
  //       }
  //       return row[header];
  //     });
  //     csvRows.push(values.join(','));
  //   }

  //   return csvRows.join('\n');
  // }

  isActiveDropdownButton: boolean = false;

  moreButtonText = "More";

  //------Status Filters

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
    this.isSelectAllChecked = false;
  }

  updateMoreButtonText(text: string) {
    this.moreButtonText = text;
  }

  isDropdownItemActive(): boolean {
    return this.statusData
      .slice(5)
      .some((button) => this.isActive === button.id.toString());
  }

  //--------Routes

  navigatetoInstaDetails(orderID: string): void {
    this.router.navigate(["/admin/insta/details", orderID]);
  }

  navigateTostatus() {
    this.router.navigate(["admin/shipment/status"]);
  }

  navigateToAwbStatus(awb: string): void {
    this.router.navigate(["admin/status", awb]);
  }

  navigateToShipmentDetail(orderID: string): void {
    this.router.navigate(["/admin/shipment/details", orderID]);
  }

  openDialog(orderID: number) {
    this.dailog.open(WebhookViewComponent, {
      data: {
        order: orderID,
      },
    });
  }
}
