import {
  Component,
  ElementRef,
  Input,
  OnInit,
  OnChanges,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Subscription } from 'rxjs';
import { RefreshService } from '../../services/refresh.service';
import { SellerService } from '../../services/seller.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-awbstatus',
  templateUrl: './awbstatus.component.html',
  styleUrl: './awbstatus.component.css',
})
export class AwbstatusComponent implements OnInit, OnChanges {
  @Input() awbInput: string = '';

  awb: string = '';
  details: any[] = [];
  statusdata: any[] = [];
  seller: any;
  statusAWB: string = '';

  // ---- sliding window state ----
  startIndex: number = 0;
  itemsPerPage: number = 3;

  private refreshSubscription?: Subscription;
  private routeSubscription?: Subscription;

  constructor(
    private route: ActivatedRoute,
    private refreshservice: RefreshService,
    private router: Router,
    private apiservice: ApiService,
    private sellerService: SellerService,
    private http: HttpClient,
    private toastr: ToastrService,
  ) {}

  ngOnInit() {
    this.seller = this.sellerService.getItem('seller');

    if (this.awbInput) {
      this.awb = this.awbInput;
      this.fetchDetails();
      this.fetchStatus();
    } else {
      this.routeSubscription = this.route.paramMap.subscribe((params) => {
        this.awb = params.get('awb') || '';
        this.fetchDetails();
        this.fetchStatus();
      });
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (
      changes['awbInput'] &&
      !changes['awbInput'].isFirstChange() &&
      this.awbInput
    ) {
      this.awb = this.awbInput;
      this.fetchDetails();
      this.fetchStatus();
    }
  }

  ngOnDestroy(): void {
    this.routeSubscription?.unsubscribe();
    this.refreshSubscription?.unsubscribe();
  }

  fetchDetails(): void {
    let params = new HttpParams().set('uid', this.awb);
    this.http.get(this.apiservice.OrderDetails, { params }).subscribe(
      (res: any) => {
        if (res.status) {
          this.details = res.data.orders;
        }
      },
      (error) => {
        console.error('API Error:', error);
      },
    );
  }

  getActiveStatusIndex(currentStatus: string): number {
    return this.statusdata.findIndex((status) => status.name === currentStatus);
  }

  navigateToOrderDetail(orderID: string): void {
    const currentPath = this.router.url;
    const basePath = currentPath.includes('/user')
      ? '/user/orders/details'
      : '/admin/orders/details';
    this.router.navigate([basePath, orderID]);
  }

  fetchStatus(): void {
    let params = new HttpParams()
      .set('awb', this.awb)
      .set('sellerID', this.seller);
    this.statusAWB = this.awb;
    this.http.get(this.apiservice.AWBStatus, { params }).subscribe(
      (res: any) => {
        if (res.status) {
          this.statusdata = res.data;
          this.startIndex = 0;
        }
      },
      (error) => {},
    );
  }

  navigateToTracking(awb: string) {
    if (awb == this.awb) {
      let params = new HttpParams()
        .set('awb', awb)
        .set('sellerID', this.seller);
      this.statusAWB = awb;
      this.http.get(this.apiservice.AWBStatus, { params }).subscribe(
        (res: any) => {
          this.statusdata = res.status ? res.data : [];
          this.startIndex = 0;
        },
        (error) => {},
      );
    } else {
      let params = new HttpParams().set('awbnumber', awb);
      this.statusAWB = awb;
      this.http.post(this.apiservice.OLDAWBStatus, {}, { params }).subscribe(
        (res: any) => {
          this.statusdata = res.status ? res.data : [];
          this.startIndex = 0;
        },
        (error) => {},
      );
    }
  }

  copyToClipboard(text: string | number): void {
    if (!text) return;
    navigator.clipboard.writeText(text.toString()).then(() => {
      this.toastr.success('Copied to clipboard');
    });
  }

  // ---- sliding window getters ----
  get visibleStatusData(): any[] {
    return this.statusdata.slice(
      this.startIndex,
      this.startIndex + this.itemsPerPage,
    );
  }

  get canGoPrev(): boolean {
    return this.startIndex > 0;
  }

  get canGoNext(): boolean {
    return this.startIndex + this.itemsPerPage < this.statusdata.length;
  }

  prevPage(): void {
    if (this.canGoPrev) {
      this.startIndex--;
    }
  }

  nextPage(): void {
    if (this.canGoNext) {
      this.startIndex++;
    }
  }
}
