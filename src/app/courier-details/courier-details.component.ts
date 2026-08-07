import {
  Component,
  ElementRef,
  HostListener,
  OnDestroy,
  OnInit,
  ViewChild,
} from "@angular/core";
import { FormBuilder, FormControl, FormGroup } from "@angular/forms";
import { MatDialog } from "@angular/material/dialog";
import { HttpClient, HttpParams } from "@angular/common/http";
import {
  trigger,
  state,
  style,
  animate,
  transition,
} from "@angular/animations";
import { ChangestatusDialogComponent } from "../Dialog/changestatus-dialog/changestatus-dialog.component";
import { ToastrService } from "ngx-toastr";
import { ActivatedRoute, Router } from "@angular/router";
import { ApiService } from "../services/api.service";
import { RefreshService } from "../services/refresh.service";
import Swal from "sweetalert2";
import { Subscription } from "rxjs";
import { ShipmentStateService } from "../services/States/Shipments/shipment-state.service";
import { WebhookViewComponent } from "../Dialog/webhook-view/webhook-view.component";
import * as XLSX from "xlsx";
import { InvoiceDataService } from "../services/invoice-data.service";

interface StatusData {
  role: number;
  id: number;
}

@Component({
  selector: "app-courier-details",
  templateUrl: "./courier-details.component.html",
  styleUrl: "./courier-details.component.css",
})
export class CourierDetailsComponent implements OnInit {
  showFiltersForm: boolean = false;
  buttonText: string = "Filters";
  buttonIcon: string = "ri-filter-fill";
  orders: any[] = [];
  paginatedOrders: any[] = [];
  courierData: any[] = [];
  currentFilters: any = {};
  totalOrders: number = 0;
  statusId: number = 0;
  statusData: any;
  pageIndex: number = 0;
  pageSize: number = 10;
  institutionName: number = 0;
  courierId: string = "";
  courierName: number = 0;
  statusCode: number = 0;
  startDate: string = "";
  endDate: string = "";
  orderTypes = [
    { label: "Dispatched", value: "OK_ORDER" },
    { label: "Redispatch", value: "RTO_REDISPATCH" },
    { label: "RTO", value: "RTO_ORDER" },
    { label: "Destroyed", value: "DESTROY_ORDER" },
    { label: "NSZ", value: "NSZ_ORDER" },
  ];

  selectedOrderTypes: string[] = []; // stores values
  selectedOrderTypesString: string = "";

  private refreshSubscription?: Subscription;
  selectedDateRange: { startDate: string; endDate: string } = {
    startDate: "",
    endDate: "",
  };

  constructor(
    private apiservice: ApiService,
    private http: HttpClient,
    private router: Router,
    private shipmentStateService: ShipmentStateService,
    private invoiceService: InvoiceDataService
  ) {}

  ngOnInit(): void {
    const savedTab = localStorage.getItem("activeInvoiceTab");

    this.loadCourierData();

    debugger
    this.invoiceService.statusData$.subscribe((data) => {
      this.statusData = data;
      if (data) {
        console.log("Received status data:", data);

        this.institutionName = Number(data.institutionName) || 0;
        this.courierName = Number(data.courierName) || 0;
        this.startDate = String(data.startDate || "");
        this.endDate = String(data.endDate || "");
      } else {
        console.warn("Received null or undefined data");
      }
    });
    if (savedTab == "perso") {
      this.fetchOrders(this.pageIndex, this.pageSize);
    } else if (savedTab == "insta") {
      this.fetchInstaOrders(this.pageIndex, this.pageSize);
    }
  }

  isDropdownOpen = false;

  selectedValues: string[] = [];
  selectedValuesString: string = "";

  @ViewChild("dropdownRef") dropdownRef!: ElementRef;

  toggleDropdown() {
    this.isDropdownOpen = !this.isDropdownOpen;
  }

  @HostListener("document:click", ["$event"])
  onDocumentClick(event: MouseEvent) {
    if (!this.dropdownRef?.nativeElement) return;

    if (!this.dropdownRef.nativeElement.contains(event.target)) {
      this.isDropdownOpen = false;
    }
  }
  onItemChange(event: any, value: string) {
    if (event.target.checked) {
      this.selectedValues.push(value);
    } else {
      this.selectedValues = this.selectedValues.filter((v) => v !== value);
    }

    this.updateString();
  }

  toggleSelectAll(event: any) {
    if (event.target.checked) {
      this.selectedValues = this.orderTypes.map((x) => x.value);
    } else {
      this.selectedValues = [];
    }
    this.updateString();
  }

  isAllSelected(): boolean {
    return this.selectedValues.length === this.orderTypes.length;
  }

