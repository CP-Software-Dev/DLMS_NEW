import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../services/api.service';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { AddbankComponent } from '../addbank/addbank.component';
import { MatDialog } from '@angular/material/dialog';
import { RefreshService } from '../../services/refresh.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-bank-list',
  templateUrl: './bank-list.component.html',
  styleUrl: './bank-list.component.css'
})
export class BankListComponent implements OnInit {

  bankData: any[] = [];
  private refreshSubscription?: Subscription;

  constructor(private apiservice : ApiService , private refreshservice: RefreshService , private router: Router , private dialog: MatDialog,  private http: HttpClient)
  {

  }

ngOnInit(): void {
  this.fetchData();
  this.refreshSubscription = this.refreshservice.refreshNeeded.subscribe(() => {
    this.fetchData();
  });
}
editDetails(data: any): void {
  const dialogData = {
    bankID : data.id,
    bankName: data.name,
    salesPerson: data.salesPersonId,
    couriers : this.getCourierIds(data.couriers) ,
    accountPlanID: data.accountPlanID,
  };

  this.dialog.open(AddbankComponent, {
    data: dialogData
  });
}


openDialog(): void {
  this.dialog.open(AddbankComponent);
}

fetchData() : void {
  this.http.get(this.apiservice.BankList)
      .subscribe((res: any) => {
        if (res.status) {
          this.bankData = res.data;
        }
      }, error => {
        console.error("API Error:", error);
      });
}

getCouriers(couriers: any[]): string {
  if (!couriers) return ' ';
  return couriers
    .filter(courier => courier.isSelected === 1)
    .map(courier => courier.name)
    .join(', ');
}


getCourierIds(couriers: any[]): number[] {
  if (!couriers) return [];
  return couriers
  .filter(courier => courier.isSelected === 1)
  .map(courier => courier.courierId);
}



}
