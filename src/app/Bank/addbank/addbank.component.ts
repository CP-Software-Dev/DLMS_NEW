import { Component, OnInit, Inject } from "@angular/core";
import {
  trigger,
  state,
  transition,
  style,
  animate,
} from "@angular/animations";
import { MatDialog, MatDialogRef } from "@angular/material/dialog";
import { HttpClient, HttpParams } from "@angular/common/http";
import { Router } from "@angular/router";
import { ToastrService } from "ngx-toastr";
import { ApiService } from "../../services/api.service";
import { Bankmodal } from "../../modals/Bankmodal";
import { MAT_DIALOG_DATA } from "@angular/material/dialog";
import { error } from "console";
import { RefreshService } from "../../services/refresh.service";
import { EditBankmodal } from "../../modals/EditBankmodal";
import { SellerService } from "../../services/seller.service";

@Component({
  selector: "app-addbank",
  templateUrl: "./addbank.component.html",
  styleUrl: "./addbank.component.css",
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
export class AddbankComponent implements OnInit {
  salesPerson: any[] = [];
  courierRows: any[] = [];
  personID: string = "";
  bankName: string = "";
  bankID: number = 0;
  activeplan: number = 0;
  selectedCourierIds: number[] = [];
  isBankNameDisabled: boolean = false;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private apiservice: ApiService,
    private refreshService: RefreshService,
    private http: HttpClient,
    private sellerservice: SellerService,
    private dialog: MatDialog,
    private router: Router,
    private toastr: ToastrService,
    private dialogRef: MatDialogRef<AddbankComponent>
  ) {
    this.addBankObj = new Bankmodal();
    this.editBankObj = new EditBankmodal();
    if (data) {
      debugger;
      this.bankID = data.bankID;
      this.bankName = data.bankName || "";
      this.personID = data.salesPerson || "";
      this.selectedCourierIds = data.couriers || [];
      this.isBankNameDisabled = !!data.bankName;
      this.activeplan = data.accountPlanID || ""
      this.addBankObj.courierIds = [...this.selectedCourierIds];
    }
  }

  addBankObj: Bankmodal;
  editBankObj: EditBankmodal;

  ngOnInit(): void {
    this.fetchSalesPerson();
    this.fetchCourier();
  }

  fetchCourier(): void {
    this.http.get(this.apiservice.CourierData).subscribe(
      (res: any) => {
        if (res.status) {
          this.courierRows = this.chunkArray(res.data, 2);
        }
      },
      (error) => {
        console.error("API Error:", error);
      }
    );
  }

  onCourierCheckboxChange(event: any) {
    const checkbox = event.target;
    const value = parseInt(checkbox.value, 10); // Convert to integer
    if (checkbox.checked) {
      if (!this.addBankObj.courierIds.includes(value)) {
        this.addBankObj.courierIds.push(value);
      }
    } else {
      this.addBankObj.courierIds = this.addBankObj.courierIds.filter(
        (id) => id !== value
      );
    }
  }

  isCourierSelected(courierId: number): boolean {
    return this.selectedCourierIds.includes(courierId);
  }

  chunkArray(arr: any[], chunkSize: number): any[][] {
    const result = [];
    for (let i = 0; i < arr.length; i += chunkSize) {
      result.push(arr.slice(i, i + chunkSize));
    }
    return result;
  }

  fetchSalesPerson(): void {
    let params = new HttpParams()
      .set("page", (1).toString())
      .set("dataCount", (10000).toString());
    this.http.get(this.apiservice.SalesPerson, { params }).subscribe(
      (res: any) => {
        if (res.status) {
          this.salesPerson = res.data;
        }
      },
      (error) => {
        console.error("API Error:", error);
      }
    );
  }

  closeDialog() {
    this.dialogRef.close();
  }

  allowOnlyAlphanumeric(event: KeyboardEvent): void {
    const charCode = event.key.charCodeAt(0);
    // Check if the character is an alphabet, number, space, or underscore
    if (
      !(
        (
          (charCode >= 48 && charCode <= 57) || // Numbers 0-9
          (charCode >= 65 && charCode <= 90) || // Uppercase A-Z
          (charCode >= 97 && charCode <= 122) || // Lowercase a-z
          charCode === 95 || // Underscore (_)
          charCode === 32
        ) // Space
      )
    ) {
      event.preventDefault(); // Prevent the key press
    }
  }

  invalidInput: boolean = false;

  validateInput() {
    const regex = /^[a-z0-9]+$/;
  }

  addBank() {

    debugger;
    const personIDAsNumber: number = +this.personID;
    this.addBankObj.name = this.bankName;
    this.addBankObj.salesPersonId = personIDAsNumber;
    this.addBankObj.activePlanId = Number(this.activeplan);

    if (
      !this.bankName ||
      !this.personID ||
      (this.addBankObj.courierIds && this.addBankObj.courierIds.length === 0) ||
      Number(this.activeplan) == 0
    ) {
      this.toastr.error(
        "Invalid credentials. Please fill all required fields.",
        "Failure"
      );
      return;
    }

    if (this.isBankNameDisabled) {
      this.editBankObj.id = this.bankID;
      this.editBankObj.salesPersonId = personIDAsNumber;
      this.editBankObj.courierIds = this.addBankObj.courierIds;
      this.editBankObj.activePlanId = Number(this.activeplan);
      this.http
        .put(
          `${this.apiservice.AddBank}/${this.editBankObj.id}`,
          this.editBankObj
        )
        .subscribe(
          (res: any) => { 
            if (res.status) {
              this.toastr.success("Details Updated Successfully.", "Success");
              this.refreshService.triggerRefresh();
              this.closeDialog();
            } else {
              this.toastr.error("Failed to Add Bank.", "Failure");
            }
          },
          (error) => {
            this.toastr.error(error, "Failure");
          }
        );
    } else {
      this.http.post(this.apiservice.AddBank, this.addBankObj).subscribe(
        (res: any) => {
          if (res.status) {
            this.toastr.success("Bank Added Successfully.", "Success");
            this.refreshService.triggerRefresh();
            this.closeDialog();
          } else {
            this.toastr.error("Failed to Add Bank.", "Failure");
          }
        },
        (error) => {
          this.toastr.error(error, "Failure");
        }
      );
    }
  }
}
