import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Component, OnInit } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { ToastrService } from "ngx-toastr";
import { ApiService } from "../../services/api.service";
declare var bootstrap: any;

@Component({
  selector: "app-confirm-registration",
  templateUrl: "./confirm-registration.component.html",
  styleUrl: "./confirm-registration.component.css",
})
export class ConfirmRegistrationComponent implements OnInit {
  details: { id: string; username: string; otp: string; password: string } = {
    id: "",
    username: "",
    otp: "",
    password: "",
  };
  constructor(
    private apiservice: ApiService,
    private route: ActivatedRoute,
    private http: HttpClient,
    private toastr: ToastrService,
    private router: Router
  ) {}

  newpassword: string = "";
  confirmpassword: string = "";
  ngOnInit(): void {
    var tooltipTriggerList = [].slice.call(
      document.querySelectorAll('[data-bs-toggle="tooltip"]')
    );
    var tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl) {
      return new bootstrap.Tooltip(tooltipTriggerEl);
    });
  }

  // create(): void{

  //   const password1 = this.newpassword.trim();
  //   const password2 = this.confirmpassword.trim();
  //   if(password1 == password2)
  //   {
  //     this.details = {
  //       id: this.route.snapshot.queryParams['id'],
  //       username: this.route.snapshot.queryParams['username'],
  //       otp: this.route.snapshot.queryParams['otp'],
  //       password: password2
  //     }
  //     const headers = new HttpHeaders({
  //       'Content-Type': 'application/json'
  //     });
  //     this.http.post(this.apiservice.ConfirmRegistration, this.details, { headers }).subscribe(
  //       (res: any) => {
  //         if (res.status) {
  //           this.toastr.success('Profile Created Successfully.', 'Success');
  //           this.router.navigateByUrl('');
  //         } else {
  //           this.toastr.error(res.errors, 'Failure');
  //           this.router.navigateByUrl('');
  //         }
  //       },
  //       (error) => {
  //         this.toastr.error('An error occurred.', 'Error');
  //         console.error('Error:', error);
  //       }
  //     );
  //   }

  // }

  create(): void {
    const password1 = this.newpassword.trim();
    const password2 = this.confirmpassword.trim();
    const passwordPattern =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[\W_])(?!.*\s).{8,}$/;

    if (password1 !== password2) {
      this.toastr.error("Passwords do not match.", "Error");
      return;
    }

    if (!passwordPattern.test(password1)) {
      this.toastr.error(
        "Password is too weak, Enter a strong one.",
        "Invalid Password"
      );
      return;
    }

    this.details = {
      id: this.route.snapshot.queryParams["id"],
      username: this.route.snapshot.queryParams["username"],
      otp: this.route.snapshot.queryParams["otp"],
      password: password2,
    };

    const headers = new HttpHeaders({
      "Content-Type": "application/json",
    });

    this.http
      .post(this.apiservice.ConfirmRegistration, this.details, { headers })
      .subscribe(
        (res: any) => {
          if (res.status) {
            this.toastr.success("Profile Created Successfully.", "Success");
            this.router.navigateByUrl("");
          } else {
            this.toastr.error(res.errors, "Failure");
            this.router.navigateByUrl("");
          }
        },
        (error) => {
          this.toastr.error("An error occurred.", "Error");
          console.error("Error:", error);
        }
      );
  }
}
