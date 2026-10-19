import { HttpClient, HttpParams } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, FormBuilder } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-import-list',
  templateUrl: './import-list.component.html',
  styleUrl: './import-list.component.css',
})
export class ImportListComponent implements OnInit {
  showFiltersForm: boolean = false;
  buttonText: string = 'Filters';
  buttonIcon: string = 'ri-filter-fill';
  sellerData: any[] = [];
  importList: any[] = [];
  filteredImportList: any[] = []; 
  exportFileData: any[] = [];
  exportInstaFileData: any[] = [];
  sellerId: string = '';
  status: string = '';
  FileId: string = '';
  currentFilters: any = {};
  totalUsers: number = 0;

  pageIndex: number = 0;
  pageSize: number = 10;
  selectedDateRange: { startDate: string; endDate: string } = {
    startDate: '',
    endDate: '',
  };

  appliedFilters: { sellerId: string; status: string; fileId: string } = {
    sellerId: '',
    status: '',
    fileId: '',
  };

  // ----- search -----
  searchTerm: string = '';
  private searchDebounce: any;

  constructor(
    private apiservice: ApiService,
    private http: HttpClient,
    private router: Router,
    private fb: FormBuilder,
  ) {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 29);

    this.selectedDateRange = {
      startDate: this.formatDate(startDate.toISOString()),
      endDate: this.formatDate(endDate.toISOString()),
    };
  }

  formatDate(date: string): string {
    return new Date(date).toISOString().split('T')[0];
  }

  onDateRangeSelected(dateRange: { startDate: string; endDate: string }): void {
    this.selectedDateRange = {
      startDate: this.formatDate(dateRange.startDate),
      endDate: this.formatDate(dateRange.endDate),
    };
  }

  ngOnInit(): void {
    this.loadSellerData();
    this.applyFilters();
  }

  loadSellerData(): void {
    this.http.get<any>(this.apiservice.SellerData).subscribe((response) => {
      this.sellerData = response.data;
    });
  }

  fetchImportList(
    pageIndex: number,
    pageSize: number,
    filters: any = this.currentFilters,
  ) {
    let params = new HttpParams()
      .set('page', (pageIndex + 1).toString())
      .set('dataCount', pageSize.toString());

    if (filters.sellerId) {
      params = params.set('sellerId', filters.sellerId);
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
      const adjustedDate = new Date(
        currentDate.getTime() - currentDate.getTimezoneOffset() * 60000,
      )
        .toISOString()
        .split('T')[0];
      startDate = startDate || adjustedDate;
      endDate = endDate || adjustedDate;
    }

    params = params.set('startDate', startDate).set('endDate', endDate);

    this.http.get(this.apiservice.ImportList, { params }).subscribe(
      (res: any) => {
        if (res.status) {
          this.importList = res.data.importFiles;
          this.totalUsers = res.data.dataCount;
          this.applySearch(); 
        }
      },
      (error) => {},
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

    this.appliedFilters = {
      sellerId: this.sellerId,
      status: this.status,
      fileId: this.FileId,
    };

    this.fetchImportList(this.pageIndex, this.pageSize, this.currentFilters);

    this.showFiltersForm = false;
    this.buttonText = 'Filters';
    this.buttonIcon = 'ri-filter-fill';
  }

  clearFilters() {
    this.dateRange.reset({
      start: new Date(),
      end: new Date(),
    });
    this.sellerId = '';
    this.status = '';
    this.FileId = '';

    const currentDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 29);
    this.selectedDateRange = {
      startDate: this.formatDate(startDate.toISOString()),
      endDate: this.formatDate(currentDate.toISOString()),
    };
    this.currentFilters.startDate = this.selectedDateRange.startDate;
    this.currentFilters.endDate = this.selectedDateRange.endDate;

    this.appliedFilters = { sellerId: '', status: '', fileId: '' };

    this.fetchImportList(this.pageIndex, this.pageSize, this.currentFilters);
    this.toggleFiltersForm();
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

  dateRange = new FormGroup({
    start: new FormControl(),
    end: new FormControl(),
  });

  isActive: string = 'All';

  makeActive(label: string) {
    this.isActive = label;
  }

  navigateToOrders() {
    this.router.navigate(['admin/orders']);
  }

  handlePageEvent(event: { pageIndex: number; pageSize: number }) {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.fetchImportList(this.pageIndex, this.pageSize);
  }

  exportFile(fileID: string): void {
    const params = new HttpParams().set('fileID', fileID);
    this.http.get(this.apiservice.ExportFile, { params }).subscribe(
      (res: any) => {
        if (res.status) {
          this.exportFileData = res.data;
          this.downloadCSV(this.exportFileData, fileID);
        } else {
          console.error('Failed to fetch data');
        }
      },
      (error) => {
        console.error('HTTP Error:', error);
      },
    );
  }

  exportShipment(fileID: string, bank: string, type: string): void {
    const params = new HttpParams().set('fileID', fileID);
    this.http.get(this.apiservice.ShipmentByFile, { params }).subscribe(
      (res: any) => {
        if (res.status) {
          this.exportFileData = res.data;
          this.downloadShipmentCSV(this.exportFileData, fileID, bank, type);
        } else {
          console.error('Failed to fetch data');
        }
      },
      (error) => {
        console.error('HTTP Error:', error);
      },
    );
  }

  downloadShipmentCSV(data: any[], fileID: string, bank: string, type: string) {
    const csvData = this.convertToCSV(data);
    const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    let fileType = '';
    if (type == '1') {
      fileType = 'Perso';
    } else if (type == '2') {
      fileType = 'Insta';
    }
    const fileName = `Shipment_${bank}_${fileType}_${date}.csv`;
    const blob = new Blob([csvData], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }

  downloadCSV(data: any[], fileID: string) {
    const csvData = this.convertToCSV(data);
    const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const fileName = `File_${fileID}_${date}.csv`;
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
      const values = headers.map((header) => row[header]);
      csvRows.push(values.join(','));
    }
    return csvRows.join('\n');
  }

  // ---------  filter data based on bank or status ----------

  getActiveFiltersList(): { key: string; label: string }[] {
    const filters: { key: string; label: string }[] = [];

    if (this.appliedFilters.sellerId) {
      const seller = this.sellerData.find(
        (s) => s.id === this.appliedFilters.sellerId,
      );
      filters.push({
        key: 'seller',
        label: `Bank: ${seller ? seller.name : this.appliedFilters.sellerId}`,
      });
    }
    if (this.appliedFilters.status) {
      filters.push({
        key: 'status',
        label: `Status: ${this.appliedFilters.status}`,
      });
    }
    if (this.appliedFilters.fileId) {
      filters.push({
        key: 'fileId',
        label: `File ID: ${this.appliedFilters.fileId}`,
      });
    }

    return filters;
  }

  removeFilter(key: string) {
    if (key === 'seller') {
      this.sellerId = '';
    }
    if (key === 'status') {
      this.status = '';
    }
    if (key === 'fileId') {
      this.FileId = '';
    }
    this.applyFilters();
  }

  clearAllFilters() {
    this.sellerId = '';
    this.status = '';
    this.FileId = '';

    const currentDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 29);
    this.selectedDateRange = {
      startDate: this.formatDate(startDate.toISOString()),
      endDate: this.formatDate(currentDate.toISOString()),
    };

    this.applyFilters();
  }

  // ---------- search data direct using import id and file name ----------

  onSearchChange() {
    clearTimeout(this.searchDebounce);
    this.searchDebounce = setTimeout(() => {
      this.applySearch();
    }, 100);
  }

  applySearch() {
    const term = this.searchTerm ? this.searchTerm.trim().toLowerCase() : '';

    if (!term) {
      this.filteredImportList = this.importList;
      return;
    }

    this.filteredImportList = this.importList.filter((file) => {
      const name = (file.name || '').toString().toLowerCase();
      const id = (file.id || '').toString().toLowerCase();
      return name.includes(term) || id.includes(term);
    });
  }
}