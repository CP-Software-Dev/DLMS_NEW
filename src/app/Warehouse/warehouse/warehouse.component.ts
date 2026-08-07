import { HttpClient, HttpParams } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../services/api.service';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { RefreshService } from '../../services/refresh.service';
@Component({
  selector: 'app-warehouse',
  templateUrl: './warehouse.component.html',
  styleUrl: './warehouse.component.css',
})
export class WarehouseComponent implements OnInit {

  warehouseEntries: any[] = [];
  isActive: string | undefined;
  pageIndex: number = 0;
  totalCount: number = 0;
  pageSize: number = 10;

  buttonText: string = 'Filters';
  buttonIcon: string = 'ri-filter-fill';
  showFiltersForm: boolean = false;

  sellerData: any[] = [];
  type: string = '';
  sellerId: string = '';

  currentFilters: any = {};

  private refreshSubscription?: Subscription;

  constructor(
    private router: Router,
    private apiservice: ApiService,
    private http: HttpClient,
    private refreshservice: RefreshService,
  ) { }


  makeActive(label: string) {
    this.isActive = label;
  }

  ngOnInit(): void {
    this.loadSellerData();
    this.applyFilters();
    this.loadData(this.pageIndex, this.pageSize);
    this.refreshSubscription = this.refreshservice.refreshNeeded.subscribe(
      () => {
        this.loadData(this.pageIndex, this.pageSize);
      },
    );
  }

  loadSellerData(): void {
    this.http.get<any>(this.apiservice.SellerData).subscribe((response) => {
      this.sellerData = response.data;
    });
  }

  exportToCSV() {
    this.fetchUserData()
      .then((allWarehouse) => {
        this.downloadCSV(allWarehouse);
      })
      .catch((error) => {
        // this.toastr.error('No Data to Export', 'Failure');
        console.error('Error fetching orders:', error);
      });
  }

  formatDate(date: string): string {
    return new Date(date).toISOString().split('T')[0];
  }

  toggleFiltersForm() {
    this.showFiltersForm = !this.showFiltersForm;
    this.buttonText = this.showFiltersForm ? 'Close' : 'Filters';
    this.buttonIcon = this.showFiltersForm ? 'ri-close-fill' : 'ri-filter-fill';
  }

  loadData(pageIndex: number, pageSize: number,
    filters: any = this.currentFilters,) {
    let params = new HttpParams()
          .set('page', (pageIndex + 1).toString())
          .set('dataCount', pageSize.toString());

    if (filters.type) {
      params = params.set('type', filters.type);
    }
    if (filters.sellerId && filters.sellerId !== '0') {
      params = params.set('institutionId', filters.sellerId);
    }

    this.http
      .get<any>(this.apiservice.Warehouse, { params })
      .subscribe((response) => {
        this.totalCount = response.data.total;
        this.warehouseEntries = response.data.warehouses;
      });
  }

  getFullAddress(entry: any): string {
    return (
      [entry.address1, entry.address2, entry.address3, entry.city]
        .filter((x) => x)
        .join(', ') + (entry.pincode ? ` - ${entry.pincode}` : '')
    );
  }

  handlePageEvent(event: { pageIndex: number; pageSize: number }) {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.loadData(this.pageIndex, this.pageSize);
  }

  fetchUserData(): Promise<any[]> {
    return new Promise((resolve, reject) => {
      this.http.get(this.apiservice.Warehouse).subscribe(
        (res: any) => {
          if (res.status) {
            resolve(res.data);
          } else {
            reject('Failed to fetch data');
          }
        },
        (error) => {
          reject(error);
        },
      );
    });
  }

  applyFilters() {
    this.currentFilters = {};

    if (this.sellerId) {
      this.currentFilters.sellerId = this.sellerId;
    }
    if (this.type) {
      this.currentFilters.type = this.type;
    }

    this.pageIndex = 0;

    this.loadData(this.pageIndex, this.pageSize, this.currentFilters);
  }

  clearFilters() {
    this.sellerId = '';
    this.currentFilters = {};
    this.type = '';
   
    this.loadData(this.pageIndex, this.pageSize, this.currentFilters);
    this.toggleFiltersForm();
  }

  downloadCSV(data: any[]) {
    const csvData = this.convertToCSV(data);
    const randomNumber = Math.floor(Math.random() * 90000) + 10000; // Generate a 5-digit random number
    const fileName = `Warewhouse_17185${randomNumber}.csv`;
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
    if (data.length === 0) {
      return '';
    }

    const headers = Object.keys(data[0]);
    const csvRows = [];
    csvRows.push(headers.join(','));
    for (const row of data) {
      const values = headers.map((header) => row[header]);
      csvRows.push(values.join(','));
    }
    return csvRows.join('\n');
  }

  editWarehouse(warehouse: any) {
    sessionStorage.setItem('warehouse', JSON.stringify(warehouse));
    this.router.navigate(['admin/warehouses/edit'], {
      state: {
        warehouse: warehouse,
      },
    });
  }

  navigateToAddWatehouse() {
    this.router.navigate(['admin/warehouses/add']);
  }
}
