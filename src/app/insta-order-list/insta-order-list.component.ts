import { Component, OnInit } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { HttpClient, HttpParams } from "@angular/common/http";
import { Subscription } from "rxjs";
import { ApiService } from "../services/api.service";
import { InstaRemkakeComponent } from "../Dialog/insta-remkake/insta-remkake.component";
import { MatDialog } from "@angular/material/dialog";
import { RefreshService } from "../services/refresh.service";
import { RemakeFileUploadComponent } from "../Dialog/remake-file-upload/remake-file-upload.component";

@Component({
  selector: "app-insta-order-list",
  templateUrl: "./insta-order-list.component.html",
  styleUrl: "./insta-order-list.component.css",
})
export class InstaOrderListComponent implements OnInit {
  showFiltersForm: boolean = false;
  buttonText: string = "Filters";
  buttonIcon: string = "ri-filter-fill";

  name: string = "";
  loading: boolean = false;
  pageIndex: number = 0;
  pageSize: number = 10;
  paginatedOrders: any[] = [];
  totalOrders: number = 0;
  isExporting: boolean = false;
  isSelectAllChecked: boolean = false;
  orderID: string = "";
  orders: any[] = [];
  private routeSubscription?: Subscription;
  private refreshSubscription?: Subscription;

  remakeId: number = 2;

  remakes = [
    { id: 2, name: "Select All" },
    { id: 0, name: "Remake" },
    { id: 1, name: "Non-Remake" },
  ];

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private dialog: MatDialog,
    private refreshservice: RefreshService,
    private http: HttpClient,
    private api: ApiService
  ) {}

  ngOnInit(): void {
    this.routeSubscription = this.route.paramMap.subscribe((params) => {
      this.orderID = params.get("orderID") || "";
      this.fetchDetails(this.pageIndex, this.pageSize);
    });

    this.refreshSubscription = this.refreshservice.refreshNeeded.subscribe(
      () => {
        this.fetchDetails(this.pageIndex, this.pageSize);
      }
    );
  }

  ngOnDestroy(): void {
    this.routeSubscription?.unsubscribe();
  }

  toggleFiltersForm() {
    this.showFiltersForm = !this.showFiltersForm;
    this.buttonText = this.showFiltersForm ? "Close" : "Filters";
    this.buttonIcon = this.showFiltersForm ? "ri-close-fill" : "ri-filter-fill";
  }

  fetchDetails(pageIndex: number, pageSize: number) {
    let params = new HttpParams()
      .set("page", (pageIndex + 1).toString())
      .set("dataCount", pageSize.toString())
      .set("orderId", this.orderID);

    if (this.name.length > 0) {
      params = params.set("kitnumber", this.name);
    }

    if (this.remakeId != 2) {
      params = params.set("remake", this.remakeId);
    }

    this.http.get(this.api.InstaOrders, { params }).subscribe(
      (res: any) => {
        if (res.status) {
          this.orders = res.data.orders;
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

  handlePageEvent(event: { pageIndex: number; pageSize: number }) {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.fetchDetails(this.pageIndex, this.pageSize);
  }

  navigateToAwbStatus(awb: string): void {
    this.router.navigate(["admin/status", awb]);
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

  applyFilters() {
    this.pageIndex = 0;
    this.fetchDetails(this.pageIndex, this.pageSize);
  }

  clearFilters() {
    this.name = "";
    this.remakeId = 2;
    this.fetchDetails(this.pageIndex, this.pageSize);
    this.toggleFiltersForm();
  }

  getSelectedCount(): number {
    const ordersArray = Object.values(this.orders);
    return ordersArray.filter(
      (order: any) => order.selected && order.order !== "selectAll"
    ).length;
  }

  getSelectedOrderDetails() {
    return this.paginatedOrders
      .filter((order) => order.selected)
      .map((order) => ({
        orderID: order.kitNumber,
      }));
  }

  remake() {
    const selectedOrderDetails = this.getSelectedOrderDetails();
    this.dialog.open(InstaRemkakeComponent, {
      panelClass: "rounded-dialog",
      data: {
        orderIds: selectedOrderDetails,
        source: "orders",
      },
    });
  }

  // toggleAllCheckboxes(event: any) {
  //   const isChecked = event.target.checked;
  //   this.isSelectAllChecked = isChecked;

  //   if (this.orders) {
  //     for (const key in this.orders) {
  //       if (Object.prototype.hasOwnProperty.call(this.orders, key)) {
  //         this.orders[key].selected = isChecked;
  //       }
  //     }
  //   }
  // }

  toggleAllCheckboxes(event: any) {
    const isChecked = event.target.checked;
    this.isSelectAllChecked = isChecked;

    if (this.orders) {
      for (const key in this.orders) {
        if (Object.prototype.hasOwnProperty.call(this.orders, key)) {
          // ✅ ONLY select rows where checkbox is visible
          if (this.orders[key].isRemake == 1) {
            this.orders[key].selected = isChecked;
          }
        }
      }
    }
  }

  updateSelectAllCheckbox() {
    const validOrders = Object.values(this.orders).filter(
      (order: any) => order.isRemake == 1
    );

    this.isSelectAllChecked =
      validOrders.length > 0 &&
      validOrders.every((order: any) => order.selected);
  }
  // updateSelectAllCheckbox() {
  //   const ordersArray = Object.values(this.orders);
  //   this.isSelectAllChecked = ordersArray.every((order: any) => order.selected);
  // }

  exportToCSV() {
    this.isExporting = true;
    this.fetchAllOrders()
      .then((allOrders) => {
        this.downloadCSV(allOrders);
        this.isExporting = false;
      })
      .catch((error) => {
        console.error("Error fetching orders:", error);
         this.isExporting = false;
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
          .set("dataCount", "10000000")
          .set("orderId", this.orderID);

        if (this.remakeId != 2) {
          params = params.set("remake", this.remakeId);
        }

        this.http.get(this.api.InstaOrders, { params }).subscribe(
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


    openDialog(): void {
      this.dialog.open(RemakeFileUploadComponent, {
        panelClass: "rounded-dialog",
      });
    }
}
