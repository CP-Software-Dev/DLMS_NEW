import { Component, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { ApiService } from "../../services/api.service";
import { HttpClient, HttpParams } from "@angular/common/http";
import { RefreshService } from "../../services/refresh.service";
import { Subscription } from "rxjs";
import { SellerService } from "../../services/seller.service";

@Component({
  selector: "app-user-orderdetails",
  templateUrl: "./user-orderdetails.component.html",
  styleUrl: "./user-orderdetails.component.css",
})
export class UserOrderdetailsComponent implements OnInit {
  constructor(
    private route: ActivatedRoute,
    private sellerService: SellerService,
    private refreshservice: RefreshService,
    private http: HttpClient,
    private apiservice: ApiService
  ) {}

  orderID: string = "";
  orders: any[] = [];
  seller: any;
  private refreshSubscription?: Subscription;
  private routeSubscription?: Subscription;

  ngOnInit(): void {
    this.routeSubscription = this.route.paramMap.subscribe((params) => {
      this.orderID = params.get("orderID") || "";
      this.seller = this.sellerService.getItem("seller");
      this.fetchOrderDetails();
    });

    this.refreshSubscription = this.refreshservice.refreshNeeded.subscribe(
      () => {
        this.fetchOrderDetails();
      }
    );
  }

  ngOnDestroy(): void {
    this.routeSubscription?.unsubscribe();
    this.refreshSubscription?.unsubscribe();
  }

  fetchOrderDetails() {
    let params = new HttpParams()
      .set("uid", this.orderID)
      .set("sellerID", this.seller);
    this.http.get(this.apiservice.OrderDetails, { params }).subscribe(
      (res: any) => {
        if (res.status) {
          this.orders = res.data.orders;
          this.refreshservice.triggerRefresh();
        }
      },
      (error) => {
        console.error("API Error:", error);
      }
    );
  }
}