  updateString() {
    this.selectedValuesString = this.selectedValues.join(",");
  }

  get selectedLabels(): string[] {
    return this.orderTypes
      .filter((x) => this.selectedValues.includes(x.value))
      .map((x) => x.label);
  }

  isActive: string | null = "All";

  setActiveAll(): void {
    this.isActive = "All";
  }

  loadCourierData(): void {
    this.http.get<any>(this.apiservice.CourierData).subscribe((response) => {
      this.courierData = response.data;
    });
  }

  toggleFiltersForm() {
    this.showFiltersForm = !this.showFiltersForm;
    this.buttonText = this.showFiltersForm ? "Close" : "Filters";
    this.buttonIcon = this.showFiltersForm ? "ri-close-fill" : "ri-filter-fill";
  }

  setActive(statusId: string): void {
    this.isActive = statusId;
  }

  applyFilters() {
    this.fetchOrders(this.pageIndex, this.pageSize);
  }

  clearFilters() {
    this.selectedValues = []; // clear array
    this.selectedValuesString = ""; // clear string
    this.courierId = "";

    // 🔥 force change detection (important)
    this.selectedValues = [...this.selectedValues];

    this.fetchOrders(this.pageIndex, this.pageSize);
  }

  loading: boolean = false;


   fetchInstaOrders(pageIndex: number, pageSize: number) {
    let params = new HttpParams()
      .set("pageNumber", (pageIndex + 1).toString())
      .set("pageSize", pageSize.toString());

    this.loading = true;

    debugger;

    params = params.set("institutionId", this.institutionName);
    params = params.set("startDate", this.startDate);
    params = params.set("endDate", this.endDate);
    if (this.courierId) {
      params = params.set("courierId", this.courierId);
    }

    if (this.selectedValuesString) {
      params = params.set("orderTypeCSV", this.selectedValuesString);
    }

    debugger;

    this.http.get(this.apiservice.InstaInvoiceDataFilter, { params }).subscribe(
      (res: any) => {
        if (res.status) {
          this.orders = res.data.invoiceLists;
          this.paginatedOrders = this.orders;
          this.totalOrders = res.data.total;
        }
        this.loading = false;
      },
      (error) => {
        this.loading = false;
      }
    );
  }


  fetchOrders(pageIndex: number, pageSize: number) {
    let params = new HttpParams()
      .set("pageNumber", (pageIndex + 1).toString())
      .set("pageSize", pageSize.toString());

    this.loading = true;

    params = params.set("institutionId", this.institutionName);
    params = params.set("startDate", this.startDate);
    params = params.set("endDate", this.endDate);
    if (this.courierId) {
      params = params.set("courierId", this.courierId);
    }

    if (this.selectedValuesString) {
      params = params.set("orderTypeCSV", this.selectedValuesString);
    }

    this.http.get(this.apiservice.InvoiceDataFilter, { params }).subscribe(
      (res: any) => {
        if (res.status) {
          this.orders = res.data.invoiceLists;
          this.paginatedOrders = this.orders;
          this.totalOrders = res.data.total;
        }
        this.loading = false;
      },
      (error) => {
        this.loading = false;
      }
    );
  }

  makeActive(label: string) {
    this.isActive = label;
  }

