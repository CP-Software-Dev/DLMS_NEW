import { Component, OnInit, Inject } from '@angular/core';
import { trigger, state, transition, style, animate } from '@angular/animations';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ApiService } from '../../services/api.service';
import { Prioritymodal } from '../../modals/courierPrioritymodal';
@Component({
  selector: 'app-editpriority',
  templateUrl: './editpriority.component.html',
  styleUrl: './editpriority.component.css',
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
export class EditpriorityComponent implements OnInit {


  id: number = 0;
  name: string = '';
  institution: string = '';
  firstPriority: string = '';
  secondPriority: string = '';
  thirdPriority: string = '';
  institutionId: number  = 0;
  firstPriorityId: number = 0;
  secondPriorityId: number = 0;
  thirdPriorityId: number = 0;
  courierData: any[] = [];
  sellerData: any[] = []


  priorityObj: Prioritymodal = new Prioritymodal()
  constructor(
    private dialog: MatDialog,
    private toastr: ToastrService,
    private http: HttpClient,
    private apiservice: ApiService,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private dialogRef: MatDialogRef<EditpriorityComponent>) {
    debugger;
    if (data) {
      this.id = data.id;
      this.name = data.name || '';
      this.institution = data.institution || '';
      this.firstPriority = data.firstPriority || '';
      this.secondPriority = data.secondPriority || '';
      this.thirdPriority = data.thirdPriority || '';

      this.mapNamesToIds();
    }

    this.priorityObj = new Prioritymodal();
  }

  ngOnInit(): void {
    this.GetCourier();
    this.GetSeller();
  }

  GetCourier(): void {
    this.http.get<any>(this.apiservice.CourierData).subscribe(response => {
      this.courierData = response.data;
      this.mapNamesToIds();
    })
  }

  GetSeller(): void {
    this.http.get<any>(this.apiservice.SellerData).subscribe(response => {
      this.sellerData = response.data;
      this.mapInstitutionToId();
    });
  }

  mapInstitutionToId(): void {
    const findSellerIdByInstitution = (institution: string) => {
      const item = this.sellerData.find(seller => seller.name === institution);
      return item ? item.id : null;
    };

    this.institutionId = findSellerIdByInstitution(this.institution);
  }

  mapNamesToIds(): void {
    const findCourierIdByName = (name: string) => {
      const item = this.courierData.find(courier => courier.name === name);
      return item ? item.id : null;
    };
    this.firstPriorityId = findCourierIdByName(this.firstPriority);
    this.secondPriorityId = findCourierIdByName(this.secondPriority);
    this.thirdPriorityId = findCourierIdByName(this.thirdPriority);
  }

  closeDialog() {
    this.dialogRef.close();
  }

  UpdatePriority(): void {
    this.priorityObj.id = this.id;
    this.priorityObj.name = this.name;
    this.priorityObj.institutionId = this.institutionId;
    this.priorityObj.firstPriority = Number(this.firstPriorityId);
    this.priorityObj.secondPriority = Number(this.secondPriorityId);
    this.priorityObj.thirdPriority = Number(this.thirdPriorityId);

    this.http.post(this.apiservice.CourierPriority, this.priorityObj).subscribe((res: any) => {
      if (res.status) {
        this.toastr.success('Courier Priority Updated.')
        window.location.reload();
      }
      else {
        this.toastr.error(res.errors, 'Failure');
      }
    })
  }
}
