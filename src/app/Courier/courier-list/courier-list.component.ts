import { HttpClient, HttpParams } from "@angular/common/http";
import { Component, OnInit } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { AddCourierComponent } from "../../Dialog/courier/add-courier/add-courier.component";
import { FetchAWBComponent } from "../../Dialog/fetch-awb/fetch-awb.component";
import { ApiService } from "../../services/api.service";
import { Router } from "@angular/router";
import { ManagecourierComponent } from "../../Dialog/managecourier/managecourier.component";
import { ToastrService } from "ngx-toastr";
import { ViewcourierComponent } from "../../Dialog/viewcourier/viewcourier.component";
@Component({
  selector: "app-courier-list",
  templateUrl: "./courier-list.component.html",
  styleUrl: "./courier-list.component.css",
})
export class CourierListComponent implements OnInit {
  courierEntries: any[] = [];
  currentPage: number = 0;
  pageSize: number = 10;
  constructor(
    private apiservice: ApiService,
    private toastr: ToastrService,
    private http: HttpClient,
    private dailog: MatDialog,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.http.get(this.apiservice.CourierDataAdmin).subscribe((res: any) => {
      if (res.status) {
        this.courierEntries = res.data;
      } else {
      }
    });
  }

  handlePageEvent(event: { pageIndex: number; pageSize: number }) {
    this.currentPage = event.pageIndex;
    this.pageSize = event.pageSize;
  }

  getCourierEntriesForCurrentPage(): any[] {
    const startIndex = this.currentPage * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    return this.courierEntries.slice(startIndex, endIndex);
  }
  openDialog(entry: any) {
    this.dailog.open(AddCourierComponent, {
      data: {
        name: entry.name,
        code: entry.code,
      },
    });
  }

  // openDialog1(){
  //   this.dailog.open(AddCourierComponent)
  // }

  openDialog1(entry: any): void {
    debugger;
    const courierId = Number(entry.courierID);
    let params = new HttpParams().set("courierId", courierId);
    debugger;
    this.http.get(this.apiservice.CourierCredentials, { params }).subscribe(
      (res: any) => {
        if (res.status && res.data) {
          this.dailog.open(ViewcourierComponent, {
            data: { isEdit: true, courierData: res.data },
          });
        } else {
          console.error("Error fetching courier details:", res.errors);
          this.toastr.error("Failure", "No Data to View");
        }
      },
      (error) => {
        console.error("An error occurred:", error);
      }
    );
  }

  // awbDialog(entry:any)
  // {
  //   this.dailog.open(FetchAWBComponent , {
  //     data:{
  //       name:entry.name,
  //       id:entry.id
  //     }
  //   });
  // }

  //   awbDialog(entry: any): void {

  //   this.dailog.open(ManagecourierComponent, {
  //     data: { isEdit: false, courierId: entry.id }
  //   });
  // }

  awbDialog(entry: any): void {
    const courierId = Number(entry.courierID);
    let params = new HttpParams().set("courierId", courierId);
    this.http.get(this.apiservice.CourierCredentials, { params }).subscribe(
      (res: any) => {
        if (res.status && res.data) {
          const updatedCourierData = {
            ...res.data,
            institutionId: entry.institutionID,
          };

          this.dailog.open(ManagecourierComponent, {
            data: { isEdit: true, courierData: updatedCourierData },
          });
        } else {
          console.error("Error fetching courier details:", res.errors);
          this.toastr.error("Failure", "No Data to Edit");
        }
      },
      (error) => {
        console.error("An error occurred:", error);
      }
    );
  }

  navigateToCourierPage() {
    this.router.navigate(["/admin/couriers/add"]);
  }
}
