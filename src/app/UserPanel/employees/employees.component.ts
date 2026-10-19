import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormGroup, FormControl, FormBuilder } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { AddEmployeeComponent } from '../../Dialog/add-employee/add-employee.component';
import { EditPermissionsComponent } from '../../Dialog/edit-permissions/edit-permissions.component';
import { ApiService } from '../../services/api.service';
import { HttpClient, HttpParams } from '@angular/common/http';

import { ToastrService } from 'ngx-toastr';
import { SellerService } from '../../services/seller.service';
import { RefreshService } from '../../services/refresh.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-employees',
  templateUrl: './employees.component.html',
  styleUrl: './employees.component.css',
})
export class EmployeesComponent implements OnInit, OnDestroy {
  showFiltersForm: boolean = false;
  buttonText: string = 'Filters';
  buttonIcon: string = 'ri-filter-fill';
  userdata: any[] = [];
  paginatedUsers: any[] = [];
  sellerData: any[] = [];
  pageIndex: number = 0;
  pageSize: number = 10;
  totalUsers: number = 0;
  statusData: any[] = [
    { id: 'Active', name: 'Active' },
    { id: 'Seller Employees', name: 'Bank Employees' },
    { id: 'Junk Account', name: 'Junk Account' },
  ];

  currentFilters: any = {};
  sellerId: string = '';
  phone: string = '';
  email: string = '';
  seller: any;

  EmployeeData: any[] = [];
  totalOrders: number = 0;
  private refreshSubscription?: Subscription;

  roleNames: Record<number, string> = {
    1: 'Super Admin',
    2: 'Admin',
    3: 'Client',
    4: 'Client User',
  };

  private monthMap: Record<string, number> = {
    Jan: 0,
    Feb: 1,
    Mar: 2,
    Apr: 3,
    May: 4,
    Jun: 5,
    Jul: 6,
    Aug: 7,
    Sep: 8,
    Oct: 9,
    Nov: 10,
    Dec: 11,
  };

  dateRange = new FormGroup({
    start: new FormControl(),
    end: new FormControl(),
  });

  isSelectAllChecked: boolean = false;
  isActive: string = 'All';

  constructor(
    private apiservice: ApiService,
    private dialog: MatDialog,
    private http: HttpClient,
    private toastr: ToastrService,
    private refreshservice: RefreshService,
    private sellerService: SellerService,
    private fb: FormBuilder,
  ) {
    this.dateRange = this.fb.group({
      start: [new Date()],
      end: [new Date()],
    });
  }

  ngOnInit(): void {
    this.seller = this.sellerService.getItem('seller');

    this.refreshSubscription = this.refreshservice.refreshNeeded.subscribe(
      () => {
        this.fetchUsers(this.pageIndex, this.pageSize);
      },
    );

    this.loadSellerData();
    this.applyFilters();
  }

  ngOnDestroy(): void {
    this.refreshSubscription?.unsubscribe();
  }

  loadSellerData(): void {
    this.http.get<any>(this.apiservice.SellerData).subscribe((response) => {
      this.sellerData = response.data;
    });
  }

  fetchUsers(
    pageIndex: number,
    pageSize: number,
    filters: any = this.currentFilters,
  ) {
    let params = new HttpParams()
      .set('page', (pageIndex + 1).toString())
      .set('dataCount', pageSize.toString())
      .set('institutionId', Number(this.seller))
      .set('roleId', 4)
      .set('status', 'Active');

    if (filters.phone) {
      params = params.set('contact', filters.phone);
    }
    if (filters.email) {
      params = params.set('email', filters.email);
    }

    this.http.get(this.apiservice.Users, { params }).subscribe(
      (res: any) => {
        if (res.status) {
          this.totalOrders = res.data.total;
          this.EmployeeData = res.data.userDetails.filter(
            (user: any) => user.isVerified === 1,
          );
        }
      },
      (error) => {
        console.error('API Error:', error);
      },
    );
  }

  applyFilters() {
    this.currentFilters = {};
    if (this.phone) {
      this.currentFilters.phone = this.phone;
    }
    if (this.email) {
      this.currentFilters.email = this.email;
    }
    this.fetchUsers(this.pageIndex, this.pageSize, this.currentFilters);
    this.isActive = 'All';
  }

  clearFilters() {
    this.dateRange.reset({
      start: new Date(),
      end: new Date(),
    });
    this.sellerId = '';
    this.phone = '';
    this.email = '';
    this.currentFilters = {};
    this.fetchUsers(this.pageIndex, this.pageSize, this.currentFilters);
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

  handlePageEvent(event: { pageIndex: number; pageSize: number }) {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.fetchUsers(this.pageIndex, this.pageSize);
  }

  toggleAllCheckboxes(event: any) {
    const isChecked = event.target.checked;
    this.isSelectAllChecked = isChecked;

    if (this.userdata) {
      for (const key in this.userdata) {
        if (Object.prototype.hasOwnProperty.call(this.userdata, key)) {
          this.userdata[key].selected = isChecked;
        }
      }
    }
  }

  updateSelectAllCheckbox() {
    const userArray = Object.values(this.userdata);
    this.isSelectAllChecked = userArray.every((user: any) => user.selected);
  }

    openDialog(): void {
    this.dialog.open(AddEmployeeComponent, {
      panelClass: 'credentials-drawer',
      backdropClass: 'blur-backdrop',
      width: '540px',
      maxWidth: 'calc(100vw - 32px)',
      enterAnimationDuration: '0ms',
      exitAnimationDuration: '250ms',
    });
  }

  getDisplayText(user: any): string {
    const displayTexts: string[] = [];

    if (user.hasOrders === 1) {
      displayTexts.push('Orders');
    }
    if (user.hasShipment === 1) {
      displayTexts.push('Shipments');
    }
    if (user.hasReports === 1) {
      displayTexts.push('Reports');
    }
    if (user.hasNdr === 1) {
      displayTexts.push('NDR');
    }
    if (user.hasRto === 1) {
      displayTexts.push('RTO');
    }

    return displayTexts.join(', ');
  }

  editDetails(user: any): void {
    const dialogData = {
      userid: user.userID,
      username: user.username,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.emailAddress,
      contact: user.contact,
      hasOrder: user.hasOrders,
      hasShipment: user.hasShipment,
      hasNdr: user.hasNdr,
      hasRto: user.hasRto,
      hasReport: user.hasReports,
    };

    this.dialog.open(EditPermissionsComponent, {
      data: dialogData,
    });
  }

  makeActive(label: string) {
    this.isActive = label;
  }

  getRoleName(roleId: number): string {
    return this.roleNames[roleId] ?? '-';
  }

  // Maps the status text to a pill class (defined in the component css)
  getStatusClass(status: string): string {
    const s = (status || '').toLowerCase();
    if (s === 'active') return 'st-active';
    if (s.includes('junk')) return 'st-junk';
    return '';
  }

  // Parses dates like "Nov 26 2024  7:02PM" and returns whole days until today
  getDaysSince(value: string | null | undefined): number | string {
    if (!value) return '-';

    const m = value
      .toString()
      .trim()
      .match(/^([A-Za-z]{3})\s+(\d{1,2})\s+(\d{4})/);
    if (!m || this.monthMap[m[1]] === undefined) return '-';

    const start = new Date(+m[3], this.monthMap[m[1]], +m[2]);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return Math.round((today.getTime() - start.getTime()) / 86400000);
  }
}