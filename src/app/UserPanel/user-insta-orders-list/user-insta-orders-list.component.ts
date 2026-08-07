import { Component, OnInit } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { HttpClient, HttpParams } from "@angular/common/http";
import { Subscription } from "rxjs";
import { ApiService } from "../../services/api.service";

@Component({
  selector: 'app-user-insta-orders-list',
  templateUrl: './user-insta-orders-list.component.html',
  styleUrl: './user-insta-orders-list.component.css'
})
export class UserInstaOrdersListComponent {
showFiltersForm: boolean = false;
  buttonText: string = "Filters";
  buttonIcon: string = "ri-filter-fill";

  name: string = "";
  loading: boolean = false;
  pageIndex: number = 0;
  pageSize: number = 10;
  paginatedOrders: any[] = [];
  totalOrders: number = 0;

  orderID: string = "";
  orders: any[] = [];
  private routeSubscription?: Subscription;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private http: HttpClient,
    private api: ApiService
  ) {}

  ngOnInit(): void {
    this.routeSubscription = this.route.paramMap.subscribe((params) => {
      this.orderID = params.get("orderID") || "";
      this.fetchDetails(this.pageIndex, this.pageSize);
    });
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

    debugger;
    if (this.name.length > 0) {
      params = params.set("name", this.name);
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
    this.router.navigate(['user/status', awb]);
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
    this.fetchDetails(this.pageIndex, this.pageSize);
    this.toggleFiltersForm();
  }
}
