import { Component, OnDestroy, OnInit } from "@angular/core";
import {
  trigger,
  state,
  transition,
  style,
  animate,
} from "@angular/animations";
import {
  HttpEventType,
  HttpClient,
  HttpHeaders,
  HttpErrorResponse,
} from "@angular/common/http";
import { ToastrService } from "ngx-toastr";
import { MatDialogRef } from "@angular/material/dialog";
import { ApiService } from "../../services/api.service";
import { RefreshService } from "../../services/refresh.service";

import { Subscription } from "rxjs";
@Component({
  selector: "app-order-upload",
  templateUrl: "./order-upload.component.html",
  styleUrl: "./order-upload.component.css",
  animations: [
    trigger("fadeSlideInOut", [
      state(
        "void",
        style({
          opacity: 0,
          transform: "translateY(-50%)",
        })
      ),
      transition("void => *", [
        animate(
          "700ms ease",
          style({
            opacity: 1,
            transform: "translateY(0)",
          })
        ),
      ]),
      transition("* => void", [
        animate(
          "300ms ease",
          style({
            opacity: 0,
            transform: "translateY(-50%)",
          })
        ),
      ]),
    ]),
  ],
})
export class OrderUploadComponent implements OnInit, OnDestroy {
  constructor(
    private apiservice: ApiService,
    private http: HttpClient,
    private toastr: ToastrService,
    private refreshservice: RefreshService,
    private dialogRef: MatDialogRef<OrderUploadComponent>
  ) {}
  selectedFileName: string = "";
  fileInvalid: boolean = false;
  fileSelected: boolean = false;
  file: File | null = null;
  sellerData: any[] = [];
  sellerId: string = "";

  lotId: string = "";
  showLotId: boolean = false;

  ngOnInit(): void {
    this.loadSellerData();
  }

  ngOnDestroy() {}
  loadSellerData(): void {
    this.http.get<any>(this.apiservice.SellerData).subscribe((response) => {
      this.sellerData = response.data;
    });
  }

  onSellerChange() {
    const selectedSeller = this.sellerData.find(
      (x: any) => x.id == this.sellerId
    );

    if (selectedSeller) {
      const sellerName = selectedSeller.name.toLowerCase().replace(/\s+/g, ""); // remove all spaces

      this.showLotId =
        sellerName.includes("shriram") || sellerName.includes("shreeram");
    } else {
      this.showLotId = false;
    }

    if (!this.showLotId) {
      this.lotId = "";
    }
  }
  onFileSelected(event: any) {
    const file: File = event.target.files[0];

    if (file) {
      if (file.type === "text/csv") {
        this.selectedFileName = file.name;
        this.fileSelected = true;
        this.fileInvalid = false;
        this.file = file;
      } else {
        this.selectedFileName = "";
        this.fileSelected = false;
        this.fileInvalid = true;
        this.file = null;
      }
    } else {
      this.selectedFileName = "";
      this.fileSelected = false;
      this.fileInvalid = false;
      this.file = null; // Reset fileInvalid flag
    }
  }

  // uploadFile() {
  //   if (this.file) {
  //     const formData: FormData = new FormData();
  //     formData.append("file", this.file, this.file.name);

  //     const url = `${this.apiservice.UploadOrders}?file=${this.file.name}`;

  //     const headers = new HttpHeaders({
  //       Accept: "application/json",
  //     });

  //     this.http.post(url, formData, { headers }).subscribe((res: any) => {
  //       if (res.status) {
  //         this.toastr.success("File Uploaded Successfully.", "Success");
  //         this.dialogRef.close();
  //         this.refreshservice.triggerRefresh();
  //       } else {
  //         this.toastr.error(res.errors, "Failure");
  //       }
  //     });
  //   }
  // }

  uploadFile() {

    if (!this.file) {
      this.toastr.error("Please select a file.", "Validation");
      return;
    }

    // Seller validation
    if (!this.sellerId) {
      this.toastr.error("Please select a seller.", "Validation");
      return;
    }

    let lotIdValue = 0; // integer default

    if (this.showLotId) {
      if (!this.lotId || this.lotId.trim() === "") {
        this.toastr.error("Please enter Lot ID", "Validation");
        return;
      }

      if (!/^\d+$/.test(this.lotId.trim())) {
        this.toastr.error("Lot ID must be an integer number", "Validation");
        return;
      }

      lotIdValue = parseInt(this.lotId.trim(), 10);
    }

    const formData: FormData = new FormData();
    formData.append("file", this.file, this.file.name);

    const url = `${this.apiservice.UploadOrders}?file=${this.file.name}&institutionId=${this.sellerId}&lotId=${lotIdValue}`;

    const headers = new HttpHeaders({
      Accept: "application/json",
    });

    this.http.post(url, formData, { headers }).subscribe((res: any) => {
      if (res.status) {
        this.toastr.success("File Uploaded Successfully.", "Success");
        this.dialogRef.close();
        this.refreshservice.triggerRefresh();
      } else {
        this.toastr.error(res.errors, "Failure");
      }
    });
  }

  closeDialog() {
    this.dialogRef.close();
  }
}
