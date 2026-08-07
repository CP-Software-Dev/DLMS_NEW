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

@Component({
  selector: "app-remake-data",
  templateUrl: "./remake-data.component.html",
  styleUrl: "./remake-data.component.css",
  animations: [
    trigger("fadeInOut", [
      state(
        "void",
        style({
          opacity: 0,
        })
      ),
      transition("void <=> *", animate(300)),
    ]),
  ],
})
export class RemakeDataComponent implements OnInit {
  pageIndex: number = 0;
  pageSize: number = 10;
  remakeData: any[] = [];
  currentFilters: any = {};
  totalOrders: number = 0;
  buttonText: string = "Filters";
  buttonIcon: string = "ri-filter-fill";
  showFiltersForm: boolean = false;
  sellerData: any[] = [];
  kitnumber: string = "";
  lotID: string = "";
  sellerId: string = "";

  selectedDateRange: { startDate: string; endDate: string } = {
    startDate: "",
    endDate: "",
  };

  private refreshSubscription?: Subscription;

  constructor(
    private apiservice: ApiService,
    private dialog: MatDialog,
    private http: HttpClient,
    private refreshservice: RefreshService,
    private router: Router,
    private toastr: ToastrService,
    private route: ActivatedRoute
  ) {
    const endDate = new Date(); // Today
    const startDate = new Date(); // Clone today
    startDate.setDate(startDate.getDate() - 29); // Last 30 days

    this.selectedDateRange = {
      startDate: this.formatDate(startDate.toISOString()),
      endDate: this.formatDate(endDate.toISOString()),
    };
  }

  ngOnInit(): void {
    this.loadSellerData();
    this.applyFilters();
    this.fetchData(this.pageIndex, this.pageSize);
    this.refreshSubscription = this.refreshservice.refreshNeeded.subscribe(
      () => {
        this.fetchData(this.pageIndex, this.pageSize);
      }
    );
  }

  loadSellerData(): void {
    this.http.get<any>(this.apiservice.SellerData).subscribe((response) => {
      this.sellerData = response.data;
    });
  }

  formatDate(date: string): string {
    return new Date(date).toISOString().split("T")[0];
  }

  onDateRangeSelected(dateRange: { startDate: string; endDate: string }): void {
    this.selectedDateRange = {
      startDate: this.formatDate(dateRange.startDate),
      endDate: this.formatDate(dateRange.endDate),
    };
  }

  toggleFiltersForm() {
    this.showFiltersForm = !this.showFiltersForm;
    this.buttonText = this.showFiltersForm ? "Close" : "Filters";
    this.buttonIcon = this.showFiltersForm ? "ri-close-fill" : "ri-filter-fill";
  }

  fetchData(
    pageIndex: number,
    pageSize: number,
    filters: any = this.currentFilters
  ) {
    let params = new HttpParams()
      .set("page", (pageIndex + 1).toString())
      .set("dataCount", pageSize.toString());

    if (filters.kitnumber) {
      params = params.set("kitnumber", filters.kitnumber);
    }
    if (filters.lotID) {
      params = params.set("LotId", Number(filters.lotID));
    }
    if (filters.sellerId && filters.sellerId !== "0") {
      params = params.set("sellerId", filters.sellerId);
    }

    let startDate = filters.startDate;
    let endDate = filters.endDate;

    if (!startDate || !endDate) {
      const currentDate = new Date();
      const adjustedDate = new Date(
        currentDate.getTime() - currentDate.getTimezoneOffset() * 60000
      )
        .toISOString()
        .split("T")[0];
      startDate = startDate || adjustedDate;
      endDate = endDate || adjustedDate;
    }

    params = params.set("startDate", startDate).set("endDate", endDate);

    this.http.get(this.apiservice.RemakeOrders, { params }).subscribe(
      (res: any) => {
        this.remakeData = res.data.orders;
        this.totalOrders = res.data.total;
      },
      (error) => {}
    );
  }

  applyFilters() {
    this.currentFilters = {};

    if (this.sellerId) {
      this.currentFilters.sellerId = this.sellerId;
    }
    if (this.kitnumber) {
      this.currentFilters.kitnumber = this.kitnumber;
    }
    if (this.lotID) {
      this.currentFilters.lotID = this.lotID;
    }

    if (this.selectedDateRange) {
      const { startDate, endDate } = this.selectedDateRange;
      this.currentFilters.startDate = startDate;
      this.currentFilters.endDate = endDate;
    }
    this.pageIndex = 0;

    this.fetchData(this.pageIndex, this.pageSize, this.currentFilters);
  }

  handlePageEvent(event: { pageIndex: number; pageSize: number }) {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.fetchData(this.pageIndex, this.pageSize);
  }

  clearFilters() {
    this.sellerId = "";
    this.currentFilters = {};
    this.kitnumber = "";
    this.lotID = "";
    const currentDate = new Date();
    const startDate = new Date(); // Clone today
    startDate.setDate(startDate.getDate() - 29);
    this.selectedDateRange = {
      startDate: this.formatDate(startDate.toISOString()),
      endDate: this.formatDate(currentDate.toISOString()),
    };
    this.currentFilters.startDate = this.selectedDateRange.startDate;
    this.currentFilters.endDate = this.selectedDateRange.endDate;

    this.fetchData(this.pageIndex, this.pageSize, this.currentFilters);
    this.toggleFiltersForm();
  }
}
