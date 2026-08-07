import { Component, OnDestroy, OnInit } from '@angular/core';
import { trigger, state, transition, style, animate } from '@angular/animations';
import { HttpEventType, HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { ToastrService } from 'ngx-toastr';
import { MatDialogRef } from '@angular/material/dialog';
import { ApiService } from '../../services/api.service';
import { RefreshService } from '../../services/refresh.service';

import { Subscription } from 'rxjs';

@Component({
  selector: 'app-upload-branch-orders',
  templateUrl: './upload-branch-orders.component.html',
  styleUrl: './upload-branch-orders.component.css',
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
export class UploadBranchOrdersComponent implements OnInit , OnDestroy {

  constructor(private apiservice: ApiService,
    private http: HttpClient,
    private toastr: ToastrService,
    private refreshservice: RefreshService,
    private dialogRef: MatDialogRef<UploadBranchOrdersComponent>) {

     }
  selectedFileName: string = '';
  fileInvalid: boolean = false;
  fileSelected: boolean = false;
  file: File | null = null;
  sellerData: any[] = [];
  sellerId: string = '';


  ngOnInit(): void {
    this.loadSellerData();
  }

  ngOnDestroy() {

  }
  loadSellerData(): void {
    this.http.get<any>(this.apiservice.SellerData).subscribe(response => {
      this.sellerData = response.data;
    });
  }

  onFileSelected(event: any) {
    const file: File = event.target.files[0];

    if (file) {

      if (file.type === 'text/csv') {
        this.selectedFileName = file.name;
        this.fileSelected = true;
        this.fileInvalid = false;
        this.file = file;

      } else {
        this.selectedFileName = '';
        this.fileSelected = false;
        this.fileInvalid = true;
        this.file = null;

      }
    } else {
      this.selectedFileName = '';
      this.fileSelected = false;
      this.fileInvalid = false;
      this.file = null; // Reset fileInvalid flag
    }
  }

  uploadFile() {
    if (this.file && this.sellerId) {

      debugger;
      const formData: FormData = new FormData();
      formData.append('file', this.file, this.file.name);

      const url = `${this.apiservice.uploadbBranchOrders}?file=${this.file.name}&companyID=${this.sellerId}`;

      debugger;
      const headers = new HttpHeaders({
        'Accept': 'application/json'
      });

      debugger;
      this.http.post(url, formData, { headers }).subscribe((res: any) => {
        if (res.status) {
          this.toastr.success('File Uploaded Successfully.', 'Success');
          this.dialogRef.close();
          this.refreshservice.triggerRefresh();
        }
        else {
          this.toastr.error(res.errors, 'Failure');
        }
      })
    }
  }

  closeDialog() {
    this.dialogRef.close();
    
  }
}
