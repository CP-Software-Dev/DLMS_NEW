import { Component, OnInit, Inject } from '@angular/core';
import { trigger, state, transition, style, animate } from '@angular/animations';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ApiService } from '../../services/api.service';
import { SellerService } from '../../services/seller.service';
import { error } from 'console';
import { RefreshService } from '../../services/refresh.service';

@Component({
  selector: 'app-edit-permissions',
  templateUrl: './edit-permissions.component.html',
  styleUrl: './edit-permissions.component.css',
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
export class EditPermissionsComponent implements OnInit {


  firstName: string = '';
  userID: number = 0;
  lastName: string = '';
  email: string = '';
  contact: string = '';
  username: string = '';
  hasOrders: boolean = false;
  hasShipments: boolean = false;
  hasReports: boolean = false;
  hasNdr : boolean = false;
  hasRto: boolean = false;

  constructor(private apiservice: ApiService,
    private sellerService: SellerService,
    private http: HttpClient,
    private dialog: MatDialog,
    private router: Router,
    private refreshService : RefreshService,
    private toastr: ToastrService,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private dialogRef: MatDialogRef<EditPermissionsComponent>) {
    if (data) {
      this.userID = data.userid;
      this.username = data.username;
      this.firstName = data.firstName;
      this.lastName = data.lastName;
      this.email = data.email;
      this.contact = data.contact;
      this.hasOrders = data.hasOrder === 1;
      this.hasShipments = data.hasShipment === 1;
      this.hasReports = data.hasReport === 1;
      this.hasNdr = data.hasNdr === 1;
      this.hasRto = data.hasRto === 1;
    }
  }

  ngOnInit(): void {

  }

  closeDialog() {
    this.dialogRef.close();
  }

  update(): void {
    
    const orders = this.hasOrders ? 1 : 0;
    const Shipment = this.hasShipments  ? 1 : 0;
    const NDR = this.hasNdr ? 1 : 0;
    const Rto = this.hasRto ? 1 : 0;
    const Report = this.hasReports ? 1 : 0;
    let params = new HttpParams()
    .set('username', this.username )
    .set('hasOrders', orders)
    .set('hasShipment', Shipment)
    .set('hasReports', Report)
    .set('hasNdr', NDR)
    .set('hasRto', Rto);

    this.http.put(this.apiservice.EditPermission , {}, {params}).subscribe((res:any)=>{
      if(res.status)
      {
        this.toastr.success('Permission Updated' , 'Success');
        this.refreshService.triggerRefresh();
          this.closeDialog();
      }
      else{
        this.toastr.error('Failed to update permissions', 'Failure');
      }
    },error=>
    {
      this.toastr.error(error , 'Failure');
    })
  }
}
