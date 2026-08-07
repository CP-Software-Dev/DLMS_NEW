import { Component } from '@angular/core';
import { trigger, state, transition, style, animate } from '@angular/animations';
import { HttpEventType, HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { ToastrService } from 'ngx-toastr';
import { MatDialogRef } from '@angular/material/dialog';
import { ApiService } from '../../services/api.service';
import { RefreshService } from '../../services/refresh.service';
import { Subscription } from 'rxjs';
import { SellerService } from '../../services/seller.service';

@Component({
  selector: 'app-rto-upload',
  templateUrl: './rto-upload.component.html',
  styleUrl: './rto-upload.component.css',
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
export class RtoUploadComponent {
  constructor(private apiservice: ApiService,
    private http: HttpClient,
    private toastr: ToastrService,
    private refreshservice: RefreshService,
    private sellerService: SellerService,
    private dialogRef: MatDialogRef<RtoUploadComponent>) { }
  selectedFileName: string = '';
  fileInvalid: boolean = false;
  fileSelected: boolean = false;
  file: File | null = null;
  sellerData: any[] = [];
  userRole: number = 0;
  sellerId: string = '';
  ngOnInit(): void {
    this.loadSellerData();
    const Role = this.sellerService.getItem('role');
     this.userRole = Number(Role)

     if (this.userRole > 2) {
      const seller = this.sellerService.getItem('seller');
      this.sellerId = String(seller); // Assuming seller object has an `id` property
    }
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
      const formData: FormData = new FormData();
      formData.append('file', this.file, this.file.name);

      const url = `${this.apiservice.RtoUpload}?file=${this.file.name}&institutionId=${this.sellerId}`;

      const headers = new HttpHeaders({
        'Accept': 'application/json'
      });

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
