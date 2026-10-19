import { Component, Input, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { HttpClient, HttpParams } from '@angular/common/http';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-shipmentdetails',
  templateUrl: './shipmentdetails.component.html',
  styleUrl: './shipmentdetails.component.css'
})
export class ShipmentdetailsComponent implements OnInit, OnChanges {
  @Input() orderIDInput: string = '';  

  orderID: string = '';
  orders: any[] = [];

  constructor(
    private http: HttpClient,
    private apiservice: ApiService,
    private route: ActivatedRoute,
    private router: Router,
    private toastr: ToastrService 
    
  ) {}

  ngOnInit(): void {
    if (this.orderIDInput) {
      this.orderID = this.orderIDInput;
    } else {
      this.orderID = this.route.snapshot.paramMap.get('orderID') || '';
    }
    this.fetchOrderDetails();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['orderIDInput'] && !changes['orderIDInput'].isFirstChange() && this.orderIDInput) {
      this.orderID = this.orderIDInput;
      this.fetchOrderDetails();
    }
  }

  fetchOrderDetails() {
    let params = new HttpParams().set('uid', this.orderID);
    this.http.get(this.apiservice.OrderDetails, { params }).subscribe(
      (res: any) => {
        if (res.status) {
          this.orders = res.data.orders;
        }
      },
      (error) => {
        console.error("API Error:", error);
      }
    );
  }

  getAddressTooltip(order: any): string {
    const address2Parts = order.address2.split('--');
    const address2 = address2Parts[0];
    return `${order.address1}, ${order.address2}, ${order.city}, ${order.state}, ${order.pincode}, ${order.contact}`;
  }

  navigateToAwbStatus(awb: string): void {
    this.router.navigate(['admin/status', awb]);
  }

  copyToClipboard(text: string | number): void {
    if (!text) return;
    navigator.clipboard.writeText(text.toString()).then(() => {
      this.toastr.success('Copied to clipboard');
    });
  }
  getRecipientAddress(order: any): string {
  return [order.address1, order.address2, order.city, order.state, order.pincode]
    .filter((part) => part)
    .join(', ');
}
}