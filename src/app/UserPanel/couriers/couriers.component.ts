import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../services/api.service';
import { HttpClient, HttpParams } from '@angular/common/http';
import { ManagecourierComponent } from '../../Dialog/managecourier/managecourier.component';
import { MatDialog } from '@angular/material/dialog';
import { SellerService } from '../../services/seller.service';
import { error } from 'console';
import { Observable } from 'rxjs/internal/Observable';
import { data } from 'jquery';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-couriers',
  templateUrl: './couriers.component.html',
  styleUrl: './couriers.component.css'
})
export class CouriersComponent implements OnInit {

  pageIndex: number = 0;
  pageSize: number = 10;
  courierEntries: any[] = [];
  currentPage: number = 0;
  seller: any;

  constructor(private apiservice: ApiService,
    private http: HttpClient,
    private sellerService: SellerService,
    private toastr: ToastrService,
    private dailog: MatDialog) {

  }

  ngOnInit(): void {

    this.seller = this.sellerService.getItem('seller')
    this.fetchCouriers();
  }



  fetchCouriers(): void {
    let params = new HttpParams()
      .set('institutionId', this.seller);
    this.http.get(this.apiservice.BankList, { params }).subscribe((res: any) => {
      if (res.status) {
        this.courierEntries = res.data[0].couriers.filter((courier: any) => courier.isSelected === 1);
      }
    })
  }

  getCourierEntriesForCurrentPage(): any[] {
    const startIndex = this.currentPage * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    return this.courierEntries.slice(startIndex, endIndex);
  }

  handlePageEvent(event: { pageIndex: number, pageSize: number }) {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;

  }

  openDialog1(entry: any): void {

    const sellerID = Number(this.seller);
    const courierId = Number(entry.courierId)
    let params = new HttpParams()
      .set('courierId', courierId);
    this.http.get(this.apiservice.CourierCredentials, { params }).subscribe(
      (res: any) => {
        if (res.status && res.data) {
          this.dailog.open(ManagecourierComponent, {
            data: { isEdit: true, courierData: res.data}
          });
        } else {
          console.error('Error fetching courier details:', res.errors);
          this.toastr.error('Failure','No Data to Edit');
        }
      },
      error => {
        console.error('An error occurred:', error);
      }
    );
  }

  openDialog(entry: any): void {
    this.dailog.open(ManagecourierComponent, {
      data: { isEdit: false, courierId: entry.courierId }
    });
  }

  fetchCourier(courierId: number): Observable<any> {
    const sellerID = Number(this.seller);
    let params = new HttpParams()
      .set('courierId', courierId);

    debugger;

    return this.http.get(this.apiservice.CourierCredentials, { params });
  }

  // openDialog(entry: any) {
  //   this.fetchCourier(entry.courierId)
  //   this.dailog.open(ManagecourierComponent, {
  //     data: {

  //     }
  //   })
  // }

  // fetchCourier(courierId: number): void {
  //   let params = new HttpParams()
  //   .set('institutionId',this.seller)
  //   .set('courierId', courierId);

  //   this.http.get(this.apiservice.CourierCredentials, {params}).subscribe((res:any)=>
  //   {
  //     if(res.status)
  //     {

  //     }
  //     else
  //     {

  //     }
  //   }, error=>
  //   {

  //   })

  // }


}
