import { Component, OnInit } from "@angular/core";
import { ApiService } from "../../services/api.service";
import { HttpClient, HttpParams } from "@angular/common/http";
import { MatDialog } from "@angular/material/dialog";
import { AddressupdateComponent } from "../../Dialog/addressupdate/addressupdate.component";
import { Subscription } from "rxjs";
import { RefreshService } from "../../services/refresh.service";
import { ToastrService } from "ngx-toastr";
@Component({
  selector: "app-update-address",
  templateUrl: "./update-address.component.html",
  styleUrl: "./update-address.component.css",
})
export class UpdateAddressComponent implements OnInit {
  private refreshSubscription?: Subscription;

  ngOnInit(): void {
    this.refreshSubscription = this.refreshService.refreshNeeded.subscribe(
      () => {
        if (this.searchText.trim()) {
          this.searchOrder();
        }
      }
    );
  }

  constructor(
    private api: ApiService,
    private http: HttpClient,
    private dialog: MatDialog,
    private refreshService: RefreshService,
    private toastr : ToastrService
  ) {}

  searchText: string = "";
  orders: any[] = [];
  isSearched: boolean = false;
  isLoading: boolean = false;

  searchOrder() {
    if (!this.searchText.trim()) {
      this.toastr.warning("Please enter Kit Number or Order ID", "Warning");
      return;
    }

    this.isSearched = true;
    this.orders = [];
    this.isLoading = true;

    let params = new HttpParams().set("uid", this.searchText);

    this.http.get(this.api.OrderSearch, { params }).subscribe(
      (res: any) => {
        this.isLoading = false;

        if (res.status && res.data?.length > 0) {
          this.orders = res.data; // ✅ FIXED
        } else {
          this.orders = [];
        }
      },
      (error) => {
        this.isLoading = false;
        this.orders = [];
        console.error("API Error:", error);
      }
    );
  }

  clearSearch(){
    this.searchText = '';
    this.orders = [];
  }

  rtoEditDialog(order: any): void {
    this.dialog.open(AddressupdateComponent, {
      data: {
        name: order.customer,
        orderId: order.orderID,
        kitNumber: order.kitNumber,
        address1: order.address1,
        address2: order.address2,
        city: order.city,
        state: order.state,
        pincode: order.pincode,
        contact: order.contact,
      },
    });
  }
}
