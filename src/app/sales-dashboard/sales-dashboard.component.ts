import { Component, OnInit } from '@angular/core';
import { ApiService } from '../services/api.service';
import { HttpClient, HttpParams } from '@angular/common/http';
import { MatDialog } from '@angular/material/dialog';
import { Subscription } from 'rxjs';
import { RefreshService } from '../services/refresh.service';
import { SalespersonDialogComponent } from '../Dialog/salesperson-dialog/salesperson-dialog.component';

@Component({
  selector: 'app-sales-dashboard',
  templateUrl: './sales-dashboard.component.html',
  styleUrl: './sales-dashboard.component.css'
})
export class SalesDashboardComponent implements OnInit {

  constructor(private dialog: MatDialog, private apiservice : ApiService , private http: HttpClient ,private refreshservice: RefreshService ) {}


  pageIndex: number = 0;
  pageSize: number = 10;
  data: any[] = [];
  private refreshSubscription?: Subscription;

  ngOnInit(): void {
    this.fetchData(this.pageIndex, this.pageSize);
    this.refreshSubscription = this.refreshservice.refreshNeeded.subscribe(() => {
      this.fetchData(this.pageIndex, this.pageSize);
    });
  }

  fetchData(pageIndex: number, pageSize: number) : void {
    let params = new HttpParams()
    .set('page', (pageIndex + 1).toString())
    .set('dataCount', pageSize.toString());

    this.http.get(this.apiservice.SalesPerson ,{params}).subscribe((res: any) => {
      if(res.status) {
        this.data = res.data;
      }
    },
      error => {
        console.error("API Error:", error);
    })
  } 

  openDialog(): void {
    this.dialog.open(SalespersonDialogComponent);
  }

  editDetails(data: any): void {
    const dialogData = {
      id: data.id,
      name : data.name,
      email: data.email,
      contact: data.contact,
    };
  
    this.dialog.open(SalespersonDialogComponent, {
      data: dialogData
    });
  }

}
