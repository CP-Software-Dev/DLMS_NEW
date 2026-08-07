import {
  trigger,
  state,
  style,
  transition,
  animate,
} from "@angular/animations";
import { HttpClient, HttpParams } from "@angular/common/http";
import { Component, Inject, OnInit } from "@angular/core";
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";
import { ToastrService } from "ngx-toastr";
import { ApiService } from "../../services/api.service";
import { RefreshService } from "../../services/refresh.service";
import { InstaRemake } from "../../modals/instaRemake";

@Component({
  selector: "app-insta-remkake",
  templateUrl: "./insta-remkake.component.html",
  styleUrl: "./insta-remkake.component.css",
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
export class InstaRemkakeComponent implements OnInit {
  orders: any[] = [];
  remakeobj: InstaRemake = new InstaRemake();

  ngOnInit(): void {}

  constructor(
    private apiservice: ApiService,
    private toastr: ToastrService,
    private dialogRef: MatDialogRef<InstaRemkakeComponent>,
    private http: HttpClient,
    private refreshservice: RefreshService,
    @Inject(MAT_DIALOG_DATA)
    public data: { orderIds: number[]; statusID: number; source: string }
  ) {}
  closeDialog() {}

  confirmSubmit() {
    const orderIds = this.data.orderIds.map((x: any) =>
      typeof x === "object" ? String(x.orderID) : String(x)
    );
    const username = localStorage.getItem("username");

    this.remakeobj = {
      orderIds: orderIds,
      createdBy: "", // replace dynamically
    };

    console.log(this.remakeobj);
    this.http
      .post(this.apiservice.Remake, this.remakeobj)
      .subscribe((res: any) => {
        if (res.status) {
          this.toastr.info(res.data);
          //this.handleOrderDetails();
          this.dialogRef.close();
          this.refreshservice.triggerRefresh();
        } else {
          this.toastr.error(res.errors, "Failure");
        }
      });
  }

  cancelConfirm() {
    this.dialogRef.close();
  }
}
