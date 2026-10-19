import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormControl } from '@angular/forms';
import {
  trigger,
  state,
  style,
  animate,
  transition,
} from '@angular/animations';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
import { ApiService } from '../../services/api.service';
import { RefreshService } from '../../services/refresh.service';

@Component({
  selector: 'app-rejection-list',
  templateUrl: './rejection-list.component.html',
  styleUrl: './rejection-list.component.css',
  animations: [
    trigger('fadeInOut', [
      state(
        'void',
        style({
          opacity: 0,
        }),
      ),
      transition('void <=> *', animate(300)),
    ]),
  ],
})
export class RejectionListComponent implements OnInit {
  pageIndex: number = 0;
  pageSize: number = 10;
  rejectedData: any[] = [];
  currentFilters: any = {};
  totalOrders: number = 0;
  sellerData: any[] = [];
  kitnumber: string = '';
  lotID: string = '';
  sellerId: string = '';
  isExporting: boolean = false;

  selectedDateRange: { startDate: string; endDate: string } = {
    startDate: '',
    endDate: '',
  };

  private refreshSubscription?: Subscription;

  constructor(
    private apiservice: ApiService,
    private dialog: MatDialog,
    private http: HttpClient,
    private refreshservice: RefreshService,
    private router: Router,
    private toastr: ToastrService,
    private route: ActivatedRoute,
  ) {
    const endDate = new Date(); // Today
    const startDate = new Date(); // Clone today
    startDate.setDate(startDate.getDate() - 29); // Last 30 days

    this.selectedDateRange = {
      startDate: this.formatDate(startDate.toISOString()),
      endDate: this.formatDate(endDate.toISOString()),
    };
  }

  ngOnInit(): void {
    this.loadSellerData();
    this.applyFilters();
    this.fetchData(this.pageIndex, this.pageSize);
    this.refreshSubscription = this.refreshservice.refreshNeeded.subscribe(
      () => {
        this.fetchData(this.pageIndex, this.pageSize);
      },
    );
  }

  loadSellerData(): void {
    this.http.get<any>(this.apiservice.SellerData).subscribe((response) => {
      this.sellerData = response.data;
    });
  }

  formatDate(date: string): string {
    return new Date(date).toISOString().split('T')[0];
  }

  // "10/6/2026 10:22:33 AM" -> "6 Oct 2026"
  formatCreatedDate(value: string): string {
    if (!value) {
      return '';
    }
    const d = new Date(value);
    if (isNaN(d.getTime())) {
      return value.split(' ')[0];
    }
    return d.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  }

  copyAwb(awb: string): void {
    if (!awb) {
      return;
    }
    navigator.clipboard
      .writeText(awb)
      .then(() => this.toastr.success('AWB copied'))
      .catch(() => this.toastr.error('Could not copy AWB'));
  }

  onDateRangeSelected(dateRange: { startDate: string; endDate: string }): void {
    this.selectedDateRange = {
      startDate: this.formatDate(dateRange.startDate),
      endDate: this.formatDate(dateRange.endDate),
    };
  }

  fetchData(
    pageIndex: number,
    pageSize: number,
    filters: any = this.currentFilters,
  ) {
    let params = new HttpParams()
      .set('page', (pageIndex + 1).toString())
      .set('dataCount', pageSize.toString());

    if (filters.kitnumber) {
      params = params.set('kitnumber', filters.kitnumber);
    }
    if (filters.lotID) {
      params = params.set('orderId', Number(filters.lotID));
    }
    // if (filters.sellerId && filters.sellerId !== '0') {
    //   params = params.set('sellerId', 15);
    // }

    params = params.set('sellerId', 15);

    let startDate = filters.startDate;
    let endDate = filters.endDate;

    if (!startDate || !endDate) {
      const currentDate = new Date();
      const adjustedDate = new Date(
        currentDate.getTime() - currentDate.getTimezoneOffset() * 60000,
      )
        .toISOString()
        .split('T')[0];
      startDate = startDate || adjustedDate;
      endDate = endDate || adjustedDate;
    }

    params = params.set('startDate', startDate).set('endDate', endDate);

    this.http.get(this.apiservice.RejectedOrders, { params }).subscribe(
      (res: any) => {
        this.rejectedData = res.data.orders;
        this.totalOrders = res.data.total;
      },
      (error) => { },
    );
  }

