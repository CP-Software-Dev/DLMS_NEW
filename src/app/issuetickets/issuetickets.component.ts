import { HttpClient, HttpParams } from '@angular/common/http';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { ApiService } from '../services/api.service';
import { SellerService } from '../services/seller.service';
import { ToastrService } from 'ngx-toastr';
import { RefreshService } from '../services/refresh.service';
import { Subscription } from 'rxjs';
import { IssuedetailsComponent } from '../Dialog/issuedetails/issuedetails.component';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-issuetickets',
  templateUrl: './issuetickets.component.html',
  styleUrl: './issuetickets.component.css'
})
export class IssueticketsComponent implements OnInit, OnDestroy {

  pageIndex: number = 0;
  pageSize: number = 10;
  totalCount: number = 0;
  issuesList: any[] = [];
  sellerData: any[] = [];
  currentFilters: any = {};
  selectedIssue: any = null;
  private refreshSubscription?: Subscription;
  institution: number = 0;

  seller: any;
  isAdminView: boolean = false;

  ngOnInit(): void {
    // valid seller id (number > 0) = user view, warna (null / "null" / 0 / khali) = admin view
    const sellerId = Number(this.sellerService.getItem('seller'));
    this.seller = sellerId > 0 ? sellerId : null;
    this.isAdminView = !this.seller;

    if (this.isAdminView) {
      this.GetSeller();
    }
    this.getIssues(this.pageIndex, this.pageSize);

    this.refreshSubscription = this.refreshservice.refreshNeeded.subscribe(() => {
      this.getIssues(this.pageIndex, this.pageSize);
    });
  }

  ngOnDestroy(): void {
    this.refreshSubscription?.unsubscribe();
  }

  constructor(private http: HttpClient,
    private apiservice: ApiService,
    private sellerService: SellerService,
    private dailog: MatDialog,
    private refreshservice: RefreshService,
    private toastr: ToastrService) {
  }

  GetSeller(): void {
    this.http.get<any>(this.apiservice.SellerData).subscribe(response => {
      this.sellerData = response.data;
    });
  }

  getIssues(pageIndex: number, pageSize: number): void {
    let params = new HttpParams()
      .set('page', (pageIndex + 1).toString())
      .set('dataCount', pageSize.toString());

    // user: hamesha apni institution, admin: sirf jab bank select kiya ho
    const institutionId = this.isAdminView ? this.institution : this.seller;
    if (institutionId) {
      params = params.set('institutionId', institutionId);
    }

    this.http.get(this.apiservice.Issues, { params }).subscribe((res: any) => {
      if (res.status) {
        this.totalCount = res.data.total;
        this.issuesList = res.data.ticketDatas;
      }
    }, error => {
      this.toastr.error(error);
    })
  }

  selectIssue(issue: any) {
    this.selectedIssue = issue;
  }

  onBankChange(event: Event): void {
    const selectedBankId = (event.target as HTMLSelectElement).value;
    this.institution = Number(selectedBankId);
    this.pageIndex = 0;
    this.getIssues(this.pageIndex, this.pageSize);
  }

  onStatusChange(issue: any) {
    if (!this.isAdminView) return;

    let params = new HttpParams()
      .set('ticketId', Number(issue.ticketId))
      .set('status', issue.status.toString());

    this.http.put(this.apiservice.Issues, {}, { params }).subscribe((res: any) => {
      if (res.status) {
        this.toastr.success('Status updated successfully');
      }
    }, error => {
      this.toastr.error(error);
    })
  }

  getStatusClass(status: string): string {
    switch ((status || '').toLowerCase()) {
      case 'open':
        return 'st-open';
      case 'in progress':
        return 'st-progress';
      case 'resolved':
        return 'st-resolved';
      case 'closed':
        return 'st-closed';
      default:
        return '';
    }
  }

  viewDetails(issue: any): void {
    this.dailog.open(IssuedetailsComponent, {
      data: {
        subject: issue.subject,
        institution: issue.institution,
        ticketId: issue.ticketId,
        description: issue.issueDescription,
        createdAt: issue.createdAt,
        status: issue.status
      }
    })
  }

  handlePageEvent(event: { pageIndex: number, pageSize: number }) {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.getIssues(this.pageIndex, this.pageSize);
  }

}