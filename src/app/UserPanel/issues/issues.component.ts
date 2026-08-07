import { Component, OnInit } from '@angular/core';
import { SellerService } from '../../services/seller.service';
import { HttpClient, HttpParams } from '@angular/common/http';
import { ApiService } from '../../services/api.service';
import { MatDialog } from '@angular/material/dialog';
import { ToastrService } from 'ngx-toastr';
import { IssuedetailsComponent } from '../../Dialog/issuedetails/issuedetails.component';

@Component({
  selector: 'app-issues',
  templateUrl: './issues.component.html',
  styleUrl: './issues.component.css'
})
export class IssuesComponent implements OnInit {

  constructor(private sellerService: SellerService,
    private http: HttpClient,
    private apiservice: ApiService,
    private toastr: ToastrService,
    private dailog: MatDialog) {

  }
  pageIndex: number = 0;
  totalCount: number = 0;
  pageSize: number = 10;
  seller: any;
  issuesList: any[] = [];
  ngOnInit(): void {
    this.seller = this.sellerService.getItem('seller');
    this.getIssues(this.pageIndex, this.pageSize);
  }

  getIssues(pageIndex: number, pageSize: number): void {
    let params = new HttpParams()
      .set('page', (pageIndex + 1).toString())
      .set('dataCount', pageSize.toString());
    if (this.seller) {
      params = params.set('institutionId', this.seller);
    }

    this.http.get(this.apiservice.Issues, { params }).subscribe((res: any) => {
      console.log('REsult',res);
      if (res.status) {
        this.issuesList = res.data.ticketDatas;
        this.totalCount = res.data.total;
      }
    }, error => {
      this.toastr.error(error);
    })
  }


  getStatusClass(status: string): string {
    switch (status.toLowerCase()) {
      case 'open':
        return 'open';
      case 'in progress':
        return 'in-progress';
      case 'closed':
        return 'closed';
        case 'resolved':
        return 'resolved';
      default:
        return '';
    }
  }
  

  viewDetails(issue: any) : void {
    this.dailog.open(IssuedetailsComponent,{
      data:{
        subject:issue.subject,
        institution:issue.institution,
        ticketId: issue.ticketId,
        description:issue.issueDescription,
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
