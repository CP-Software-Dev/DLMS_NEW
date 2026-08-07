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
import { UpdateAddressModal } from "../../modals/updateAddress";
import { ToastrService } from "ngx-toastr";
import { debug } from "console";
import { RefreshService } from "../../services/refresh.service";

@Component({
  selector: "app-rto-edit",
  templateUrl: "./rto-edit.component.html",
  styleUrl: "./rto-edit.component.css",
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
export class RtoEditComponent implements OnInit {
  name: string = "";
  courier: string = "";
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

  updateAddressobj: UpdateAddressModal;

  constructor(
    private dialogRef: MatDialogRef<RtoEditComponent>,
    private apiservice: ApiService,
    private http: HttpClient,
    private refreshservice: RefreshService,
    private toastr: ToastrService,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    if (data) {
      (this.name = data.name || ""),
        (this.courier = data.courier || ""),
        (this.address1 = data.address1 || ""),
        (this.address2 = data.address2 || ""),
        (this.city = data.city || ""),
        (this.state = data.state || ""),
        (this.pincode = data.pincode || ""),
        (this.contact = data.contact || ""),
        (this.rtoID = data.rto);
    }

    this.updateAddressobj = new UpdateAddressModal();
  }

  ngOnInit(): void {}
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

  UpdateDetails(): void {
    this.isSubmitted = true;

    if (!this.state || !this.city || !this.pincode || !this.contact) {
      return;
    }

    this.zipcode = this.pincode.toString();
    if (this.zipcode.length < 6) {
      this.isInvalidPincode = true;
      return;
    }

    debugger;

    if (!/^\d{10}$/.test(this.contact)) {
      this.isInvalidPhone = true;
      return;
    }

    if (!this.address1 && !this.address2) {
      return;
    }

    this.updateAddressobj.rtoId = this.rtoID;
    this.updateAddressobj.address1 = this.address1;
    this.updateAddressobj.address2 = this.address2;
    this.updateAddressobj.city = this.city;
    this.updateAddressobj.state = this.state;
    this.updateAddressobj.pincode = this.pincode;
    this.updateAddressobj.contact = this.contact;
    this.http.put(this.apiservice.EditDetails, this.updateAddressobj).subscribe(
      (res: any) => {
        if (res.status) {
          this.toastr.success("Changes made Successfully.", "Success");
          this.refreshservice.triggerRefresh();
          this.closeDialog();
        } else {
          this.toastr.error(
            "Failed to update details. Please try again.",
            "Failure"
          );
        }
      },
      (error) => {
        this.toastr.error(error.message, "Failure");
      }
    );
  }
}
