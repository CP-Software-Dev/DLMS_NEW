import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { HttpClient, HttpParams } from '@angular/common/http';
import { ToastrService } from 'ngx-toastr';
import { Subscription } from 'rxjs';
import { RefreshService } from '../../services/refresh.service';
@Component({
  selector: 'app-webhook',
  templateUrl: './webhook.component.html',
  styleUrl: './webhook.component.css'
})
export class WebhookComponent implements OnInit , OnDestroy  {

  webhookdata: any[] = []
  webhookuser: string = '';
  currentFilters: any = {};
  sellerId: number = 0;
  private refreshSubscription?: Subscription;

  constructor(private router: Router,
    private route: ActivatedRoute,
    private toastr: ToastrService,
    private apiservice: ApiService,
    private refreshservice : RefreshService,
    private http: HttpClient) { }

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      if (params['sellerId']) {
        this.sellerId = params['sellerId'];
      }
    });
    this.applyFilters();
    this.fetchWebhooks();
    this.refreshSubscription = this.refreshservice.refreshNeeded.subscribe(() => {
      this.fetchWebhooks();
  });
  }

 



ngOnDestroy(): void {
  if (this.refreshSubscription) {
    this.refreshSubscription.unsubscribe();
  }
}

  applyFilters(): void {
    this.currentFilters = {};

    if (this.sellerId != 0) {
      this.currentFilters.sellerId = this.sellerId;
    }
    this.fetchWebhooks(this.currentFilters);
  }

  navigateToAddWebhook() {
    this.router.navigate(['admin/webhook/add']);
  }

  fetchWebhooks(filters: any = this.currentFilters) {
    let params = new HttpParams()

    if (filters.sellerId) {
      params = params.set('sellerId', filters.sellerId);
    }

    this.http.get(this.apiservice.Webhooks, { params })
      .subscribe((res: any) => {
        if (res.status) {
          this.webhookdata = res.data;
        }
      }, error => {
        console.error("API Error:", error);
      });
  }

  editWebhook(webhook: number) {
    this.router.navigate(['admin/webhook/add'], { queryParams: { sellerId: webhook } });
  }

  deleteWebhook(webhook: number) {
    let params = new HttpParams()
      .set('Id', webhook);

    this.http.post(this.apiservice.DeleteWebhook, {}, { params }).subscribe((res: any) => {
      if (res.status) {
        this.toastr.success('Webhook Deleted.', 'Success')
        this.refreshservice.triggerRefresh();
      }
      else{
        this.toastr.error('Failed to delete webhook.', 'Failure')
      }
    },error=>
    {
      this.toastr.error(error, 'Failure')
    })
  }
}
