import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Subscription } from 'rxjs';
import { RefreshService } from '../../services/refresh.service';

@Component({
  selector: 'app-orderdetails',
  templateUrl: './orderdetails.component.html',
  styleUrl: './orderdetails.component.css'
})
export class OrderdetailsComponent implements OnInit {
  orderID: string='';
  orders: any[] = [];
  private refreshSubscription?: Subscription;
  private routeSubscription?: Subscription;

  constructor(private http: HttpClient, private refreshservice : RefreshService , private router : Router , private apiservice:ApiService, private route: ActivatedRoute) {}

  ngOnInit(): void {
    this.routeSubscription = this.route.paramMap.subscribe(params => {
      this.orderID = params.get('orderID') || '';
      this.fetchOrderDetails();
    });

    // this.refreshSubscription = this.refreshservice.refreshNeeded.subscribe(() => {
    //   this.fetchOrderDetails();
    // });
  }

  ngOnDestroy(): void {
    this.routeSubscription?.unsubscribe();
    this.refreshSubscription?.unsubscribe();
  }

fetchOrderDetails(){
  let params = new HttpParams().set('uid',this.orderID);
  this.http.get(this.apiservice.OrderDetails, { params })
      .subscribe((res: any) => {
        if (res.status) {
          this.orders = res.data.orders;
        }
      }, error => {
        console.error("API Error:", error);
      });
}

getAddressTooltip(order: any): string {
  const address2Parts = order.address2.split('--');
  const address2 = address2Parts[0];
  return `${order.address1}, ${order.address2}, ${order.city}, ${order.state}, ${order.pincode}, ${order.contact}`;
}

navigateToAwbStatus(awb: string): void {
  this.router.navigate(['admin/status', awb]);
}
}
