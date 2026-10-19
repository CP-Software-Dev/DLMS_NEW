import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, FormBuilder } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { UserDialogComponent } from '../user-dialog/user-dialog.component';
import { ApiService } from '../services/api.service';
import { HttpClient, HttpParams } from '@angular/common/http';
import { ToastrService } from 'ngx-toastr';
import { RefreshService } from '../services/refresh.service';
import { Subscription } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-userlist',
  templateUrl: './userlist.component.html',
  styleUrl: './userlist.component.css',
})
export class UserlistComponent implements OnInit {
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
    { id: 'Seller Employees', name: 'Bank Admin' },
    { id: 'Junk Account', name: 'Junk Accounts' },
  ];
  status: any;

  // Overall total for each status card (not affected by bank / phone / email filters)
  statusCounts: Record<string, number | null> = {
    All: null,
    Active: null,
    'Seller Employees': null,
    'Junk Account': null,
  };

  currentFilters: any = {};
  sellerId: string = '';
  phone: string = '';
  email: string = '';
  private refreshSubscription?: Subscription;

  constructor(
    private apiservice: ApiService,
    private dialog: MatDialog,
    private http: HttpClient,
    private toastr: ToastrService,
    private refreshservice: RefreshService,
    private route: ActivatedRoute,
    private fb: FormBuilder,
  ) {
    this.dateRange = this.fb.group({
      start: [new Date()],
      end: [new Date()],
    });
  }

  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      if (params['statusId']) {
        this.status = params['statusId'].toString();
        this.isActive = this.status.toString();
      } else {
        this.isActive = 'All';
      }
      this.applyStatusFilter(this.status);
      this.applyFilters();
    });

    this.refreshSubscription = this.refreshservice.refreshNeeded.subscribe(
      () => {
        this.fetchUsers(this.pageIndex, this.pageSize);
        this.loadStatusCounts();
      },
    );

    this.loadSellerData();
    this.loadStatusCounts();
    this.applyFilters();
  }

  loadSellerData(): void {
    this.http.get<any>(this.apiservice.SellerData).subscribe((response) => {
      this.sellerData = response.data;
    });
  }

  // Fetches the overall total for each status card using a 1-row request
  loadStatusCounts(): void {
    const requests: { key: string; params: { [k: string]: string } }[] = [
      { key: 'All', params: {} },
      { key: 'Active', params: { status: 'Active' } },
      { key: 'Seller Employees', params: { roleId: '3' } },
      { key: 'Junk Account', params: { status: 'Junk' } },
    ];

    requests.forEach(({ key, params }) => {
      let httpParams = new HttpParams().set('page', '1').set('dataCount', '1');
      Object.entries(params).forEach(([k, v]) => {
        httpParams = httpParams.set(k, v);
      });

      this.http.get(this.apiservice.Users, { params: httpParams }).subscribe({
        next: (res: any) => {
          if (res.status) {
            this.statusCounts[key] = res.data.total;
          }
        },
        error: (err) => console.error('Count API Error:', err),
      });
    });
  }

  fetchUsers(
    pageIndex: number,
    pageSize: number,
    filters: any = this.currentFilters,
  ) {
    let params = new HttpParams()
      .set('page', (pageIndex + 1).toString())
      .set('dataCount', pageSize.toString());

    if (filters.sellerId) {
      params = params.set('institutionId', filters.sellerId);
    }
    if (filters.phone) {
      params = params.set('contact', filters.phone);
    }
    if (filters.email) {
      params = params.set('email', filters.email);
    }
    if (filters.role) {
      params = params.set('roleId', filters.role);
    }
    if (filters.status) {
      params = params.set('status', filters.status);
    }

    this.http.get(this.apiservice.Users, { params }).subscribe(
      (res: any) => {
        if (res.status) {
          this.userdata = res.data.userDetails;
          this.paginatedUsers = this.userdata;
          this.totalUsers = res.data.total;
        }
      },
      (error) => {
        console.error('API Error:', error);
      },
    );
  }

  applyFilters() {
    this.currentFilters = {};
    if (this.sellerId) {
      this.currentFilters.sellerId = this.sellerId;
    }
    if (this.phone) {
      this.currentFilters.phone = this.phone;
    }
    if (this.email) {
      this.currentFilters.email = this.email;
    }
    if (this.status) {
      this.currentFilters.status = this.status;
    }

    this.fetchUsers(this.pageIndex, this.pageSize, this.currentFilters);
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

  dateRange = new FormGroup({
    start: new FormControl(),
    end: new FormControl(),
  });

  isSelectAllChecked: boolean = false;

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
    this.dialog.open(UserDialogComponent);
  }

  isActive: string = 'All';

  makeActive(label: string) {
    this.isActive = label;
  }

  applyStatusFilter(filterType: string | null) {
    switch (filterType) {
      case null:
      case 'All':
        this.isActive = 'All';
        delete this.currentFilters.status;
        delete this.currentFilters.role;
        break;
      case 'Active':
        this.isActive = 'Active';
        this.currentFilters.status = 'Active';
        delete this.currentFilters.role;
        break;
      case 'Seller Employees':
        this.isActive = 'Seller Employees';
        this.currentFilters.status = '';
        this.currentFilters.role = 3;
        break;
      case 'Junk Account':
        this.isActive = 'Junk Account';
        this.currentFilters.status = 'Junk';
        delete this.currentFilters.role;
        break;
      default:
        this.isActive = 'All';
        delete this.currentFilters.status;
        delete this.currentFilters.role;
        break;
    }

    this.pageIndex = 0;
    this.fetchUsers(this.pageIndex, this.pageSize, this.currentFilters);
  }

  exportToCSV() {
    this.fetchUserData()
      .then((allUsers) => {
        this.downloadCSV(allUsers);
      })
      .catch((error) => {
        this.toastr.error('No Data to Export', 'Failure');
        console.error('Error fetching orders:', error);
      });
  }

  fetchUserData(): Promise<any[]> {
    const pageSize = 100;
    let pageIndex = 0;
    const allUsers: any[] = [];
    const fetchPage = (pageIndex: number): Promise<any> => {
      return new Promise((resolve, reject) => {
        let params = new HttpParams()
          .set('page', (pageIndex + 1).toString())
          .set('dataCount', pageSize.toString());

        if (this.currentFilters.sellerId) {
          params = params.set('sellerId', this.currentFilters.sellerId);
        }
        if (this.currentFilters.phone) {
          params = params.set('contact', this.currentFilters.phone);
        }
        if (this.currentFilters.email) {
          params = params.set('email', this.currentFilters.email);
        }
        if (this.currentFilters.role) {
          params = params.set('roleId', this.currentFilters.role);
        }
        if (this.currentFilters.status) {
          params = params.set('status', this.currentFilters.status);
        }

        this.http.get(this.apiservice.Users, { params }).subscribe(
          (res: any) => {
            if (res.status) {
              resolve(res.data.userDetails);
            } else {
              reject('Failed to fetch data');
            }
          },
          (error) => {
            reject(error);
          },
        );
      });
    };

    const fetchAll = async () => {
      let moreData = true;
      while (moreData) {
        const orders = await fetchPage(pageIndex);
        if (orders.length > 0) {
          allUsers.push(...orders);
          pageIndex++;
        } else {
          moreData = false;
        }
      }
      return allUsers;
    };

    return fetchAll();
  }

  downloadCSV(data: any[]) {
    const csvData = this.convertToCSV(data);
    // Generate a 5-digit random number for the file name
    const randomNumber = Math.floor(Math.random() * 90000) + 10000;
    const fileName = `User_17185${randomNumber}.csv`;
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

  userStatus(username: string) {
    let params = new HttpParams().set('username', username.toString());
    Swal.fire({
      title: 'Are you sure?',
      text: 'You want to change the user status',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      cancelButtonText: 'No',
      confirmButtonText: 'Yes',
    }).then((result) => {
      if (result.isConfirmed) {
        this.http
          .patch(this.apiservice.Activate, {}, { params })
          .subscribe((res: any) => {
            if (res.status) {
              Swal.fire(
                'Updated!',
                'Changed User Status Successfully.',
                'success',
              );
              this.refreshservice.triggerRefresh();
            } else {
              Swal.fire('Error!', res.errors, 'error');
              this.toastr.error(res.errors, 'Failure');
            }
          });
      }
    });
  }
}