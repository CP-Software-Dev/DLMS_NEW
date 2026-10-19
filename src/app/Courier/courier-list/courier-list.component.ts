import { HttpClient, HttpParams } from "@angular/common/http";
import { Component, OnInit } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { Router } from "@angular/router";
import { Overlay } from "@angular/cdk/overlay";
import { ToastrService } from "ngx-toastr";
import { AddCourierComponent } from "../../Dialog/courier/add-courier/add-courier.component";
import { ManagecourierComponent } from "../../Dialog/managecourier/managecourier.component";
import { ViewcourierComponent } from "../../Dialog/viewcourier/viewcourier.component";
import { ApiService } from "../../services/api.service";
import { SellerService } from "../../services/seller.service";

@Component({
  selector: "app-courier-list",
  templateUrl: "./courier-list.component.html",
  styleUrl: "./courier-list.component.css",
})
export class CourierListComponent implements OnInit {
  courierEntries: any[] = [];
  currentPage: number = 0;
  pageSize: number = 10;
  seller: any;
  isSeller: boolean = false;

  // Opens ManagecourierComponent as a side drawer on the right
  private readonly drawerConfig = {
    width: "600px",
    maxWidth: "100vw",
    height: "calc(100vh - 32px)",
    maxHeight: "calc(100vh - 32px)",
    position: { right: "16px", top: "16px" },
    panelClass: ["side-drawer", "credentials-drawer"],
    backdropClass: "blur-backdrop",
    autoFocus: false,
  };

  constructor(
    private apiservice: ApiService,
    private toastr: ToastrService,
    private http: HttpClient,
    private dailog: MatDialog,
    private router: Router,
    private sellerService: SellerService,
    private overlay: Overlay
  ) {}

  ngOnInit(): void {
    this.seller = this.sellerService.getItem("seller");
    this.isSeller = Number(this.seller) > 0;

    if (this.isSeller) {
      this.fetchSellerCouriers();
    } else {
      this.fetchAdminCouriers();
    }
  }

  fetchAdminCouriers(): void {
    this.http.get(this.apiservice.CourierDataAdmin).subscribe((res: any) => {
      if (res.status) {
        this.courierEntries = res.data;
      }
    });
  }

  fetchSellerCouriers(): void {
    let params = new HttpParams().set("institutionId", this.seller);
    this.http.get(this.apiservice.BankList, { params }).subscribe((res: any) => {
      if (res.status) {
        this.courierEntries = (res.data?.[0]?.couriers ?? []).filter(
          (courier: any) => courier.isSelected === 1
        );
      }
    });
  }

  getName(entry: any): string {
    return this.isSeller ? entry.name : entry.courierName;
  }

  getId(entry: any): any {
    return this.isSeller ? entry.courierId : entry.courierID;
  }

  getCode(entry: any): string {
    return this.isSeller ? entry.code : entry.courierCode;
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

  // Admin dialogs
  openDialog(entry: any) {
    this.dailog.open(AddCourierComponent, {
      data: {
        name: entry.name,
        code: entry.code,
      },
    });
  }

  openDialog1(entry: any): void {
    const courierId = Number(entry.courierID);
    let params = new HttpParams().set("courierId", courierId);
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

          this.openCredentialsDrawer({
            isEdit: true,
            courierData: updatedCourierData,
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

  // Seller dialogs
  addSellerCourier(entry: any): void {
    this.openCredentialsDrawer({ isEdit: false, courierId: entry.courierId });
  }

  editSellerCourier(entry: any): void {
    const courierId = Number(entry.courierId);
    let params = new HttpParams().set("courierId", courierId);
    this.http.get(this.apiservice.CourierCredentials, { params }).subscribe(
      (res: any) => {
        if (res.status && res.data) {
          this.openCredentialsDrawer({ isEdit: true, courierData: res.data });
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

  private openCredentialsDrawer(data: any): void {
    const dialogRef = this.dailog.open(ManagecourierComponent, {
      ...this.drawerConfig,
      scrollStrategy: this.overlay.scrollStrategies.noop(),
      data,
    });

    // Wheel over non scrollable drawer areas (header, footer) must not scroll the page
    const panes = document.querySelectorAll<HTMLElement>(".credentials-drawer");
    const pane = panes[panes.length - 1];
    let onPaneWheel: ((event: WheelEvent) => void) | undefined;
    if (pane) {
      onPaneWheel = (event: WheelEvent) => {
        if (!this.hasScrollableWithin(event.target as Element, pane)) {
          event.preventDefault();
        }
      };
      pane.addEventListener("wheel", onPaneWheel, { passive: false });
    }

    // Page behind the blurred backdrop stays scrollable but not clickable
    const backdrops = document.querySelectorAll<HTMLElement>(".blur-backdrop");
    const backdrop = backdrops[backdrops.length - 1];
    if (!backdrop) {
      return;
    }

    const onWheel = (event: WheelEvent) => {
      event.preventDefault();
      const factor = event.deltaMode === 1 ? 16 : 1;
      const under = document
        .elementsFromPoint(event.clientX, event.clientY)
        .find((el) => !el.closest(".cdk-overlay-container"));
      const target = this.findScrollable(under || null);
      target.scrollBy({
        top: event.deltaY * factor,
        left: event.deltaX * factor,
      });
    };

    backdrop.addEventListener("wheel", onWheel, { passive: false });
    dialogRef.afterClosed().subscribe(() => {
      backdrop.removeEventListener("wheel", onWheel);
      if (pane && onPaneWheel) {
        pane.removeEventListener("wheel", onPaneWheel);
      }
    });
  }

  private hasScrollableWithin(start: Element | null, boundary: Element): boolean {
    let el: Element | null = start;
    while (el && boundary.contains(el)) {
      const overflowY = getComputedStyle(el).overflowY;
      if (/(auto|scroll)/.test(overflowY) && el.scrollHeight > el.clientHeight) {
        return true;
      }
      el = el.parentElement;
    }
    return false;
  }

  private findScrollable(start: Element | null): Element {
    let el: Element | null = start;
    while (el && el !== document.body && el !== document.documentElement) {
      const overflowY = getComputedStyle(el).overflowY;
      if (/(auto|scroll)/.test(overflowY) && el.scrollHeight > el.clientHeight) {
        return el;
      }
      el = el.parentElement;
    }
    return document.scrollingElement || document.documentElement;
  }

  navigateToCourierPage() {
    this.router.navigate(["/admin/couriers/add"]);
  }
}