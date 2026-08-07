import { trigger, state, style, transition, animate } from '@angular/animations';
import { HttpClient } from '@angular/common/http';
import { Component, Inject, OnInit } from '@angular/core';
import { ChangeRTOStatusmodal } from '../../modals/changeRtoStatusmodel';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { RefreshService } from '../../services/refresh.service';
import { ToastrService } from 'ngx-toastr';
import { ApiService } from '../../services/api.service';


interface StatusData {
  role: number;
  id: number;  // Assuming id is a number
  name: string;
}

@Component({
  selector: 'app-rto-change-status',
  templateUrl: './rto-change-status.component.html',
  styleUrl: './rto-change-status.component.css',
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
export class RtoChangeStatusComponent implements OnInit {

  statusdata: any[] = [];
  constructor(private toastr: ToastrService,
    private dialogRef: MatDialogRef<RtoChangeStatusComponent>,
    private http: HttpClient,
    private refreshservice: RefreshService,
    private apiservice: ApiService,
    @Inject(MAT_DIALOG_DATA) public data: { orderIds: string[] ,statusID: number}) {

  }

  changeRtostatusObj: ChangeRTOStatusmodal = new ChangeRTOStatusmodal();
  ngOnInit(): void {
    this.loadStatusdata();
  }
  loadStatusdata(): void {
    this.http.get<any>(this.apiservice.RtoStatus).subscribe(response => {
      this.statusdata = response.data.slice(1, 4);
    });
  }

  closeDialog() {
    this.dialogRef.close();
  }

  changeStatus() {

    this.changeRtostatusObj.rtoID = this.data.orderIds.map(id => String(id));
    this.changeRtostatusObj.newStatus = Number(this.changeRtostatusObj.newStatus);
    this.http.patch(this.apiservice.ChangeRtoStatus, this.changeRtostatusObj).subscribe((res: any) => {
      if (res.status) {
        this.toastr.success('Status Changed Successfully.', 'Success');
        this.dialogRef.close();
        this.refreshservice.triggerRefresh(); 
      }
      else {
        this.toastr.error(res.errors, 'Failure');
      }
    })
  }
}
