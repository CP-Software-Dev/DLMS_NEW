import { HttpClient, HttpParams } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-rto-importlist',
  templateUrl: './rto-importlist.component.html',
  styleUrl: './rto-importlist.component.css'
})
export class RtoImportlistComponent implements OnInit {
  showFiltersForm: boolean = false;
  buttonText: string = 'Filters';
  buttonIcon: string = 'ri-filter-fill';

  sellerData: any[] = [];
  importList: any[] = [];
  exportFileData: any[] = [];

  searchTerm: string = '';

  sellerId: string = '';
  status: string = '';
  FileId: string = '';

  currentFilters: any = {};
  totalCount: number = 0;

  pageIndex: number = 0;
  pageSize: number = 10;

  defaultStartDate: string = '';
  defaultEndDate: string = '';
  selectedDateRange: { startDate: string, endDate: string } = { startDate: '', endDate: '' };

  constructor(
    private apiservice: ApiService,
    private http: HttpClient,
    private router: Router
  ) {
    const startDate = '01-01-2024';
    const currentDate = new Date();
    this.defaultStartDate = this.formatDate(startDate);
    this.defaultEndDate = this.formatDate(currentDate.toISOString());

    this.selectedDateRange = {
      startDate: this.defaultStartDate,
      endDate: this.defaultEndDate
    };
  }

  formatDate(date: string): string {
    return new Date(date).toISOString().split('T')[0];
  }

  onDateRangeSelected(dateRange: { startDate: string, endDate: string }): void {
    this.selectedDateRange = {
      startDate: this.formatDate(dateRange.startDate),
      endDate: this.formatDate(dateRange.endDate)
    };
  }

  ngOnInit(): void {
    this.fetchImportList(this.pageIndex, this.pageSize);
    this.loadSellerData();
  }

  loadSellerData(): void {
    this.http.get<any>(this.apiservice.SellerData).subscribe(response => {
      this.sellerData = response.data;
    });
  }

  fetchImportList(pageIndex: number, pageSize: number, filters: any = this.currentFilters) {
    let params = new HttpParams()
      .set('page', (pageIndex + 1).toString())
      .set('dataCount', pageSize.toString());

    if (filters.sellerId) {
      params = params.set('institutionId', filters.sellerId);
    }
    if (filters.FileId) {
      params = params.set('fileId', filters.FileId);
    }
    if (filters.status) {
      params = params.set('status', filters.status);
    }

    let startDate = filters.startDate;
    let endDate = filters.endDate;

    if (!startDate || !endDate) {
      const currentDate = new Date();
      const adjustedDate = new Date(currentDate.getTime() - (currentDate.getTimezoneOffset() * 60000)).toISOString().split('T')[0];
      startDate = startDate || adjustedDate;
      endDate = endDate || adjustedDate;
    }

    params = params.set('startDate', startDate).set('endDate', endDate);

    this.http.get(this.apiservice.RtoImportList, { params })
      .subscribe((res: any) => {
        if (res.status) {
          this.importList = res.data.files;
          this.totalCount = res.data.dataCount;
        }
      }, error => {
      });
  }

  get filteredImportList(): any[] {
    if (!this.searchTerm?.trim()) {
      return this.importList;
    }
    const term = this.searchTerm.trim().toLowerCase();
    return this.importList.filter(file =>
      (file.filename || '').toLowerCase().includes(term) ||
      (file.institution || '').toLowerCase().includes(term) ||
      String(file.rowNum || '').toLowerCase().includes(term)
    );
  }

  applyFilters() {
    this.currentFilters = {};

    if (this.sellerId) {
      this.currentFilters.sellerId = this.sellerId;
    }
    if (this.FileId) {
      this.currentFilters.FileId = this.FileId;
    }
    if (this.status) {
      this.currentFilters.status = this.status;
    }

    if (this.selectedDateRange) {
      const { startDate, endDate } = this.selectedDateRange;
      this.currentFilters.startDate = startDate;
      this.currentFilters.endDate = endDate;
    }

    this.pageIndex = 0;
    this.fetchImportList(this.pageIndex, this.pageSize, this.currentFilters);
  }

  clearFilters() {
    this.sellerId = '';
    this.status = '';
    this.FileId = '';
    this.searchTerm = '';
    this.selectedDateRange = {
      startDate: this.defaultStartDate,
      endDate: this.defaultEndDate
    };
    this.currentFilters = {};
    this.pageIndex = 0;

    this.fetchImportList(this.pageIndex, this.pageSize, this.currentFilters);
    this.showFiltersForm = false;
    this.buttonText = 'Filters';
    this.buttonIcon = 'ri-filter-fill';
  }

  clearAllFilters() {
    this.clearFilters();
  }

  getActiveFiltersList(): { key: string, label: string }[] {
    const list: { key: string, label: string }[] = [];

    if (this.sellerId) {
      const seller = this.sellerData.find(s => s.id === this.sellerId || s.id === Number(this.sellerId));
      list.push({ key: 'sellerId', label: seller ? seller.name : 'Seller' });
    }
    if (this.FileId) {
      list.push({ key: 'FileId', label: `File: ${this.FileId}` });
    }
    if (this.status) {
      list.push({ key: 'status', label: `Status: ${this.status}` });
    }
    if (
      this.selectedDateRange &&
      (this.selectedDateRange.startDate !== this.defaultStartDate ||
        this.selectedDateRange.endDate !== this.defaultEndDate)
    ) {
      list.push({
        key: 'dateRange',
        label: `${this.selectedDateRange.startDate} → ${this.selectedDateRange.endDate}`
      });
    }

    return list;
  }

  removeFilter(key: string) {
    if (key === 'sellerId') this.sellerId = '';
    if (key === 'FileId') this.FileId = '';
    if (key === 'status') this.status = '';
    if (key === 'dateRange') {
      this.selectedDateRange = {
        startDate: this.defaultStartDate,
        endDate: this.defaultEndDate
      };
    }
    this.applyFilters();
  }

  toggleFiltersForm() {
    this.showFiltersForm = !this.showFiltersForm;
    if (this.showFiltersForm) {
      this.buttonText = 'Close';
      this.buttonIcon = 'ri-close-fill';
    } else {
      this.buttonText = 'Filters';
      this.buttonIcon = 'ri-filter-fill';
    }
  }

  isActive: string = 'All';

  makeActive(label: string) {
    this.isActive = label;
  }

  navigateToOrders() {
    this.router.navigate(['admin/rto']);
  }

  handlePageEvent(event: { pageIndex: number, pageSize: number }) {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.fetchImportList(this.pageIndex, this.pageSize);
  }

  exportFile(fileID: string): void {
    const params = new HttpParams().set('fileID', fileID);
    this.http.get(this.apiservice.ExportRtoFile, { params }).subscribe((res: any) => {
      if (res.status) {
        this.exportFileData = res.data;
        this.downloadCSV(this.exportFileData, fileID);
      } else {
        console.error('Failed to fetch data');
      }
    }, (error) => {
      console.error('HTTP Error:', error);
    });
  }

  downloadCSV(data: any[], fileID: string) {
    const csvData = this.convertToCSV(data);
    const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const fileName = `RTO_File_${fileID}_${date}.csv`;
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
    const headers = Object.keys(data[0]);
    const csvRows = [];
    csvRows.push(headers.join(','));
    for (const row of data) {
      const values = headers.map(header => row[header]);
      csvRows.push(values.join(','));
    }
    return csvRows.join('\n');
  }
}