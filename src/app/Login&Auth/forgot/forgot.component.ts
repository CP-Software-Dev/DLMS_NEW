import { Component } from "@angular/core";
import { Router } from "@angular/router";
import { ApiService } from "../../services/api.service";
import { HttpClient, HttpParams } from "@angular/common/http";
import { ToastrService } from "ngx-toastr";
import { HttpErrorResponse, HttpHeaders } from "@angular/common/http";
import { response } from "express";

@Component({
  selector: "app-forgot",
  templateUrl: "./forgot.component.html",
  styleUrl: "./forgot.component.css",
})
export class ForgotComponent {
  invalidCredentials: boolean = false;

  email: string = "";
  constructor(
    private toastr: ToastrService,
    private router: Router,
    private http: HttpClient,
    private apiservice: ApiService
  ) {}

  sendOTP() {
    let params = new HttpParams().set("username", this.email);
    this.http
      .post(this.apiservice.ForgotPassword, {}, { params })
      .subscribe((res: any) => {
        if (res.status) {
          this.email = "";
          this.toastr.success(
            "A password reset link has been sent to your email.",
            "Success"
          );
        } else {
          this.toastr.error(res.errors, "Failure");
        }
      });
  }
}
