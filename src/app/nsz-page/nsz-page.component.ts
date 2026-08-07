import { Component } from "@angular/core";
import { ApiService } from "../services/api.service";
import { HttpClient } from "@angular/common/http";
import { ToastrService } from "ngx-toastr";

@Component({
  selector: "app-nsz-page",
  templateUrl: "./nsz-page.component.html",
  styleUrl: "./nsz-page.component.css",
})
export class NszPageComponent {
  orderIds: string = "";

  constructor(
    private api: ApiService,
    private http: HttpClient,
    private toastr: ToastrService
  ) {}

  handleOrderIds() {
    if (!this.orderIds.trim()) {
      alert("Please enter order IDs.");
      return;
    }

    const cleanedOrderIds = this.orderIds
      .split(",")
      .map((id) => id.trim())
      .filter((id) => id !== "");

    const payload = { orderIds: cleanedOrderIds ,
      createdBy: "system"
    };

    this.http.post(this.api.UpdateNSZ, payload).subscribe(
      (response: any) => {
        if (response.status) {
          this.toastr.success(response.data, "");
          this.orderIds = "";
        } else {
          this.toastr.error("Failed to update orders.", "");
        }
      },
      (error) => {
        this.toastr.error("Something went wrong while updating.", "");
      }
    );
  }
}
