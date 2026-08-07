import { Component, HostListener, ElementRef, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormGroup, FormControl } from '@angular/forms';
import { HttpClient, HttpParams } from '@angular/common/http';
import { ApiService } from '../../../services/api.service';
import { error } from 'node:console';
import { ToastrService } from 'ngx-toastr';
import { SellerService } from '../../../services/seller.service';

interface StatusData {
  id: number;
  name: string;
  shortName: string;
  description: string;
  createdAt: string;
  role: number;
  isActive: number;
}

@Component({
  selector: 'app-userorder-reports',
  templateUrl: './userorder-reports.component.html',
  styleUrl: './userorder-reports.component.css',
})
export class UserorderReportsComponent implements OnInit {
  reportName: string = '';
  selectedReportType: string = '';
  dateRange = new FormGroup({
    start: new FormControl(),
    end: new FormControl(),
  });
  orderCategoryType: number | null = null;

  selectedStatuses: any[] = [];
  filteredStatuses: any[] = [];
  sellerData: any[] = [];
  reportData: any[] = [];
  searchText: string = '';
  selectedStatusIds: any[] = []; // Store status IDs
  selectedStatusNames: any[] = []; // Store status names
  dropdownOpen: boolean = false;
  allSelected: boolean = false;
  sellerId: any;
  serviceType: number = 0;
  selectAllOrderChecked: boolean = false;
  pageIndex: number = 0;
  pageSize: number = 1000000;
  isCreating: boolean = false;

  selectedDateRange: { startDate: string; endDate: string } = {
    startDate: '',
    endDate: '',
  };

  constructor(
    private router: Router,
    private toastr: ToastrService,
    private http: HttpClient,
    private sellerService: SellerService,
    private apiservice: ApiService,
  ) {}

  ngOnInit(): void {
    this.filterStatuses();
    this.serviceType = Number(localStorage.getItem('serviceType'));
    this.sellerId = this.sellerService.getItem('seller');

    if (this.serviceType === 1) {
      this.orderCategoryType = 2; // default Insta
    }

    if (this.serviceType === 2) {
      this.orderCategoryType = 2;
    }

    if (this.serviceType === 3) {
      this.orderCategoryType = 3;
    }
  }

  orderCheckboxes = [
    { id: 'OrderID', label: 'Order ID', checked: false },
    { id: 'CardID', label: 'Card ID', checked: false },
    { id: 'KitNumber', label: 'kit Number', checked: false },
    { id: 'Customer', label: 'Customer Name', checked: false },
    { id: 'Contact', label: 'Phone No.', checked: false },
    { id: 'Date', label: 'Order Date', checked: false },
    { id: 'Courier', label: 'Courier', checked: false },
    { id: 'Awb', label: 'AWB Number', checked: false },
    { id: 'OrderStatus', label: 'Order Status', checked: false },
    { id: 'ShipmentStatus', label: 'Shipment Status', checked: false },
    { id: 'StatusUpdateAt', label: 'Status Updated At', checked: false },
    { id: "DeliveredDate", label: "Delivery Date", checked: false },
    { id: "State", label: "State", checked: false },
    { id: "Pincode", label: "Pincode", checked: false },
  ];

  formatDate(date: string): string {
    const parsedDate = new Date(date);
    const adjustedDate = new Date(
      parsedDate.getTime() - parsedDate.getTimezoneOffset() * 60000,
    );
    return adjustedDate.toISOString().split('T')[0];
  }

  onDateRangeSelected(dateRange: { startDate: string; endDate: string }): void {
    this.selectedDateRange = {
      startDate: this.formatDate(dateRange.startDate),
      endDate: this.formatDate(dateRange.endDate),
    };
  }

  onReportTypeChange(event: Event): void {
    const inputElement = event.target as HTMLInputElement;
    this.selectedReportType = inputElement.value;
  }
  toggleDropdown() {
    this.dropdownOpen = !this.dropdownOpen;
    if (!this.dropdownOpen) {
      this.selectedStatusIds = [];
      this.selectedStatusNames = [];
      this.allSelected = false;
    }
  }

  filterStatuses() {
    this.http.get<any>(this.apiservice.StatusData).subscribe((response) => {
      this.filteredStatuses = response.data.filter(
        (item: StatusData) => item.role === 1,
      );
    });
  }

