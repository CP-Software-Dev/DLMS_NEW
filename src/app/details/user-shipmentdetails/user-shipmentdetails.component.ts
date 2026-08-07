import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { HttpClient, HttpParams } from '@angular/common/http';
import { RefreshService } from '../../services/refresh.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-user-shipmentdetails',
  templateUrl: './user-shipmentdetails.component.html',
  styleUrl: './user-shipmentdetails.component.css'
})
export class UserShipmentdetailsComponent {

  constructor(private route: ActivatedRoute , private refreshservice : RefreshService , private http: HttpClient, private apiservice : ApiService ){}

  orderID: string='';
  orders: any[] = [];

  private refreshSubscription?: Subscription;
  private routeSubscription?: Subscription;

  // ngOnInit(): void {
  //   this.orderID = this.route.snapshot.paramMap.get('orderID') || '';
  //   this.fetchOrderDetails();
  // }

  ngOnInit(): void {


    this.refreshSubscription = this.refreshservice.refreshNeeded.subscribe(() => {
      this.fetchOrderDetails();
    });
  }


  ngOnDestroy(): void {
    this.refreshSubscription?.unsubscribe();
  }

  fetchOrderDetails(){
    let params = new HttpParams().set('uid',this.orderID);
    this.http.get(this.apiservice.OrderDetails, { params })
        .subscribe((res: any) => {
          if (res.status) {
            this.orders = res.data.orders;
            this.refreshservice.triggerRefresh(); 
          }
        }, error => {
          console.error("API Error:", error);
        });
  }
}
