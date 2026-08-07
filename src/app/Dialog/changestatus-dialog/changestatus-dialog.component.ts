import { trigger, state, style, transition, animate } from '@angular/animations';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ChangeStatusmodal } from '../../modals/changeStatusmodel';
import { ToastrService } from 'ngx-toastr';
import { Disaptchmodal, PickupDatails } from '../../modals/dispatchStatusmodel';
import { ApiService } from '../../services/api.service';
import { RefreshService } from '../../services/refresh.service';
import { WebhookService } from '../../services/webhook.service';
import { WebhookCallmodal } from '../../modals/webhookCall';

interface StatusData {
  role: number;
  id: number;  // Assuming id is a number
  name: string;
}

@Component({
  selector: 'app-changestatus-dialog',
  templateUrl: './changestatus-dialog.component.html',
  styleUrl: './changestatus-dialog.component.css',
  animations: [
    trigger('fadeSlideInOut', [
      state('void', style({
        opacity: 0,
        transform: 'translateY(-50%)'
      })),
      transition('void => *', [
        animate('700ms ease', style({
          opacity: 1,
          transform: 'translateY(0)'
        }))
      ]),
      transition('* => void', [
        animate('300ms ease', style({
          opacity: 0,
          transform: 'translateY(-50%)'
        }))
      ])
    ])
  ]
})
export class ChangestatusDialogComponent implements OnInit {

  orders: any[] = [];
  changestatusObj: ChangeStatusmodal = new ChangeStatusmodal();
  disaptchstatusObj: Disaptchmodal = new Disaptchmodal();
  callWebhookObj: WebhookCallmodal = new WebhookCallmodal()
  pickup_date: string = '';    
  statusdata: any[] = [];
  ngOnInit(): void {
    this.loadStatusdata();
  }
       
  constructor(private apiservice: ApiService,
    private toastr: ToastrService,
    private dialogRef: MatDialogRef<ChangestatusDialogComponent>,
    private http: HttpClient,
    private refreshservice: RefreshService,
    private webhookService: WebhookService,
    @Inject(MAT_DIALOG_DATA) public data: { orderIds: number[], statusID: number, source: string }) { }
  closeDialog() {
    this.dialogRef.close();
    this.disaptchstatusObj.pickupDatails = new PickupDatails();
  }

  loadStatusdata() {
    const allowedIds = [9, 10, 11, 12, 14, 15, 16, 17, 18];
    let roleFilter: number;
    if (this.data.source === 'orders') {
      roleFilter = 1;
    } else if (this.data.source === 'exception') {
      roleFilter = 3;  // Assuming role 3 is for exception, adjust as needed
    } else if (this.data.source === 'shipment') {
      roleFilter = 2;
    }

    this.http.get<any>(this.apiservice.StatusData).subscribe(response => {
      if (roleFilter === 1) {
        this.statusdata = response.data.filter((item: StatusData) => item.role === roleFilter).slice(0, 4);
      } else if (roleFilter === 2) {
        this.statusdata = response.data.filter((item: StatusData) => item.role === roleFilter).slice(0, 13);
      } else if (roleFilter === 3) {
        this.statusdata = response.data.filter((item: StatusData) => item.role === 2 && allowedIds.includes(item.id));
      }
      this.changestatusObj.newStatus = this.data.statusID;
    });
  }

  changeStatus() {
    this.changestatusObj.orderIDs = this.data.orderIds.map(id => String(id));
    let query: boolean = false;

    if (this.data.source === 'orders') {
      query = false;
    } else if (this.data.source === 'exception' || this.data.source === 'shipment') {
      query = true;
    }

    this.changestatusObj.newStatus = Number(this.changestatusObj.newStatus);
    const url = `${this.apiservice.ChangeStatus}?isShipment=${query}`;
    this.http.patch(url, this.changestatusObj).subscribe((res: any) => {
      if (res.status) {
        this.toastr.info(res.data);
        //this.handleOrderDetails();
        this.dialogRef.close();
        this.refreshservice.triggerRefresh();
      }
      else {
        this.toastr.error(res.errors, 'Failure');
      }
    })
  }

  handleOrderDetails() {

    this.callWebhookObj.orderIDs = this.data.orderIds.map(id => String(id));

    this.http.post(this.apiservice.CallWebhook , this.callWebhookObj).subscribe((res:any)=>
    {
      if(res.status)
      {
        console.log('Webhook sent Successfully.')
      }
    },error=>{
      this.toastr.error(error , 'Failure');
    })
  }
}
