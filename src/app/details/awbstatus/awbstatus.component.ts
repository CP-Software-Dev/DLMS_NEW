import { Component, ElementRef, OnInit, ViewChild } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { ApiService } from "../../services/api.service";
import { HttpClient, HttpParams } from "@angular/common/http";
import { Subscription } from "rxjs";
import { RefreshService } from "../../services/refresh.service";
import { error } from "node:console";
import { SellerService } from "../../services/seller.service";

@Component({
  selector: "app-awbstatus",
  templateUrl: "./awbstatus.component.html",
  styleUrl: "./awbstatus.component.css",
})
export class AwbstatusComponent implements OnInit {
  awb: string = "";
  details: any[] = [];
  statusdata: any[] = [];
  seller: any;
  statusAWB: string = "";

  private refreshSubscription?: Subscription;
  private routeSubscription?: Subscription;

  constructor(
    private route: ActivatedRoute,
    private refreshservice: RefreshService,
    private router: Router,
    private apiservice: ApiService,
    private sellerService: SellerService,
    private http: HttpClient
  ) {}

  ngOnInit() {
    this.routeSubscription = this.route.paramMap.subscribe((params) => {
      this.awb = params.get("awb") || "";
      this.seller = this.sellerService.getItem("seller");
      this.fetchDetails();
      this.fetchStatus();
    });
    // this.refreshSubscription = this.refreshservice.refreshNeeded.subscribe(() => {
    //   this.fetchDetails();
    // });
  }

  ngOnDestroy(): void {
    this.routeSubscription?.unsubscribe();
    this.refreshSubscription?.unsubscribe();
  }

  fetchDetails(): void {
    let params = new HttpParams().set("uid", this.awb);
    this.http.get(this.apiservice.OrderDetails, { params }).subscribe(
      (res: any) => {
        if (res.status) {
          this.details = res.data.orders;
        }
      },
      (error) => {
        console.error("API Error:", error);
      }
    );
  }

  getActiveStatusIndex(currentStatus: string): number {
    return this.statusdata.findIndex((status) => status.name === currentStatus);
  }

  navigateToOrderDetail(orderID: string): void {
    const currentPath = this.router.url;
    const basePath = currentPath.includes("/user")
      ? "/user/orders/details"
      : "/admin/orders/details";

    this.router.navigate([basePath, orderID]);
  }

  fetchStatus(): void {
    let params = new HttpParams()
      .set("awb", this.awb)
      .set("sellerID", this.seller);
    this.statusAWB = this.awb;
    this.http.get(this.apiservice.AWBStatus, { params }).subscribe(
      (res: any) => {
        if (res.status) {
          this.statusdata = res.data;
        } else {
        }
      },
      (error) => {}
    );
  }

  navigateToTracking(awb: string) {

    debugger;
    if (awb == this.awb) {
      let params = new HttpParams()
        .set("awb", awb)
        .set("sellerID", this.seller);
      this.statusAWB = awb;
      this.http.get(this.apiservice.AWBStatus, { params }).subscribe(
        (res: any) => {
          if (res.status) {
            this.statusdata = res.data;
          } else {
            this.statusdata = [];
          }
        },
        (error) => {}
      );
    } else if (awb != this.awb) {
      let params = new HttpParams().set("awbnumber", awb);
      this.statusAWB = awb;
      this.http.post(this.apiservice.OLDAWBStatus,{}, { params }).subscribe(
        (res: any) => {
          if (res.status) {
            this.statusdata = res.data;
          } else {
            this.statusdata = [];
          }
        },
        (error) => {}
      );
    }
  }
}
