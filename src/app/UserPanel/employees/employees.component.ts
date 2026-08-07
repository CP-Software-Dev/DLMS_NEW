import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, FormBuilder } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { AddEmployeeComponent } from '../../Dialog/add-employee/add-employee.component';
import { EditPermissionsComponent } from '../../Dialog/edit-permissions/edit-permissions.component';
import { Router } from 'express';
import { ApiService } from '../../services/api.service';
import { HttpClient, HttpParams } from '@angular/common/http';

import { ToastrService } from 'ngx-toastr';
import { SellerService } from '../../services/seller.service';
import { RefreshService } from '../../services/refresh.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-employees',
  templateUrl: './employees.component.html',
  styleUrl: './employees.component.css'
})
export class EmployeesComponent {

  showFiltersForm: boolean = false;
  buttonText: string = 'Filters';
  buttonIcon: string = 'ri-filter-fill';
  userdata: any[] = []
  paginatedUsers: any[] = [];
  sellerData: any[] = [];
  pageIndex: number = 0;
  pageSize: number = 10;
  totalUsers: number = 0;
  statusData: any[] = [
    { id: 'Active', name: 'Active'},
    { id: 'Seller Employees', name: 'Bank Employees'},
    { id: 'Junk Account', name: 'Junk Account'}
  ];

  currentFilters: any = {};
  sellerId:string = '';
  phone:string= '';
  email:string= '';
  seller:any;

  EmployeeData: any[] = [];
  totalOrders: number = 0;
  private refreshSubscription?: Subscription;



  constructor(private apiservice: ApiService,
    private dialog: MatDialog,
    private http: HttpClient,
    private toastr : ToastrService,
    private refreshservice : RefreshService,
    private sellerService: SellerService,
    private fb: FormBuilder) {
      this.dateRange = this.fb.group({
        start: [new Date()],
        end: [new Date()]
      });

  }

  ngOnInit(): void {
    this.refreshSubscription = this.refreshservice.refreshNeeded.subscribe(() => {
      this.fetchUsers(this.pageIndex, this.pageSize);
    });
    this.fetchUsers(this.pageIndex, this.pageSize);
    this.loadSellerData();
    this.seller = this.sellerService.getItem('seller');
    this.applyFilters();
  }

  loadSellerData(): void {
    this.http.get<any>(this.apiservice.SellerData).subscribe(response => {
      this.sellerData = response.data;
    });
  }

  fetchUsers(pageIndex: number, pageSize: number, filters: any = this.currentFilters){
    debugger;
    let params = new HttpParams()
      .set('page', (pageIndex + 1).toString())
      .set('dataCount', pageSize.toString())
      .set('institutionId', Number(this.seller))
      .set('roleId',4)
      .set('status','Active');

      console.log(params.toString());

    if (filters.phone) {
      params = params.set("contact", filters.phone);
    }
    if (filters.email) {
      params = params.set("email", filters.email);
    }

    this.http.get(this.apiservice.Users, { params })
      .subscribe((res: any) => {
        if (res.status) {
          this.totalOrders = res.data.total;
          this.EmployeeData = res.data.userDetails.filter((user: any) => user.isVerified === 1);
        }
      }, error => {
        console.error("API Error:", error);
      });
 
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
      end: new Date()
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

  handlePageEvent(event: { pageIndex: number, pageSize: number }) {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.fetchUsers(this.pageIndex, this.pageSize);
  }

  dateRange = new FormGroup({
    start: new FormControl(),
    end: new FormControl()
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
    this.dialog.open(AddEmployeeComponent);
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
      userid :user.userID,
      username:user.username,
      firstName : user.firstName,
      lastName: user.lastName,
      email: user.emailAddress,
      contact: user.contact,
      hasOrder: user.hasOrders,
      hasShipment: user.hasShipment,
      hasNdr: user.hasNdr,
      hasRto: user.hasRto,
      hasReport:user.hasReports
    };

    this.dialog.open(EditPermissionsComponent, {
      data: dialogData
    });
  }

  isActive: string = 'All';

  makeActive(label: string) {
    this.isActive = label;
  }
}
