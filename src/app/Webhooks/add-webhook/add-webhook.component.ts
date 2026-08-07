import { Component } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { ApiService } from "../../services/api.service";
import { HttpClient, HttpParams } from "@angular/common/http";
import { ToastrService } from "ngx-toastr";
import { Webhookmodel } from "../../modals/Webhookmodel";

@Component({
  selector: "app-add-webhook",
  templateUrl: "./add-webhook.component.html",
  styleUrl: "./add-webhook.component.css",
})
export class AddWebhookComponent {
  webhookObj: Webhookmodel;
  sellerData: any[] = [];
  webhookdata: any[] = [];
  sellerId: number = 0;
  statusID: number = 0;

  constructor(
    private router: Router,
    private apiservice: ApiService,
    private http: HttpClient,
    private toastr: ToastrService,
    private route: ActivatedRoute
  ) {
    this.webhookObj = new Webhookmodel();
  }

  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      if (params["sellerId"]) {
        this.sellerId = params["sellerId"];
      }
    });
    this.fetchData();
    this.loadSellerData();
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

  fetchData(): void {
    let params = new HttpParams().set("sellerId", this.sellerId);
    this.http.get(this.apiservice.Webhooks, { params }).subscribe(
      (res: any) => {
        if (res.status && res.data.length > 0) {
          const webhook = res.data[0];

          if (webhook.status == "Active") {
            this.statusID = 1;
          }
          if (this.sellerId > 0) {
            this.webhookObj.id = webhook.id;
            this.webhookObj.sellerId = webhook.sellerID;
            this.webhookObj.name = webhook.webhookName;
            this.webhookObj.token = webhook.secretToken;
            this.webhookObj.url = webhook.webhookURL;
            this.webhookObj.isActive = this.statusID;
          }
        }
      },
      (error) => {
        console.error("API Error:", error);
      }
    );
  }
  onSubmit() {
    debugger;
    const user = document.getElementById("sellerName") as HTMLSelectElement;
    const name = document.getElementById("webhook-name") as HTMLInputElement;
    const url = document.getElementById("url") as HTMLInputElement;

    const inputs = [user, name, url];
    inputs.forEach((input) => {
      if (input.tagName.toLowerCase() === "select") {
        if (input.value === "") {
          input.classList.add("empty-input");
        } else {
          input.classList.remove("empty-input");
        }
      } else {
        if (input.value.trim() === "") {
          input.classList.add("empty-input");
        } else {
          input.classList.remove("empty-input");
        }
      }
    });

    if (this.sellerId > 0) {
      this.http
        .put(this.apiservice.EditWebhook, this.webhookObj)
        .subscribe((res: any) => {
          if (res.status) {
            this.toastr.success("Webhook updated sucessfully!.", "Success");
            this.router.navigate(["admin/webhook"]);
          } else {
            alert("Failed to Register");
            this.toastr.error("Failed to Register.", "Failure");
          }
        });
    } else {
      if (
        !this.webhookObj.name?.trim() ||
        !this.webhookObj.url?.trim() ||
        !this.webhookObj.sellerId ||
        this.webhookObj.sellerId === 0
      ) {
        this.toastr.warning(
          "Please fill all required webhook fields.",
          "Warning"
        );
        return;
      }

      this.http
        .post(this.apiservice.CreateWebhook, this.webhookObj)
        .subscribe((res: any) => {
          if (res.status) {
            this.toastr.success("Webhook created sucessfully!.", "Success");
            this.router.navigate(["admin/webhook"]);
          } else {
            alert("Failed to Register");
            this.toastr.error("Failed to Register.", "Failure");
          }
        });
    }
  }

  navigateToWebhook() {
    this.router.navigate(["admin/webhook"]);
  }

  loadSellerData(): void {
    this.http.get<any>(this.apiservice.SellerData).subscribe((response) => {
      this.sellerData = response.data;
    });
  }
}