  isSelectAllChecked: boolean = false;
  isExporting: boolean = false;
  exportToCSV() {
    this.isExporting = true;
    let params = new HttpParams();

    // Set filters but NOT pagination
    params = params.set("institutionId", this.institutionName);
    params = params.set("startDate", this.startDate);
    params = params.set("endDate", this.endDate);
    if (this.courierId) {
      params = params.set("courierId", this.courierId);
    }

    if (this.selectedValuesString) {
      params = params.set("orderTypeCSV", this.selectedValuesString);
    }

    // Optional: set dataCount to a high value if backend supports it
    params = params.set("pageSize", 1000000); // or remove if API returns all by default
    params = params.set("pageNumber", 1); // or remove if API returns all by default

    const savedTab = localStorage.getItem("activeInvoiceTab");
    if(savedTab == 'perso'){this.http.get(this.apiservice.InvoiceDataFilter, { params }).subscribe(
      (res: any) => {
        if (res.status && res.data?.invoiceLists?.length) {
          console.log(res.data.invoiceLists);
          const filteredData = res.data.invoiceLists.map((item: any) => ({
            "Bank Name": this.getSafeValue(item.seller),
            "Courier Name": this.getSafeValue(item.courier),
            "OLD AWB": this.getSafeValue(item.oldAWB),
            "AWB Number": this.getSafeValue(item.awb),
            Pincode: this.getSafeValue(item.pincode),
            Date: this.getSafeValue(item.bookedDate),
            "Order Status": this.getSafeValue(item.orderStatus),
            "Shipment Status": this.getSafeValue(item.shipmentStatus),
            "Order Type": this.getSafeValue(item.recordType),
            TAT: this.getSafeValue(item.tat),
            Zone: this.getSafeValue(item.zone),
          }));

          const worksheet: XLSX.WorkSheet =
            XLSX.utils.json_to_sheet(filteredData);
          const workbook: XLSX.WorkBook = {
            Sheets: { "Courier Data": worksheet },
            SheetNames: ["Courier Data"],
          };

          const firstItem = res.data.invoiceLists[0];
          const institution =
            firstItem.seller?.replace(/\s+/g, "") || "Institution";
          const courier = firstItem.courier?.replace(/\s+/g, "") || "Courier";
          const zone = firstItem.zone?.replace(/\s+/g, "") || "Zone";
          const tat = firstItem.tat?.replace(/\s+/g, "") || "TAT";

          const today = new Date();
          const dd = String(today.getDate()).padStart(2, "0");
          const mm = String(today.getMonth() + 1).padStart(2, "0"); // Months are zero-indexed
          const yyyy = today.getFullYear();
          const formattedDate = `${dd}${mm}${yyyy}`;

          const filename = `${institution}_${courier}_${formattedDate}.xlsx`;

          XLSX.writeFile(workbook, filename);
        } else {
          console.warn("No data found to export");
        }
        this.isExporting = false;
      },
      (error) => {
        console.error("Error exporting data:", error);
        this.isExporting = false;
      }
    );}

    if(savedTab == 'insta'){this.http.get(this.apiservice.InstaInvoiceDataFilter, { params }).subscribe(
      (res: any) => {
        if (res.status && res.data?.invoiceLists?.length) {
          console.log(res.data.invoiceLists);
          const filteredData = res.data.invoiceLists.map((item: any) => ({
            "Bank Name": this.getSafeValue(item.seller),
            "Courier Name": this.getSafeValue(item.courier),
            "OLD AWB": this.getSafeValue(item.oldAWB),
            "AWB Number": this.getSafeValue(item.awb),
            Pincode: this.getSafeValue(item.pincode),
            Date: this.getSafeValue(item.bookedDate),
            "Order Status": this.getSafeValue(item.orderStatus),
            "Shipment Status": this.getSafeValue(item.shipmentStatus),
            "Order Type": this.getSafeValue(item.recordType),
            TAT: this.getSafeValue(item.tat),
            Zone: this.getSafeValue(item.zone),
          }));

          const worksheet: XLSX.WorkSheet =
            XLSX.utils.json_to_sheet(filteredData);
          const workbook: XLSX.WorkBook = {
            Sheets: { "Courier Data": worksheet },
            SheetNames: ["Courier Data"],
          };

          const firstItem = res.data.invoiceLists[0];
          const institution =
            firstItem.seller?.replace(/\s+/g, "") || "Institution";
          const courier = firstItem.courier?.replace(/\s+/g, "") || "Courier";
          const zone = firstItem.zone?.replace(/\s+/g, "") || "Zone";
          const tat = firstItem.tat?.replace(/\s+/g, "") || "TAT";

          const today = new Date();
          const dd = String(today.getDate()).padStart(2, "0");
          const mm = String(today.getMonth() + 1).padStart(2, "0"); // Months are zero-indexed
          const yyyy = today.getFullYear();
          const formattedDate = `${dd}${mm}${yyyy}`;

          const filename = `${institution}_${courier}_${formattedDate}.xlsx`;

          XLSX.writeFile(workbook, filename);
        } else {
          console.warn("No data found to export");
        }
        this.isExporting = false;
      },
      (error) => {
        console.error("Error exporting data:", error);
        this.isExporting = false;
      }
    );}
  }

  handlePageEvent(event: { pageIndex: number; pageSize: number }) {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.shipmentStateService.setPageIndex(this.pageIndex);
    this.fetchOrders(this.pageIndex, this.pageSize);
  }

  //--------Routes

  private getSafeValue(value: any): string {
    return value === null || value === undefined || String(value).trim() === ""
      ? "--"
      : value;
  }

  navigateTostatus() {
    this.router.navigate(["admin/shipment/status"]);
  }

  navigateToAwbStatus(awb: string): void {
    this.router.navigate(["admin/status", awb]);
  }

  navigateToShipmentDetail(orderID: string): void {
    this.router.navigate(["/admin/shipment/details", orderID]);
  }
}
