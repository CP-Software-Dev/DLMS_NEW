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
import { SellerService } from '../../services/seller.service';

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
  // NEW: counts that the API returns but were not being read earlier
  inTransit: number = 0;
  pendingPickup: number = 0;
  rtoOutForDelivery: number = 0;
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

  // -------------- admin / user (client) ek hi component --------------
  // user-ndr ki tarah: login se seller milta hai (sellerService).
  // Seller ho AUR admin route na ho -> user (sirf apni seller ka data).
  // Admin route par kabhi user view/filter nahi lagta (admin pehle jaisa).
  seller: any = null;
  get isUser(): boolean {
    return !!this.seller && !this.router.url.startsWith('/admin');
  }

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
    private sellerService: SellerService,
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
    this.seller = this.sellerService.getItem('seller'); // sabse pehle
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
    if (!this.isUser) {
      this.loadSellerData();
    }
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
    // user/client: hamesha sirf apni seller ka data
    if (this.isUser && this.seller) {
      params = params.set('sellerId', this.seller);
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
          // NEW
          this.inTransit = res.data.inTransit || 0;
          this.pendingPickup = res.data.pendingPickup || 0;
          this.rtoOutForDelivery = res.data.rtoOutForDelivery || 0;
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

  // =====================================================
  // New pill-filter UI helpers (added; existing methods untouched)
  // =====================================================
  searchTerm: string = '';

  // Search box filters the current page by AWB / Order / Kit / Lot / Branch Head
  get filteredOrders(): any[] {
    const term = this.searchTerm ? this.searchTerm.trim().toLowerCase() : '';
    if (!term) {
      return this.paginatedOrders;
    }
    return this.paginatedOrders.filter((order) =>
      [
        order.awb,
        order.orderID,
        order.kitNumber,
        order.lotId,
        order.customer,
      ].some((v) => (v || '').toString().toLowerCase().includes(term)),
    );
  }

  // "All Exceptions" card total + base for progress bars.
  // FIXED: ab inTransit, pendingPickup, rtoOutForDelivery bhi shamil hain,
  // isse ye API ke `total` ke barabar aayega.
  get baseTotal(): number {
    return (
      this.exception +
      this.ofd +
      this.delivered +
      this.rtoTransit +
      this.rtoDelivered +
      this.lost +
      this.damaged +
      this.rtoLost +
      this.rtoDamaged +
      this.inTransit +
      this.pendingPickup +
      this.rtoOutForDelivery
    );
  }

  getPercentage(count: number): number {
    if (!this.baseTotal) {
      return 0;
    }
    const pct = (count / this.baseTotal) * 100;
    return pct > 100 ? 100 : pct;
  }

  getLabelOpacity(count: number): number {
    if (count === 0) {
      return 0.65;
    }
    const opacity = this.getPercentage(count) / 100;
    return Math.max(opacity, 0.4);
  }

  getDaysAgo(orderDate: string | Date): number {
    const diffTime = new Date().getTime() - new Date(orderDate).getTime();
    return Math.floor(diffTime / (1000 * 60 * 60 * 24));
  }

  // Status pill colors (keyword match on status name)
  getStatusColor(status: string): { bg: string; color: string } {
    const s = (status || '').toLowerCase();
    if (s.includes('damaged')) return { bg: '#fde9ed', color: '#c93a55' };
    if (s.includes('lost')) return { bg: '#fde8ec', color: '#f2637e' };
    if (s.includes('rto') && s.includes('delivered'))
      return { bg: '#eceff4', color: '#64748b' };
    if (s.includes('rto')) return { bg: '#fdeaf2', color: '#f0679a' };
    if (s.includes('exception')) return { bg: '#fceae4', color: '#f0876b' };
    if (s.includes('out for delivery'))
      return { bg: '#dff6f1', color: '#26b99a' };
    if (s.includes('delivered')) return { bg: '#e7f9ef', color: '#16a34a' };
    return { bg: '#f4f5f7', color: '#8a8f98' };
  }

  getActiveFiltersList(): { key: string; label: string }[] {
    const list: { key: string; label: string }[] = [];

    if (this.orderIds) {
      list.push({ key: 'orderIds', label: `Order: ${this.orderIds}` });
    }
    if (this.awbnumber) {
      list.push({ key: 'awbnumber', label: `AWB: ${this.awbnumber}` });
    }
    if (this.kitnumber) {
      list.push({ key: 'kitnumber', label: `Kit: ${this.kitnumber}` });
    }
    if (this.courierId) {
      const courier = this.courierData.find(
        (c) => c.id?.toString() === this.courierId?.toString(),
      );
      list.push({
        key: 'courierId',
        label: `Courier: ${courier?.name || this.courierId}`,
      });
    }
    if (this.sellerId) {
      const seller = this.sellerData.find(
        (s) => s.id?.toString() === this.sellerId?.toString(),
      );
      list.push({
        key: 'sellerId',
        label: `Bank: ${seller?.name || this.sellerId}`,
      });
    }
    return list;
  }

  removeFilter(key: string): void {
    switch (key) {
      case 'orderIds':
        this.orderIds = '';
        break;
      case 'awbnumber':
        this.awbnumber = '';
        break;
      case 'kitnumber':
        this.kitnumber = '';
        break;
      case 'courierId':
        this.courierId = '';
        break;
      case 'sellerId':
        this.sellerId = '';
        break;
    }
    this.searchTerm = '';
    this.applyFilters();
  }

  // clearFilters() ends with toggleFiltersForm(); close the popover again
  // so the outside "Clear all" link doesn't leave it open.
  clearAllFilters(): void {
    this.searchTerm = '';
    this.clearFilters();
    if (this.showFiltersForm) {
      this.toggleFiltersForm();
    }
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
      if (this.isUser && this.seller) {
        params = params.set('sellerId', this.seller);
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
    this.router.navigate([this.isUser ? 'user/status' : 'admin/status', awb]);
  }

  navigateToShipmentDetail(orderID: string): void {
    this.router.navigate([
      this.isUser ? '/user/ndr/details' : '/admin/ndr/details',
      orderID,
    ]);
  }

  openDialog(orderID: number) {
    this.dailog.open(WebhookViewComponent, {
      data: {
        order: orderID,
      },
    });
  }

  //   openDialog(orderID: number): void {
  //   this.dialog.open(WebhookViewComponent, {
  //     data: {
  //       order: orderID,
  //     },
  //     position: { right: '1%', top: '1%' },
  //       height: '95vh',
  //       maxHeight: '100vh',
  //       width: '700px',
  //       maxWidth: '700px',
  //       panelClass: 'right-slide-panel',
  //       backdropClass: 'remake-blur-backdrop',
  //       hasBackdrop: true,
  //   });
  // }
}