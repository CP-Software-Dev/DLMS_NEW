import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { HttpClient, HttpParams } from '@angular/common/http';

@Component({
  selector: 'app-shipmentdetails',
  templateUrl: './shipmentdetails.component.html',
  styleUrl: './shipmentdetails.component.css'
})
export class ShipmentdetailsComponent implements OnInit {
  orderID: string='';
  orders: any[] = [];

  constructor(private http: HttpClient, private apiservice:ApiService, private route: ActivatedRoute , private router: Router) {}

  ngOnInit(): void {
    this.orderID = this.route.snapshot.paramMap.get('orderID') || '';
    this.fetchOrderDetails();
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
  const address2 = address2Parts[0]; // Extract part before '--'
  return `${order.address1}, ${order.address2}, ${order.city}, ${order.state}, ${order.pincode}, ${order.contact}`;
}

navigateToAwbStatus(awb: string): void {
  this.router.navigate(['admin/status', awb]);
}
}
