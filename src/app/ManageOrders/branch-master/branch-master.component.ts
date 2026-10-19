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
import { Subscription } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
import { ApiService } from '../../services/api.service';
import { RefreshService } from '../../services/refresh.service';
import { OrderStateService } from '../../services/States/Orders/order-state.service';
import { BranchMasterFileUploadComponent } from '../../Dialog/branch-master-file-upload/branch-master-file-upload.component';

@Component({
  selector: 'app-branch-master',
  templateUrl: './branch-master.component.html',
  styleUrl: './branch-master.component.css',
})
export class BranchMasterComponent {
  pageIndex: number = 0;
  pageSize: number = 10;
  pincodeData: any[] = [];
  totalOrders: number = 0;
  buttonText: string = 'Filters';
  buttonIcon: string = 'ri-filter-fill';
  showFiltersForm: boolean = false;
  pincode: string = '';
  sellerData: any[] = [];
  sellerId: string = '';

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
    this.loadSellerData();
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

  loadSellerData(): void {
    this.http.get<any>(this.apiservice.SellerData).subscribe((response) => {
      this.sellerData = response.data;
    });
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
    this.dialog.open(BranchMasterFileUploadComponent, {
      panelClass: 'credentials-drawer',
      backdropClass: 'blur-backdrop',
      width: '540px',
      maxWidth: 'calc(100vw - 32px)',
      enterAnimationDuration: '0ms',
      exitAnimationDuration: '250ms',
    });
  }

  applyFilters() {
    this.fetchData(this.pageIndex, this.pageSize);
  }

  clearFilters() {
    this.sellerId = '';
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

    if (this.sellerId) {
      params = params.set('institutionId', Number(this.sellerId));
    }

    this.http.get(this.apiservice.BranchMaster, { params }).subscribe(
      (res: any) => {
        this.pincodeData = res.data.records;
        this.totalOrders = res.data.totalRecords;
      },
      (error) => {},
    );
  }

  copyToClipboard(value: string): void {
    if (!value) return;
    navigator.clipboard
      .writeText(value)
      .then(() => this.toastr.success('Copied', 'Success'))
      .catch(() => this.toastr.error('Copy failed', 'Failure'));
  }
}
