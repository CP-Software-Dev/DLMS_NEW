import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, FormBuilder } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ChangestatusDialogComponent } from '../../Dialog/changestatus-dialog/changestatus-dialog.component';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { HttpClient, HttpParams } from '@angular/common/http';
import { SellerService } from '../../services/seller.service';
import { ExceptionStateService } from '../../services/States/Exceptions/exception-state.service';

interface StatusData {
  id: number;
  role: number;
}

@Component({
  selector: 'app-user-ndr',
  templateUrl: './user-ndr.component.html',
  styleUrl: './user-ndr.component.css'
})
export class UserNdrComponent {

  dateRange = new FormGroup({
    start: new FormControl(),
    end: new FormControl()
  });

  showFiltersForm: boolean = false;
  buttonText: string = 'Filters';
  buttonIcon: string = 'ri-filter-fill';

  sellerData: any[] = [];
  courierData: any[] = [];
  orders: any[] = [];
  paginatedOrders: any[] = [];
  totalOrders: number = 0;
  ofd: number = 0;
  delivered: number = 0;
  rtoTransit: number = 0;
  rtoDelivered: number = 0;
  lost: number = 0;
  damaged: number = 0;
  rtoLost: number = 0;
  rtoDamaged: number = 0;
  exception: number = 0;
  statusId: number = 0;
  currentFilters: any = {};

  statusData: any[] = []

  sellerId: string = '';
  courierId: string = '';
  orderIds: string = '';
  selectedMethod: string = '';
  awbnumber: string = '';
  kitnumber: string = '';
  phone: string = '';
  pageIndex: number = 0;
  pageSize: number = 10;
  seller: any;
  selectedDateRange: { startDate: string, endDate: string } = { startDate: '', endDate: '' };


  constructor(private router: Router,
    private apiservice: ApiService,
    private http: HttpClient,
    private exceptionstateService: ExceptionStateService,
    private route: ActivatedRoute,
    private sellerService: SellerService,
    private dialog: MatDialog) {
    const endDate = new Date(); // Today
    const startDate = new Date(); // Clone today
    startDate.setDate(startDate.getDate() - 29); // Last 30 days

    this.selectedDateRange = {
      startDate: this.formatDate(startDate.toISOString()),
      endDate: this.formatDate(endDate.toISOString()),
    };
  }

  formatDate(date: string): string {
    const parsedDate = new Date(date);
    const adjustedDate = new Date(parsedDate.getTime() - (parsedDate.getTimezoneOffset() * 60000));
    return adjustedDate.toISOString().split('T')[0];
  }