  applyFilters() {
    this.currentFilters = {};

    if (this.sellerId) {
      this.currentFilters.sellerId = this.sellerId;
    }
    if (this.kitnumber) {
      this.currentFilters.kitnumber = this.kitnumber;
    }
    if (this.lotID) {
      this.currentFilters.lotID = this.lotID;
    }

    if (this.selectedDateRange) {
      const { startDate, endDate } = this.selectedDateRange;
      this.currentFilters.startDate = startDate;
      this.currentFilters.endDate = endDate;
    }
    this.pageIndex = 0;

    this.fetchData(this.pageIndex, this.pageSize, this.currentFilters);
  }

  handlePageEvent(event: { pageIndex: number; pageSize: number }) {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.fetchData(this.pageIndex, this.pageSize);
  }

  clearFilters() {
    this.sellerId = '';
    this.currentFilters = {};
    this.kitnumber = '';
    this.lotID = '';
    const currentDate = new Date();
    const startDate = new Date(); // Clone today
    startDate.setDate(startDate.getDate() - 29);
    this.selectedDateRange = {
      startDate: this.formatDate(startDate.toISOString()),
      endDate: this.formatDate(currentDate.toISOString()),
    };
    this.currentFilters.startDate = this.selectedDateRange.startDate;
    this.currentFilters.endDate = this.selectedDateRange.endDate;

    this.fetchData(this.pageIndex, this.pageSize, this.currentFilters);
  }

  exportToCSV(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.isExporting = true;
      this.fetchAllData()
        .then((allOrders) => {
          this.downloadCSV(allOrders);
          this.isExporting = false;
          resolve();
        })
        .catch((error) => {
          console.error('Error fetching orders:', error);
          this.isExporting = false;
          reject(error);
        });
    });
  }

  downloadCSV(data: any[]) {
    const csvData = this.convertToCSV(data);
    const randomNumber = Math.floor(Math.random() * 90000) + 10000; // Generate a 5-digit random number
    const fileName = `Order_17185${randomNumber}.csv`;
    const blob = new Blob([csvData], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }

  convertToCSV(data: any[]) {
    const columns = [
      { key: 'orderID', header: 'Order ID' },
      { key: 'cardID', header: 'Card ID' },
      { key: 'kitNumber', header: 'Kit Number' },
      { key: 'company', header: 'Company' },
      { key: 'createdBy', header: 'Created By' },
      { key: 'date', header: 'Created At' },
      { key: 'errorMsg', header: 'Error Message' },
    ];

    const csvRows = [];

    csvRows.push(columns.map((c) => c.header).join(','));

    data.forEach((row) => {
      csvRows.push(columns.map((c) => row[c.key] ?? '').join(','));
    });

    return csvRows.join('\n');
  }

  fetchAllData(): Promise<any[]> {
    return new Promise((resolve, reject) => {
      let params = new HttpParams().set('page', '1').set('dataCount', '1000');

      if (this.currentFilters.orderIds) {
        params = params.set('orderId', this.currentFilters.orderIds.join(','));
      }

      if (this.currentFilters.kitnumber) {
        params = params.set('kitnumber', this.currentFilters.kitnumber);
      }

      if (this.currentFilters.sellerId) {
        params = params.set('sellerId', this.currentFilters.sellerId);
      }

      if (
        this.currentFilters.statusId !== undefined &&
        this.currentFilters.statusId !== null
      ) {
        params = params.set(
          'statusID',
          this.currentFilters.statusId.toString(),
        );
      }

      let startDate = this.currentFilters.startDate;
      let endDate = this.currentFilters.endDate;

      if (!startDate || !endDate) {
        const currentDate = new Date();
        const adjustedDate = new Date(
          currentDate.getTime() - currentDate.getTimezoneOffset() * 60000,
        )
          .toISOString()
          .split('T')[0];

        startDate = startDate || adjustedDate;
        endDate = endDate || adjustedDate;
      }

      params = params.set('startDate', startDate).set('endDate', endDate);

      // Single API call
      this.http.get(this.apiservice.RejectedOrders, { params }).subscribe(
        (res: any) => {
          if (res.status) {
            const orders = res.data?.orders || [];

            if (!orders.length) {
              this.toastr.warning('No data to export');
              reject('No data');
              return;
            }

            resolve(orders);
          } else {
            this.toastr.error('Failed to fetch data');
            reject('Failed to fetch data');
          }
        },
        (error) => {
          console.error('API Error:', error);
          this.toastr.error('Something went wrong');
          reject(error);
        },
      );
    });
  }
}