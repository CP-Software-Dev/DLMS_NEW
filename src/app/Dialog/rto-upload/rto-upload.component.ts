import { Component, OnInit } from '@angular/core';
import {
  trigger,
  state,
  transition,
  style,
  animate,
} from '@angular/animations';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ToastrService } from 'ngx-toastr';
import { MatDialogRef } from '@angular/material/dialog';
import { ApiService } from '../../services/api.service';
import { RefreshService } from '../../services/refresh.service';
import { SellerService } from '../../services/seller.service';

interface ExpectedColumn {
  name: string;
  required: boolean;
  example: string;
  note?: string;
}

@Component({
  selector: 'app-rto-upload',
  templateUrl: './rto-upload.component.html',
  styleUrl: './rto-upload.component.css',
  animations: [
    trigger('fadeSlideInOut', [
      state(
        'void',
        style({
          opacity: 0,
          transform: 'translateX(100%)',
        })
      ),
      transition('void => *', [
        animate(
          '200ms ease',
          style({
            opacity: 1,
            transform: 'translateX(0)',
          })
        ),
      ]),
      transition('* => void', [
        animate(
          '200ms ease',
          style({
            opacity: 0,
            transform: 'translateX(100%)',
          })
        ),
      ]),
    ]),
  ],
})
export class RtoUploadComponent implements OnInit {
  constructor(
    private apiservice: ApiService,
    private http: HttpClient,
    private toastr: ToastrService,
    private refreshservice: RefreshService,
    private sellerService: SellerService,
    private dialogRef: MatDialogRef<RtoUploadComponent>
  ) {}

  private readonly MAX_FILE_SIZE = 20 * 1024 * 1024; // 20 MB

  selectedFileName: string = '';
  fileInvalid: boolean = false;
  fileSelected: boolean = false;
  file: File | null = null;
  errorMessage: string = '';

  sellerData: any[] = [];
  userRole: number = 0;
  sellerId: string = '';

  // ------------- top options --------------
  importKind: string = 'logistics';
  orderCategory: string = 'perso';
  lotId: string = '';

  // ------------- drag and drop --------------
  isDragOver: boolean = false;

  // Expected format table (isi array se table banta hai)
  expectedColumns: ExpectedColumn[] = [
    { name: 'ORDER_REF', required: true, example: 'SR-10241' },
    { name: 'KIT_NUMBER', required: true, example: 'SHRI55550000339133' },
    { name: 'CARD_BIN', required: true, example: '40651111', note: 'first 8 digits only' },
    { name: 'CARD_LAST4', required: true, example: '3333', note: 'the full PAN is never stored' },
    { name: 'CUSTOMER_NAME', required: true, example: 'VIJAY KUMAR' },
    { name: 'ADDRESS1', required: true, example: '12 MG Road' },
    { name: 'ADDRESS2', required: false, example: 'Near Metro Gate 3' },
    { name: 'CITY', required: true, example: 'Bengaluru' },
    { name: 'STATE', required: true, example: 'KA' },
    { name: 'PINCODE', required: true, example: '560001' },
    { name: 'MOBILE', required: true, example: '9810000001' },
    { name: 'EMAIL', required: false, example: 'vijay@example.com' },
    { name: 'WEIGHT', required: false, example: '100', note: 'grams, defaults by product type' },
    { name: 'LOT_ID', required: false, example: '87' },
  ];

  ngOnInit(): void {
    this.loadSellerData();

    this.userRole = Number(this.sellerService.getItem('role'));

    if (this.userRole > 2) {
      const seller = this.sellerService.getItem('seller');
      this.sellerId = String(seller);
    }
  }

  loadSellerData(): void {
    this.http.get<any>(this.apiservice.SellerData).subscribe((response) => {
      this.sellerData = response.data;
    });
  }

  onFileSelected(event: any) {
    const file: File | undefined = event.target.files[0];
    this.validateAndSetFile(file ?? null);
  }

  private validateAndSetFile(file: File | null) {
    if (!file) {
      this.resetFile(false);
      return;
    }

    const isCsv =
      file.type === 'text/csv' || file.name.toLowerCase().endsWith('.csv');

    if (!isCsv) {
      this.errorMessage = 'Invalid file format. Please select a .csv file.';
      this.resetFile(true);
      return;
    }

    if (file.size > this.MAX_FILE_SIZE) {
      this.errorMessage = 'File is too large. Maximum size is 20 MB.';
      this.resetFile(true);
      return;
    }

    this.selectedFileName = file.name;
    this.fileSelected = true;
    this.fileInvalid = false;
    this.errorMessage = '';
    this.file = file;
  }

  private resetFile(invalid: boolean) {
    this.selectedFileName = '';
    this.fileSelected = false;
    this.fileInvalid = invalid;
    this.file = null;
  }

  onDragOver(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver = true;
  }

  onDragLeave(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver = false;
  }

  onFileDrop(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver = false;

    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      this.validateAndSetFile(files[0]);
    }
  }

  uploadFile() {
    if (!this.file) {
      return;
    }

    if (!this.sellerId) {
      this.toastr.error('Please select an institute', 'Validation');
      return;
    }

    const lotIdTrimmed = this.lotId.trim();
    if (lotIdTrimmed && !/^\d+$/.test(lotIdTrimmed)) {
      this.toastr.error('Lot ID must be an integer number', 'Validation');
      return;
    }

    const formData: FormData = new FormData();
    formData.append('file', this.file, this.file.name);

    const url = `${this.apiservice.RtoUpload}?file=${this.file.name}&institutionId=${this.sellerId}`;

    const headers = new HttpHeaders({
      Accept: 'application/json',
    });

    this.http.post(url, formData, { headers }).subscribe((res: any) => {
      if (res.status) {
        this.toastr.success('File Uploaded Successfully.', 'Success');
        this.dialogRef.close();
        this.refreshservice.triggerRefresh();
      } else {
        this.toastr.error(res.errors, 'Failure');
      }
    });
  }

  closeDialog() {
    this.dialogRef.close();
  }
}