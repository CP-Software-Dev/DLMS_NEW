import { ChangeDetectorRef, Component, OnDestroy, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, FormControl } from "@angular/forms";
import {
  trigger,
  state,
  style,
  animate,
  transition,
} from "@angular/animations";
import { MatDialog } from "@angular/material/dialog";
import { ActivatedRoute } from "@angular/router";
import { HttpClient, HttpParams } from "@angular/common/http";
import { Router } from "@angular/router";
import { Subscription } from "rxjs";
import { ToastrService } from "ngx-toastr";
import { ApiService } from "../../services/api.service";
import { RefreshService } from "../../services/refresh.service";
import { OrderStateService } from "../../services/States/Orders/order-state.service";
import { ZoneMasterFileUploadComponent } from "../../Dialog/zone-master-file-upload/zone-master-file-upload.component";

@Component({
  selector: "app-zone-master",
  templateUrl: "./zone-master.component.html",
  styleUrl: "./zone-master.component.css",
})
export class ZoneMasterComponent {
  pageIndex: number = 0;
  pageSize: number = 10;
  pincodeData: any[] = [];
  totalOrders: number = 0;
  buttonText: string = "Filters";
  buttonIcon: string = "ri-filter-fill";
  showFiltersForm: boolean = false;
  pincode: string = "";
  courierData: any[] = [];
  courierId: string = "";

  private refreshSubscription?: Subscription;

  constructor(
    private apiservice: ApiService,
    private dialog: MatDialog,
    private http: HttpClient,
    private refreshservice: RefreshService,
    private router: Router,
    private toastr: ToastrService,
    private ordersStateService: OrderStateService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    const savedPageIndex = this.ordersStateService.getPageIndex();
    this.loadCourierData();
    if (savedPageIndex !== null) {
      this.pageIndex = savedPageIndex;
    }

    this.fetchData(this.pageIndex, this.pageSize);
    this.refreshSubscription = this.refreshservice.refreshNeeded.subscribe(
      () => {
        this.fetchData(this.pageIndex, this.pageSize);
      }
    );
  }

  loadCourierData(): void {
    this.http.get<any>(this.apiservice.CourierData).subscribe((response) => {
      this.courierData = response.data;
    });
  }

  ngOnDestroy(): void {
    this.ordersStateService.setPageIndex(this.pageIndex);
    if (this.refreshSubscription) {
      this.refreshSubscription.unsubscribe();
    }
  }

  toggleFiltersForm() {
    this.showFiltersForm = !this.showFiltersForm;
    this.buttonText = this.showFiltersForm ? "Close" : "Filters";
    this.buttonIcon = this.showFiltersForm ? "ri-close-fill" : "ri-filter-fill";
  }

  openDialog(): void {
    this.dialog.open(ZoneMasterFileUploadComponent, {
      panelClass: "rounded-dialog",
    });
  }

  applyFilters() {
    this.fetchData(this.pageIndex, this.pageSize);
  }

  clearFilters() {
    this.courierId = "";
    this.pincode = "";
    this.fetchData(this.pageIndex, this.pageSize);
  }

  handlePageEvent(event: { pageIndex: number; pageSize: number }) {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.ordersStateService.setPageIndex(this.pageIndex);
    this.fetchData(this.pageIndex, this.pageSize);
  }

  fetchData(pageIndex: number, pageSize: number) {
    let params = new HttpParams()
      .set("pageNumber", (pageIndex + 1).toString())
      .set("pageSize", pageSize.toString());

    if (this.courierId) {
      params = params.set("courier", Number(this.courierId));
    }

    if (this.pincode) {
      params = params.set("pincode", this.pincode);
    }

    this.http.get(this.apiservice.ZoneMaster, { params }).subscribe(
      (res: any) => {
        this.pincodeData = res.data.records;
        this.totalOrders = res.data.totalRecords;
      },
      (error) => {}
    );
  }
}