  toggleSelection(status: { id: string; name: string }) {
    const index = this.selectedStatusIds.indexOf(status.id);
    if (index === -1) {
      this.selectedStatusIds.push(status.id);
      this.selectedStatusNames.push(status.name);
    } else {
      this.selectedStatusIds.splice(index, 1);
      this.selectedStatusNames.splice(index, 1);
    }
    this.allSelected =
      this.selectedStatusIds.length === this.filteredStatuses.length;
  }

  toggleSelectAll(event: Event) {
    const isChecked = (event.target as HTMLInputElement).checked;
    if (isChecked) {
      this.selectedStatusIds = this.filteredStatuses.map((status) => status.id);
      this.selectedStatusNames = this.filteredStatuses.map(
        (status) => status.name,
      );
    } else {
      this.selectedStatusIds = [];
      this.selectedStatusNames = [];
    }
    this.allSelected = isChecked;
  }

  @HostListener('document:click', ['$event'])
  onClick(event: MouseEvent) {
    if (!this.isClickInsideDropdown(event)) {
      this.dropdownOpen = false;
    }
  }

  private isClickInsideDropdown(event: MouseEvent): boolean {
    const dropdownElement = document.getElementById('statusFilterDropdown');
    if (dropdownElement && dropdownElement.contains(event.target as Node)) {
      return true;
    }
    return false;
  }

  selectAllOrderCheckboxChanged() {
    this.orderCheckboxes.forEach((checkbox) => {
      checkbox.checked = this.selectAllOrderChecked;
    });
  }

  checkboxChanged() {
    this.selectAllOrderChecked = this.orderCheckboxes.every(
      (checkbox) => checkbox.checked,
    );
  }

  createReport(): void {
    this.isCreating = true;
    const startDate = this.selectedDateRange?.startDate || '';
    const endDate = this.selectedDateRange?.endDate || '';

    const selectedColumns = this.orderCheckboxes
      .filter((checkbox) => checkbox.checked)
      .map((checkbox) => checkbox.id);
    const selectedStatuses = this.selectedStatusNames;

    if (this.selectedReportType === '' || this.selectedReportType === null) {
      this.toastr.error(
        'Insufficient details for Report generation.',
        'Failure',
      );
      this.isCreating = false;
    } else {
      if (this.selectedReportType === 'Table') {
        if (
          this.reportName &&
          selectedColumns.length > 0 &&
          selectedStatuses.length > 0
        ) {
          let params = new HttpParams()
            .set('sellerId', this.sellerId)
            .set('fileType', Number(this.orderCategoryType))
            .set('startDate', startDate)
            .set('endDate', endDate);

             selectedColumns.forEach((column) => {
            params = params.append('columns', column);
          });

          this.http
            .get(this.apiservice.OrdersFileExport, {
              params,
              responseType: 'blob',
            })
            .subscribe({
              next: (blob: Blob) => {
                const fileName = `${this.reportName}_${new Date().getTime()}.xlsx`;

                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = fileName;
                a.click();

                window.URL.revokeObjectURL(url);

                this.toastr.success(
                  'Report generated successfully.',
                  'Success',
                );
                this.isCreating = false;
              },
              error: () => {
                this.toastr.error('Failed to generate report.', 'Failure');
                this.isCreating = false;
              },
            });
        } else {
          this.toastr.error(
            'Please provide complete details for report.',
            'Failure',
          );
          this.isCreating = false;
        }
      } else {
        this.toastr.error('Bar and Pie report is not functional.', 'Failure');
        this.isCreating = false;
      }
    }
  }

  downloadCSV(data: any[], columns: string[], statuses: string[]): void {
    const filteredData = data.filter((item) =>
      statuses.includes(item.orderStatus),
    );
    const columnLabels = columns.map((col) => {
      const checkbox = this.orderCheckboxes.find(
        (checkbox) => checkbox.id === col,
      );
      return checkbox ? checkbox.label.replace(/\s+/g, '_') : col;
    });

    columnLabels.unshift('Bank');
    columns.unshift('seller');

    const csvData = filteredData.map((item) => {
      const row: { [key: string]: any } = { seller: item.company };
      columns.slice(1).forEach((col) => (row[col] = item[col]));
      return row;
    });

    const csvRows = [];
    const headers = columnLabels.join(',');
    csvRows.push(headers);

    csvData.forEach((row) => {
      const values = columns.map((col) => row[col]);
      csvRows.push(values.join(','));
    });

    const csvString = csvRows.join('\n');

    const blob = new Blob([csvString], { type: 'text/csv' });

    const name = this.reportName;
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${this.reportName}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  }

  navigatetoReports() {
    this.router.navigate(['/user/reports']);
  }
}