  onDateRangeSelected(dateRange: { startDate: string, endDate: string }): void {
    this.selectedDateRange = {
      startDate: this.formatDate(dateRange.startDate),
      endDate: this.formatDate(dateRange.endDate)
    };
  }



  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.initializeFiltersFromParams(params);
    });
    const savedStatusId = this.exceptionstateService.getStatusId();
    const savedPageIndex = this.exceptionstateService.getPageIndex();

    if (savedStatusId !== null) {
      this.statusId = savedStatusId;
      this.applyStatusFilter(this.statusId)
    }

    if (savedPageIndex !== null) {
      this.pageIndex = savedPageIndex;
    }
    this.applyFilters()
    this.seller = this.sellerService.getItem('seller');
    this.fetchOrders(this.pageIndex, this.pageSize);
    this.loadCourierData();
    this.loadStatus();
  }

  initializeFiltersFromParams(params: any): void {
    if (!params || Object.keys(params).length === 0) {
      return;
    }
    if (params['sellerId']) {
      this.sellerId = params['sellerId'];
    }
    if (params['startDate'] && params['endDate']) {
      this.dateRange.setValue({
        start: new Date(params['startDate']),
        end: new Date(params['endDate'])
      });
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

  setActiveAll(): void {
    this.isActive = 'All';
  }

  setActive(statusId: string): void {
    this.isActive = statusId;
  }

  getCountByStatusId(statusId: number): number {
    switch (statusId) {
      case 9: return this.ofd;
      case 10: return this.delivered;
      case 11: return this.exception;
      case 12: return this.rtoTransit;
      case 14: return this.rtoDelivered;
      case 15: return this.lost;
      case 16: return this.damaged;
      case 17: return this.rtoLost;
      case 18: return this.rtoDamaged;
      default: return 0;
    }
  }


  loadStatus(): void {
    const allowedIds = [9, 10, 11, 12, 14, 15, 16, 17, 18];
    this.http.get<any>(this.apiservice.StatusData).subscribe(response => {
      this.statusData = response.data.filter((item: StatusData) => item.role === 2 && allowedIds.includes(item.id));
    });
  }

  loadCourierData(): void {
    this.http.get<any>(this.apiservice.CourierData).subscribe(response => {
      this.courierData = response.data;
    })
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
    const filteredParts = parts.filter(part => part); // Remove any empty parts

    return `${customer}\n${filteredParts.join(', ')}`;
  }

  loading: boolean = false;

  fetchOrders(pageIndex: number, pageSize: number, filters: any = this.currentFilters) {

    let params = new HttpParams()
      .set('page', (pageIndex + 1).toString())
      .set('dataCount', pageSize.toString())
      .set('sellerId', this.seller)
      .set("filetype", "2")
      .set('isException', 1);

    this.loading = true;

    if (filters.orderIds) {
      params = params.set('orderId', filters.orderIds.join(','));
    }
    if (filters.awbnumber) {
      params = params.set("awb", filters.awbnumber);
    }

    if (filters.kitnumber) {
      params = params.set("kitnumber", filters.kitnumber);
    }
    if (filters.phone) {
      params = params.set("contact", filters.phone);
    }
    if (filters.courierId) {
      params = params.set('courierId', this.courierId);
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
      const adjustedDate = new Date(currentDate.getTime() - (currentDate.getTimezoneOffset() * 60000)).toISOString().split('T')[0];
      startDate = startDate || adjustedDate;
      endDate = endDate || adjustedDate;
    }

    params = params.set('startDate', startDate).set('endDate', endDate);

    this.http.get(this.apiservice.Shipments, { params })
      .subscribe((res: any) => {
        if (res.status) {
          this.orders = res.data.orders;
          this.totalOrders = res.data.total;
          this.ofd = res.data.outForDelivery || 0;
          this.delivered = res.data.delivered || 0;
          this.rtoTransit = res.data.rtoInTransit || 0;
          this.rtoDelivered = res.data.rtoDelivered || 0;
          this.lost = res.data.lost || 0;
          this.damaged = res.data.damaged || 0;
          this.rtoLost = res.data.rtoLost || 0;
          this.rtoDamaged = res.data.rtoDamaged || 0;
          this.exception = res.data.exception || 0;
          this.paginatedOrders = this.orders;
        }
        this.loading = false;
      }, error => {
        this.loading = false;
      });
  }

  applyFilters() {
    this.currentFilters = {};

    if (this.orderIds) {
      this.currentFilters.orderIds = this.orderIds.split(',').map(id => id.trim());
    }

    if (this.selectedMethod) {
      this.currentFilters.method = this.selectedMethod;
    }

    if (this.awbnumber) {
      this.currentFilters.awbnumber = this.awbnumber;
    }

    if (this.kitnumber) {
      this.currentFilters.kitnumber = this.kitnumber;
    }

    if (this.phone) {
      this.currentFilters.phone = this.phone;
    }

    if (this.statusId) {
      this.currentFilters.statusId = this.statusId;
    }

    if (this.courierId) {
      this.currentFilters.courierId = this.courierId;
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
    this.dateRange.reset();
    this.awbnumber = '';
    this.kitnumber = '';
    this.phone = '';
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
    this.fetchOrders(this.pageIndex, this.pageSize);
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
    this.dialog.open(ChangestatusDialogComponent, {
      panelClass: 'rounded-dialog'
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
    return ordersArray.filter((order: any) => order.selected && order.order !== 'selectAll').length;
  }

  handlePageEvent(event: { pageIndex: number, pageSize: number }) {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.exceptionstateService.setPageIndex(this.pageIndex);
    this.fetchOrders(this.pageIndex, this.pageSize);
  }

  exportToCSV() {
    this.fetchAllOrders().then(allOrders => {
      this.downloadCSV(allOrders);
    }).catch(error => {
      console.error("Error fetching orders:", error);
    });
  }

  fetchAllOrders(): Promise<any[]> {
    const pageSize = 100;
    let pageIndex = 0;
    const allOrders: any[] = [];

    const fetchPage = (pageIndex: number): Promise<any> => {
      return new Promise((resolve, reject) => {
        let params = new HttpParams()
          .set('page', (pageIndex + 1).toString())
          .set('dataCount', pageSize.toString())
          .set('isException', 1)
          .set("filetype", "2")
          .set('sellerId', this.sellerId);

        if (this.currentFilters.orderIds) {
          params = params.set('orderId', this.currentFilters.orderIds.join(','));
        }
        if (this.currentFilters.courierId) {
          params = params.set('courierId', this.currentFilters.courierId)
        }
        if (this.currentFilters.kitnumber) {
          params = params.set('kitnumber', this.currentFilters.kitnumber)
        }

        if (this.currentFilters.statusId !== undefined) {
          if (this.currentFilters.statusId !== null) {
            params = params.set('shipmentId', this.currentFilters.statusId.toString());
          }
        }

        if (this.currentFilters.statusId) {
          params = params.set('shipmentId', this.currentFilters.statusID);
        }
        let startDate = this.currentFilters.startDate;
        let endDate = this.currentFilters.endDate;

        if (!startDate || !endDate) {
          const currentDate = new Date();
          const adjustedDate = new Date(currentDate.getTime() - (currentDate.getTimezoneOffset() * 60000)).toISOString().split('T')[0];
          startDate = startDate || adjustedDate;
          endDate = endDate || adjustedDate;
        }

        params = params.set('startDate', startDate).set('endDate', endDate);
        if (this.currentFilters.awbnumber) {
          params = params.set("awb", this.currentFilters.awbnumber);
        }

        this.http.get(this.apiservice.Shipments, { params })
          .subscribe((res: any) => {
            if (res.status) {
              resolve(res.data.orders);
            } else {
              reject('Failed to fetch data');
            }
          }, error => {
            console.error("API Error:", error);
            reject(error);
          });
      });
    };

    const fetchAll = async () => {
      let moreData = true;
      while (moreData) {
        const orders = await fetchPage(pageIndex);
        if (orders.length > 0) {
          allOrders.push(...orders);
          pageIndex++;
        } else {
          moreData = false;
        }
      }
      return allOrders;
    };

    return fetchAll();
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

  applyStatusFilter(statusId: number | null) {
    if (statusId === null) {
      this.isActive = 'All';
    } else {
      this.isActive = statusId.toString();
    }
    if (statusId !== null) {
      this.currentFilters.statusId = statusId;
      this.exceptionstateService.setStatusId(Number(statusId));
    } else {
      delete this.currentFilters.statusId;
      this.exceptionstateService.setStatusId(null);
    }
    this.isSelectAllChecked = false;
    this.pageIndex = 0;
    this.exceptionstateService.setPageIndex(this.pageIndex);
    this.fetchOrders(this.pageIndex, this.pageSize, this.currentFilters);
  }

  navigateToOrderDetail(orderID: string): void {
    this.router.navigate(['user/ndr/details', orderID]);
  }

  navigateToAwbStatus(awb: string): void {
    this.router.navigate(['user/status', awb]);
  }

}
