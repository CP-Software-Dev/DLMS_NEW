import { Component, Inject, OnInit } from "@angular/core";
import { MatDialogRef } from "@angular/material/dialog";
import { MAT_DIALOG_DATA } from "@angular/material/dialog";
import {
  trigger,
  state,
  style,
  transition,
  animate,
} from "@angular/animations";
import { HttpClient, HttpParams } from "@angular/common/http";
import { ApiService } from "../../services/api.service";
import moment from "moment";
import dayjs from "dayjs";
import { SellerService } from "../../services/seller.service";
import { CredentialsModal } from "../../modals/credentialsmodel";
import { ToastrService } from "ngx-toastr";
declare var bootstrap: any;

@Component({
  selector: "app-managecourier",
  templateUrl: "./managecourier.component.html",
  styleUrl: "./managecourier.component.css",
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
export class ManagecourierComponent implements OnInit {
  isDataPresent: boolean = false;
  courierData: any = {};
  courierName: string = "";
  stock: any[] = [];
  courierID: number = 0;
  username: string = "";
  password: string = "";
  customerId: string = "";
  contractId: string = "";
  identifier: string = "";
  endSeries: string = "";
  startSeries: string = "";
  productype: string = "";
  status: any;
  seller: any;
  seller_admin: any;
  expiryDate: string = "2024-10-10T00:00:00";

  ngOnInit(): void {
    this.fetchCourierName();
    this.seller = this.sellerService.getItem("seller");
    this.initializeDate();

    var tooltipTriggerList = [].slice.call(
      document.querySelectorAll('[data-bs-toggle="tooltip"]')
    );
    var tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl) {
      return new bootstrap.Tooltip(tooltipTriggerEl);
    });
  }

  credentialsObj: CredentialsModal;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private dialogRef: MatDialogRef<ManagecourierComponent>,
    private apiservice: ApiService,
    private toastr: ToastrService,
    private sellerService: SellerService,
    private http: HttpClient
  ) {
    if (data.isEdit) {
      this.courierData = data.courierData;
      this.courierID = Number(data.courierData.courierId) || 0;
      this.username = data.courierData.username || "";
      this.password = data.courierData.password || "********";
      this.customerId = data.courierData.customerId || "";
      this.contractId = data.courierData.contractId || "";
      this.seller_admin = data.courierData.institutionId || "";
      this.identifier = data.courierData.identifier || "";
      this.startSeries = data.courierData.startSeries || "";
      this.endSeries = data.courierData.endSeries || "";
      this.productype = data.courierData.productype || "";
      this.status = data.courierData.isActive || "";
      this.expiryDate = data.courierData.expireAt || "";
      this.isDataPresent = true;
      this.getStock();
    } else {
      this.courierID = Number(data.courierId) || 0;
      this.username = "";
      this.password = "";
      this.customerId = "";
      this.contractId = "";
      this.identifier = "";
      this.startSeries = "";
      this.endSeries = "";
      this.productype = "";
      this.status = "";
      this.expiryDate = "";
    }

    this.credentialsObj = new CredentialsModal();
  }

  selectedDate: any;

  formattedDate: string = "";

  isInvalid = {
    username: false,
    password: false,
    customerId: false,
    contractId: false,
    productype: false,
    identifier: false,
    startSeries: false,
    endSeries: false,
    expireAt: false,
  };

  getStock() {
    let params = new HttpParams().set("courierId", Number(this.courierID));

    if (this.seller !== undefined && this.seller !== null) {
      params = params.set("institutionId", Number(this.seller));
    } else {
      params = params.set("institutionId", Number(this.seller_admin));
    }
    this.http.get(this.apiservice.StockDetails, { params }).subscribe(
      (res: any) => {
        if (res.status) {
          this.stock = res.data;
        }
      },
      (error) => {}
    );
  }

  allowOnlyNumeric(event: KeyboardEvent): void {
    const charCode = event.key.charCodeAt(0);
    if (!(charCode >= 48 && charCode <= 57)) {
      event.preventDefault(); // Prevent the key press
    }
  }

  initializeDate(): void {
    if (this.expiryDate) {
      const date = new Date(this.expiryDate);
      const day = ("0" + date.getDate()).slice(-2);
      const month = ("0" + (date.getMonth() + 1)).slice(-2);
      const year = date.getFullYear();
      this.formattedDate = `${day}/${month}/${year}`;
    }
  }

  allowOnlyAlphanumeric(event: KeyboardEvent): void {
    const charCode = event.key.charCodeAt(0);
    if (
      !(
        (
          (charCode >= 65 && charCode <= 90) ||
          (charCode >= 97 && charCode <= 122) ||
          (charCode >= 48 && charCode <= 57) ||
          charCode === 32
        ) // Space
      )
    ) {
      event.preventDefault();
    }
  }

  onDateInput(event: any): void {
    let input = event.target.value.replace(/\D/g, ""); // Remove non-numeric characters

    let day = input.substring(0, 2);
    let month = input.substring(2, 4);
    let year = input.substring(4, 8);

    if (day.length === 2) {
      const dayNum = parseInt(day, 10);
      if (dayNum < 1 || dayNum > 31) {
        day = "";
      }
    }

    if (day.length === 2 && !input.includes("/")) {
      input = `${day}/`;
    }

    if (month.length === 2) {
      const monthNum = parseInt(month, 10);
      if (monthNum < 1 || monthNum > 12) {
        month = "";
      }
    }

    if (month.length === 2 && !input.includes("//")) {
      input = `${day}/${month}/`;
    }

    if (input.length > 4) {
      this.formattedDate = `${day}/${month}/${year}`;
    } else if (input.length > 2) {
      this.formattedDate = `${day}/${month}`;
    } else {
      this.formattedDate = `${day}`;
    }

    this.formattedDate = this.formattedDate.substring(0, 10);
  }

  fetchCourierName(): void {
    const courierIDNumber = Number(this.courierID);
    console.log(courierIDNumber);
    this.http.get(this.apiservice.CourierData).subscribe((res: any) => {
      if (res.status) {
        const courier = res.data.find(
          (item: any) => item.id === courierIDNumber
        );
        if (courier) {
          this.courierName = courier.name;
        }
      }
    });
  }

  closeDialog() {
    this.dialogRef.close();
  }

  saveCredentials(): void {
    this.isInvalid.username = !this.username.trim();
    //this.isInvalid.password = !this.password.trim();
    this.isInvalid.customerId = !this.customerId.trim();
    this.isInvalid.contractId = !this.contractId.trim();
    this.isInvalid.productype = !this.productype.trim();
    this.isInvalid.identifier = !this.identifier.trim();
    this.isInvalid.startSeries = !this.startSeries;
    this.isInvalid.endSeries = !this.endSeries;
    this.isInvalid.expireAt = !this.formattedDate.trim();

    const hasInvalidFields = Object.values(this.isInvalid).some(
      (isInvalid) => isInvalid
    );
    if (hasInvalidFields) {
      this.toastr.error(
        "Please fill in all required fields.",
        "Validation Error"
      );
      return;
    }

    if (this.seller !== undefined && this.seller !== null) {
      this.credentialsObj.institutionId = Number(this.seller_admin);
    } else {
      this.credentialsObj.institutionId = Number(this.seller);
    }

    this.credentialsObj.courierId = this.courierID;
    this.credentialsObj.username = this.username;
    this.credentialsObj.password = this.password || "";
    this.credentialsObj.customerId = this.customerId;
    this.credentialsObj.contractId = this.contractId;
    this.credentialsObj.productype = this.productype;
    this.credentialsObj.identifier = this.identifier;
    this.credentialsObj.startSeries = Number(this.startSeries);
    this.credentialsObj.endSeries = Number(this.endSeries);
    this.credentialsObj.expireAt = this.convertToISODate(this.formattedDate);

    this.http
      .post(this.apiservice.ManageCredentials, this.credentialsObj)
      .subscribe((res: any) => {
        if (res.status) {
          this.toastr.success("Changes made Successfully.", "Success");
          this.closeDialog();
        }
      });
  }

  convertToISODate(date: string): string {
    const [day, month, year] = date.split("/");
    return `${year}-${month}-${day}`;
  }
}
