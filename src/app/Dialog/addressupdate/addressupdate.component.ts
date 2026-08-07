import { Component, Inject, OnInit } from "@angular/core";
import {
  trigger,
  state,
  transition,
  style,
  animate,
} from "@angular/animations";
import { MatDialog, MatDialogRef } from "@angular/material/dialog";
import { MAT_DIALOG_DATA } from "@angular/material/dialog";
import { ApiService } from "../../services/api.service";
import { HttpClient } from "@angular/common/http";
import { RefreshService } from "../../services/refresh.service";
import { ToastrService } from "ngx-toastr";

@Component({
  selector: "app-addressupdate",
  templateUrl: "./addressupdate.component.html",
  styleUrl: "./addressupdate.component.css",
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
export class AddressupdateComponent {
  name: string = "";
  orderId: string = "";
  kitNumber: string = "";
  address1: string = "";
  address2: string = "";
  city: string = "";
  state: string = "";
  pincode: number = 0;
  contact: string = "";
  rtoID: number = 0;
  zipcode: string = "";
  isSubmitted: boolean = false;
  isInvalidPincode: boolean = false;
  isInvalidPhone: boolean = false;

  constructor(
    private dialogRef: MatDialogRef<AddressupdateComponent>,
    private apiservice: ApiService,
    private http: HttpClient,
    private refreshservice: RefreshService,
    private toastr: ToastrService,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    if (data) {
      (this.name = data.name || ""),
        (this.orderId = data.orderId || ""),
        (this.kitNumber = data.kitNumber || ""),
        (this.address1 = data.address1 || ""),
        (this.address2 = data.address2 || ""),
        (this.city = data.city || ""),
        (this.state = data.state || ""),
        (this.pincode = data.pincode || ""),
        (this.contact = data.contact || ""),
        (this.rtoID = data.rto);
    }
  }

  allowOnlyNumeric(event: KeyboardEvent): void {
    const charCode = event.key.charCodeAt(0);
    // Check if the character is an alphabet, number, space, or underscore
    if (!(charCode >= 48 && charCode <= 57)) {
      event.preventDefault(); // Prevent the key press
    }
  }

  closeDialog() {
    this.dialogRef.close();
  }

  UpdateDetails() {
    if (!this.state || !this.city || !this.pincode || !this.contact) {
      this.toastr.warning("Please fill all the required fields.", "Warning");
      return;
    }

    this.zipcode = this.pincode.toString();
    if (this.zipcode.length < 6) {
      this.toastr.warning("Invalid Pincode.", "Warning");
      this.isInvalidPincode = true;
      return;
    }

    if (!/^\d{10,12}$/.test(this.contact)) {
      this.toastr.warning("Invalid Contact Number.", "Warning");
      this.isInvalidPhone = true;
      return;
    }

    if (!this.address1 && !this.address2) {
      this.toastr.warning(
        "Atleast one address field should be present.",
        "Warning"
      );
      return;
    }

    const updateAddressobj = {
      orderId: Number(this.orderId), // convert to number if needed
      address1: this.address1,
      address2: this.address2,
      city: this.city,
      state: this.state,
      pincode: Number(this.pincode),
      contact: this.contact,
    };

    this.http.post(this.apiservice.AddressUpdate, updateAddressobj).subscribe(
      (res: any) => {
        if (res.status) {
          this.toastr.success("Changes made Successfully.", "Success");
          this.refreshservice.triggerRefresh();
          this.closeDialog();
        } else {
          this.toastr.error(res.errors[0], "Failure");
        }
      },
      (error) => {
        this.toastr.error(error.message, "Failure");
      }
    );
  }
}
