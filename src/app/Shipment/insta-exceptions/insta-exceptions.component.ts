import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, FormBuilder } from '@angular/forms';
import {
  trigger,
  state,
  style,
  animate,
  transition,
} from '@angular/animations';
import { MatDialog } from '@angular/material/dialog';
import { ChangestatusDialogComponent } from '../../Dialog/changestatus-dialog/changestatus-dialog.component';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { HttpClient, HttpParams } from '@angular/common/http';
import { ToastrService } from 'ngx-toastr';
import { RefreshService } from '../../services/refresh.service';
import { Subscription } from 'rxjs';
import { ExceptionStateService } from '../../services/States/Exceptions/exception-state.service';
import { WebhookViewComponent } from '../../Dialog/webhook-view/webhook-view.component';

interface StatusData {
  id: number;
  role: number;
}

@Component({
  selector: 'app-insta-exceptions',
  templateUrl: './insta-exceptions.component.html',
  styleUrl: './insta-exceptions.component.css',
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
export class InstaExceptionsComponent implements OnInit {
  showFiltersForm: boolean = false;
  buttonText: string = 'Filters';
  buttonIcon: string = 'ri-filter-fill';
  sellerData: any[] = [];
  courierData: any[] = [];
  orders: any[] = [];
  paginatedOrders: any[] = [];
  statusData: any[] = [];
  currentFilters: any = {};
  totalOrders: number = 0;
  ofd: number = 0;
  delivered: number = 0;
  rtoTransit: number = 0;
  exception: number = 0;
  rtoDelivered: number = 0;
  lost: number = 0;
  damaged: number = 0;
  rtoLost: number = 0;
  rtoDamaged: number = 0;
  pageIndex: number = 0;
  pageSize: number = 10;
  sellerId: string = '';
  statusId: number = 0;
  courierId: string = '';
  orderIds: string = '';
  selectedMethod: string = '';
  awbnumber: string = '';
  kitnumber: string = '';
  phone: string = '';
  private refreshSubscription?: Subscription;
  selectedDateRange: { startDate: string; endDate: string } = {
    startDate: '',
    endDate: '',
  };
  isExporting: boolean = false;

  constructor(
    private router: Router,
    private apiservice: ApiService,
    private http: HttpClient,
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private toastr: ToastrService,
    private dailog: MatDialog,
    private refreshservice: RefreshService,
    private exceptionStateService: ExceptionStateService,
    private dialog: MatDialog,
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
    this.isSelectAllChecked = false;
    this.route.queryParams.subscribe((params) => {
      this.initializeFiltersFromParams(params);
    });
    const savedStatusId = this.exceptionStateService.getStatusId();
    const savedPageIndex = this.exceptionStateService.getPageIndex();

    if (savedStatusId !== null) {
      this.statusId = savedStatusId;
      this.applyStatusFilter(this.statusId);
    }

    if (savedPageIndex !== null) {
      this.pageIndex = savedPageIndex;
    }

    this.applyFilters();
    this.fetchOrders(this.pageIndex, this.pageSize);
    this.loadSellerData();
    this.loadCourierData();
    this.loadStatus();
    this.refreshSubscription = this.refreshservice.refreshNeeded.subscribe(
      () => {
        this.fetchOrders(this.pageIndex, this.pageSize);
      },
    );
  }

  initializeFiltersFromParams(params: any): void {
    if (!params || Object.keys(params).length === 0) {
      return;
    }

    if (params['sellerId']) {
      this.sellerId = params['sellerId'];
    }
    if (params['startDate'] && params['endDate']) {
      this.selectedDateRange = {
        startDate: this.formatDate(new Date(params['startDate']).toISOString()),
        endDate: this.formatDate(new Date(params['endDate']).toISOString()),
      };
    }
    if (params['statusId']) {
      this.statusId = params['statusId'].toString();
      this.isActive = this.statusId.toString();
    } else {
      this.isActive = 'All';
    }
    this.applyStatusFilter(this.statusId);
    this.applyFilters();
  }
  //------Date Range

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

  setActiveAll(): void {
    this.isActive = 'All';
  }

  setActive(statusId: string): void {
    this.isActive = statusId;
  }

  getCountByStatusId(statusId: number): number {
    switch (statusId) {
      case 9:
        return this.ofd;
      case 11:
        return this.exception;
      case 10:
        return this.delivered;
      case 12:
        return this.rtoTransit;
      case 14:
        return this.rtoDelivered;
      case 15:
        return this.lost;
      case 16:
        return this.damaged;
      case 17:
        return this.rtoLost;
      case 18:
        return this.rtoDamaged;
      default:
        return 0;
    }
  }

  getAddressTooltip(order: any): string {
    const customer = order.customer ? `${order.customer}:` : '';
    const address1 = order.address1 || '';
    const address2 = order.address2 || '';
    const city = order.city || '';
    const state = order.state || '';
    const pincode = order.pincode || '';
    const contact = order.contact || '';

    const parts = [address1, address2, city, state, pincode, contact];
    const filteredParts = parts.filter((part) => part); // Remove any empty parts

    return `${customer}\n${filteredParts.join(', ')}`;
  }

  //-----Status Data

  loadStatus(): void {
    const allowedIds = [9, 10, 11, 12, 14, 15, 16, 17, 18];
    this.http.get<any>(this.apiservice.StatusData).subscribe((response) => {
      this.statusData = response.data.filter(
        (item: StatusData) => item.role === 2 && allowedIds.includes(item.id),
      );
    });
  }

  //-----Courier Data

  loadCourierData(): void {
    this.http.get<any>(this.apiservice.CourierData).subscribe((response) => {
      this.courierData = response.data;
    });
  }

  //-----Seller Data

  loadSellerData() {
    this.http.get<any>(this.apiservice.SellerData).subscribe((response) => {
      this.sellerData = response.data;
    });
  }

  //-----Exception Data

  loading: boolean = false;
  isLoading: boolean = false;

  fetchOrders(
    pageIndex: number,
    pageSize: number,
    filters: any = this.currentFilters,
  ) {
    let params = new HttpParams()
      .set('page', (pageIndex + 1).toString())
      .set('dataCount', pageSize.toString())
      .set('isException', 1)
      .set('fileType', 3);

    this.loading = true;

    this.isSelectAllChecked = false;
    if (filters.orderIds) {
      params = params.set('orderId', filters.orderIds.join(','));
    }
    if (filters.sellerId) {
      params = params.set('sellerId', filters.sellerId);
    }

    if (filters.kitnumber) {
      params = params.set('kitnumber', filters.kitnumber);
    }

    if (filters.awbnumber) {
      params = params.set('awb', filters.awbnumber);
    }
    if (filters.phone) {
      params = params.set('contact', filters.phone);
    }

    if (filters.courierId) {
      params = params.set('courierId', filters.courierId);
    }
    if (filters.statusId !== undefined) {
      if (filters.statusId !== null) {
        params = params.set('shipmentId', filters.statusId.toString());
      }
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
    this.http.get(this.apiservice.Shipments, { params }).subscribe(
      (res: any) => {
        if (res.status) {
          this.orders = res.data.orders;
          this.totalOrders = res.data.total;
          this.exception = res.data.exception || 0;
          this.ofd = res.data.outForDelivery || 0;
          this.delivered = res.data.delivered || 0;
          this.rtoTransit = res.data.rtoInTransit || 0;
          this.rtoDelivered = res.data.rtoDelivered || 0;
          this.lost = res.data.lost || 0;
          this.damaged = res.data.damaged || 0;
          this.rtoLost = res.data.rtoLost || 0;
          this.rtoDamaged = res.data.rtoDamaged || 0;
          this.paginatedOrders = this.orders;
        }
        this.loading = false;
      },
      (error) => {
        this.loading = false;
      },
    );
  }

  applyFilters() {
    this.currentFilters = {};

    if (this.orderIds) {
      this.currentFilters.orderIds = this.orderIds
        .split(',')
        .map((id) => id.trim());
    }
    if (this.selectedMethod) {
      this.currentFilters.method = this.selectedMethod;
    }
    if (this.courierId) {
      this.currentFilters.courierId = this.courierId;
    }
    if (this.sellerId != '0') {
      this.currentFilters.sellerId = this.sellerId;
    }
    if (this.awbnumber) {
      this.currentFilters.awbnumber = this.awbnumber;
    }
    if (this.kitnumber) {
      this.currentFilters.kitnumber = this.kitnumber;
    }
    if (this.statusId) {
      this.currentFilters.statusId = this.statusId;
    }
    if (this.phone) {
      this.currentFilters.phone = this.phone;
    }
    if (this.selectedDateRange) {
      const { startDate, endDate } = this.selectedDateRange;
      this.currentFilters.startDate = startDate;
      this.currentFilters.endDate = endDate;
    }
    this.pageIndex = 0;
    this.fetchOrders(this.pageIndex, this.pageSize, this.currentFilters);
    if (this.statusId == null || this.statusId == 0) {
      this.isActive = 'All';
    }
  }

  clearFilters() {
    this.orderIds = '';
    this.selectedMethod = '';
    this.sellerId = '';
    this.awbnumber = '';
    this.phone = '';
    this.courierId = '';
    this.kitnumber = '';
    this.currentFilters = {};
    const currentDate = new Date();
    const startDate = new Date(); // Clone today
    startDate.setDate(startDate.getDate() - 29);
    this.selectedDateRange = {
      startDate: this.formatDate(startDate.toISOString()),
      endDate: this.formatDate(currentDate.toISOString()),
    };
    this.currentFilters.startDate = this.selectedDateRange.startDate;
    this.currentFilters.endDate = this.selectedDateRange.endDate;
    this.fetchOrders(this.pageIndex, this.pageSize, this.currentFilters);
    this.toggleFiltersForm();
  }

  isActive: string | null = 'All';
  makeActive(label: string) {
    this.isActive = label;
  }

  toggleFiltersForm() {
    this.showFiltersForm = !this.showFiltersForm;
    this.buttonText = this.showFiltersForm ? 'Close' : 'Filters';
    this.buttonIcon = this.showFiltersForm ? 'ri-close-fill' : 'ri-filter-fill';
  }

  openDialog1(): void {
    const statusID = Number(this.isActive);
    const selectedOrderIds = this.getSelectedOrderIds();
    this.dialog.open(ChangestatusDialogComponent, {
      panelClass: 'rounded-dialog',
      data: {
        orderIds: selectedOrderIds,
        statusID: statusID,
        source: 'exception',
      },
    });
  }

  isSelectAllChecked: boolean = false;

  toggleAllCheckboxes(event: any) {
    const isChecked = event.target.checked;
    this.isSelectAllChecked = isChecked;

    if (this.orders) {
      for (const key in this.orders) {
        if (Object.prototype.hasOwnProperty.call(this.orders, key)) {
          this.orders[key].selected = isChecked;
        }
      }
    }
  }

  updateSelectAllCheckbox() {
    const ordersArray = Object.values(this.orders);
    this.isSelectAllChecked = ordersArray.every((order: any) => order.selected);
  }

  getSelectedCount(): number {
    const ordersArray = Object.values(this.orders);
    return ordersArray.filter((order: any) => {
      if (this.isActive == '14') {
        return (
          order.selected && order.order !== 'selectAll' && order.isRto != '1'
        );
      } else if (this.isActive != '14') {
        return order.selected && order.order !== 'selectAll';
      }
      return false;
    }).length;
  }

  getSelectedOrderIds() {
    if (this.isActive == '14') {
      return this.paginatedOrders
        .filter((order) => order.selected && order.isRto != '1')
        .map((order) => order.orderID);
    } else {
      return this.paginatedOrders
        .filter((order) => order.selected)
        .map((order) => order.orderID);
    }
  }

  handlePageEvent(event: { pageIndex: number; pageSize: number }) {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.exceptionStateService.setPageIndex(this.pageIndex);
    this.fetchOrders(this.pageIndex, this.pageSize);
  }

  //-------Status Filter

  applyStatusFilter(statusId: number | null) {
    if (statusId === null) {
      this.isActive = 'All';
    } else {
      this.isActive = statusId.toString();
    }
    if (statusId !== null) {
      this.currentFilters.statusId = statusId;
      this.exceptionStateService.setStatusId(Number(statusId));
    } else {
      delete this.currentFilters.statusId;
      this.exceptionStateService.setStatusId(null);
    }
    this.isSelectAllChecked = false;
    this.pageIndex = 0;
    this.exceptionStateService.setPageIndex(this.pageIndex);
    this.fetchOrders(this.pageIndex, this.pageSize, this.currentFilters);
    this.isSelectAllChecked = false;
  }

  //------Export Data

  exportToCSV() {
    this.isExporting = true;
    this.fetchAllOrders()
      .then((allOrders) => {
        this.downloadCSV(allOrders);
        this.isExporting = false;
      })
      .catch((error) => {
        console.error('Error fetching orders:', error);
        this.isExporting = false;
      });
  }

  fetchAllOrders(): Promise<any[]> {
    const pageSize = 100;
    let pageIndex = 0;
    const allOrders: any[] = [];

    return new Promise((resolve, reject) => {
      let params = new HttpParams()
        .set('page', (pageIndex + 1).toString())
        .set('dataCount', pageSize.toString())
        .set('isException', 1)
        .set('fileType', '3');

      if (this.currentFilters.orderIds) {
        params = params.set('orderId', this.currentFilters.orderIds.join(','));
      }
      if (this.currentFilters.sellerId) {
        params = params.set('sellerId', this.currentFilters.sellerId);
      }
      if (this.currentFilters.courierId) {
        params = params.set('courierId', this.currentFilters.courierId);
      }
      if (this.currentFilters.kitnumber) {
        params = params.set('kitnumber', this.currentFilters.kitnumber);
      }

      if (this.currentFilters.statusId !== undefined) {
        if (this.currentFilters.statusId !== null) {
          params = params.set('shipmentId', this.currentFilters.statusId);
        }
      }

      // if (this.currentFilters.statusId) {
      //   params = params.set("shipmentId", this.currentFilters.statusId);
      // }

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
      if (this.currentFilters.awbnumber) {
        params = params.set('awb', this.currentFilters.awbnumber);
      }

      this.http.get(this.apiservice.ShipmentsExport, { params }).subscribe(
        (res: any) => {
          if (res.status) {
            const orders = res.data?.orders || [];

            if (!orders.length) {
              this.toastr.warning('No data to export');
              reject('No data');
              return;
            }
            resolve(orders); // ✅ full data comes directly
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

  downloadCSV(data: any[]) {
    const csvData = this.convertToCSV(data);
    const randomNumber = Math.floor(Math.random() * 90000) + 10000; // Generate a 5-digit random number
    const fileName = `Exception_17185${randomNumber}.csv`;
    const blob = new Blob([csvData], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }

  navigatetoInstaDetails(orderID: string): void {
    this.router.navigate(['/admin/insta/details', orderID]);
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

  confirmRto(): void {
    const selectedOrders = this.getSelectedOrderIds().map(String);
    const requestBody = {
      orderIds: selectedOrders,
    };
    this.isLoading = true;
    this.http
      .post(this.apiservice.ConfirmRto, requestBody)
      .subscribe((res: any) => {
        if (res.status) {
          this.toastr.success('Rto Orders Confirmed', 'Success');
          this.refreshservice.triggerRefresh();
          this.isLoading = false;
        } else {
          this.toastr.error(res.errors, 'Failure');
          this.isLoading = false;
        }
      });
  }

  navigateToAwbStatus(awb: string): void {
    this.router.navigate(['admin/status', awb]);
  }

  navigateToShipmentDetail(orderID: string): void {
    this.router.navigate(['/admin/ndr/details', orderID]);
  }

  openDialog(orderID: number) {
    this.dailog.open(WebhookViewComponent, {
      data: {
        order: orderID,
      },
    });
  }
}
