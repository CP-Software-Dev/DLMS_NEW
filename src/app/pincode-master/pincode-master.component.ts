import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormControl } from '@angular/forms';
import {
  trigger,
  state,
  style,
  animate,
  transition,
} from '@angular/animations';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Router } from '@angular/router';
import { ApiService } from '../services/api.service';
import { Subscription } from 'rxjs';
import { RefreshService } from '../services/refresh.service';
import { OrderStateService } from '../services/States/Orders/order-state.service';
import { ToastrService } from 'ngx-toastr';
import { PincodeFileUploadComponent } from '../Dialog/pincode-file-upload/pincode-file-upload.component';

@Component({
  selector: 'app-pincode-master',
  templateUrl: './pincode-master.component.html',
  styleUrl: './pincode-master.component.css',
})
export class PincodeMasterComponent {
  pageIndex: number = 0;
  pageSize: number = 10;
  pincodeData: any[] = [];
  totalOrders: number = 0;
  buttonText: string = 'Filters';
  buttonIcon: string = 'ri-filter-fill';
  showFiltersForm: boolean = false;
  pincode: string = '';

  private refreshSubscription?: Subscription;

  constructor(
    private apiservice: ApiService,
    private dialog: MatDialog,
    private http: HttpClient,
    private refreshservice: RefreshService,
    private router: Router,
    private toastr: ToastrService,
    private ordersStateService: OrderStateService,
    private route: ActivatedRoute,
  ) {}

  ngOnInit(): void {
    const savedPageIndex = this.ordersStateService.getPageIndex();

    if (savedPageIndex !== null) {
      this.pageIndex = savedPageIndex;
    }

    this.fetchData(this.pageIndex, this.pageSize);
    this.refreshSubscription = this.refreshservice.refreshNeeded.subscribe(
      () => {
        this.fetchData(this.pageIndex, this.pageSize);
      },
    );
  }

  ngOnDestroy(): void {
    this.ordersStateService.setPageIndex(this.pageIndex);
    if (this.refreshSubscription) {
      this.refreshSubscription.unsubscribe();
    }
  }

  toggleFiltersForm() {
    this.showFiltersForm = !this.showFiltersForm;
    this.buttonText = this.showFiltersForm ? 'Close' : 'Filters';
    this.buttonIcon = this.showFiltersForm ? 'ri-close-fill' : 'ri-filter-fill';
  }

  openDialog(): void {
    this.dialog.open(PincodeFileUploadComponent, {
      panelClass: 'rounded-dialog',
    });
  }

  applyFilters() {
    this.fetchData(this.pageIndex, this.pageSize);
  }

  clearFilters() {
    this.pincode = '';
    this.fetchData(this.pageIndex, this.pageSize);
  }

  handlePageEvent(event: { pageIndex: number; pageSize: number }) {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.ordersStateService.setPageIndex(this.pageIndex);
    this.fetchData(this.pageIndex, this.pageSize);
  }

  fetchData(pageIndex: number, pageSize: number) {
    let params = new HttpParams()
      .set('pageNumber', (pageIndex + 1).toString())
      .set('pageSize', pageSize.toString());

    if (this.pincode != '') {
      params = params.set('pincode', this.pincode);
    }

    this.http.get(this.apiservice.PincodeMaster, { params }).subscribe(
      (res: any) => {
        this.pincodeData = res.records;
        this.totalOrders = res.totalRecords;
      },
      (error) => {},
    );
  } 

  copyPincode(value: string) {
    navigator.clipboard.writeText(String(value)).then(() => {
      this.toastr.success('Copied');
    });
  }
}
