import { Component, OnInit } from "@angular/core";
import { SellerService } from "../../services/seller.service";
import { HttpClient, HttpParams } from "@angular/common/http";
import { GraphService } from "../../services/graph.service";
import { ApiService } from "../../services/api.service";
import { Router } from "@angular/router";

@Component({
  selector: "app-user-dashboard",
  templateUrl: "./user-dashboard.component.html",
  styleUrl: "./user-dashboard.component.css",
})
export class UserDashboardComponent implements OnInit {
  // ---------- filters ----------
  selectedDateRange: { startDate: string; endDate: string } = {
    startDate: "",
    endDate: "",
  };
  selectedQuickRange: number = 30; // 0 = All time, -1 = custom
  selectedQuickRangeLabel: string = "30 days";
  currentFilters: any = {};

  selectedType: number = 2;
  selectedTypeLabel: string = "Perso";
  serviceType: number = 0;

  // ---------- user info ----------
  seller: any;
  username: any;
  rolenum: number = 0;

  // ---------- permissions (role 4 ke liye login se aate hain) ----------
  hasOrder: boolean = false;
  hasShipments: boolean = false;
  hasReports: boolean = false;

  // ---------- data ----------
  cardData: any[] = [];
  sellerwiseData: any[] = [];
  shipmentwiseData: any[] = [];
  employees: any[] = [];
  EmployeeCount: number = 0;

  constructor(
    private sellerService: SellerService,
    private router: Router,
    private graphservice: GraphService,
    private apiservice: ApiService,
    private http: HttpClient
  ) {
    // Default: last 30 days (admin dashboard jaisa). API call yahan nahi, ngOnInit me.
    this.setRange(30);
  }

  ngOnInit(): void {
    this.rolenum = Number(this.sellerService.getItem("role"));
    this.seller = this.sellerService.getItem("seller");
    this.username = this.sellerService.getItem("username");

    this.loadPermissions();
    this.initServiceType();

    this.sendSellerId(this.seller);
    this.loadEmployees();
    this.applyFilters();
  }

  // ================= permissions / service type =================
  private loadPermissions(): void {
    if (this.rolenum === 4) {
      this.hasOrder = this.sellerService.getItem("hasOrder") === "1";
      this.hasShipments = this.sellerService.getItem("hasShipments") === "1";
      this.hasReports = this.sellerService.getItem("hasReports") === "1";
    } else {
      this.hasOrder = true;
      this.hasShipments = true;
      this.hasReports = true;
    }
  }

  private initServiceType(): void {
    this.serviceType = Number(this.sellerService.getItem("serviceType"));
    if (this.serviceType === 3) {
      this.selectedType = 3;
      this.selectedTypeLabel = "Insta";
      this.graphservice.setFileType(3);
    } else if (this.serviceType === 1 || this.serviceType === 2) {
      this.selectedType = 2;
      this.selectedTypeLabel = "Perso";
      this.graphservice.setFileType(2);
    }
  }

  /** Couriers / Employees cards ke link sirf role 3 (institution admin) ko.
   *  Naam `isAdmin` isliye rakha hai taaki naye dashboard ka HTML bina badle chal sake. */
  get isAdmin(): boolean {
    return this.rolenum === 3;
  }

  /** Users card me user side par employees ka count dikhta hai */
  get usersCount(): number {
    return this.EmployeeCount;
  }

  // ================= date range =================
  selectQuickRange(days: number): void {
    this.selectedQuickRange = days;
    this.setRange(days);
    this.sendDateRange(
      this.selectedDateRange.startDate,
      this.selectedDateRange.endDate
    );
    this.applyFilters();
  }

  private setRange(days: number): void {
    const endDate = new Date();
    const startDate = new Date();

    if (days === 0) {
      startDate.setFullYear(startDate.getFullYear() - 5);
      this.selectedQuickRangeLabel = "All time";
    } else {
      startDate.setDate(startDate.getDate() - (days - 1));
      this.selectedQuickRangeLabel = `${days} days`;
    }

    this.selectedDateRange = {
      startDate: this.formatDate(startDate.toISOString()),
      endDate: this.formatDate(endDate.toISOString()),
    };
  }

  onDateRangeSelected(dateRange: { startDate: string; endDate: string }): void {
    this.selectedDateRange = {
      startDate: this.formatDate(dateRange.startDate),
      endDate: this.formatDate(dateRange.endDate),
    };
    this.selectedQuickRange = -1; // custom range: koi quick button active nahi
    this.selectedQuickRangeLabel = "Custom";
    this.sendDateRange(
      this.selectedDateRange.startDate,
      this.selectedDateRange.endDate
    );
    this.applyFilters();
  }

  // Timezone-safe (IST me raat 12 se 5:30 tak pichla din nahi aayega)
  formatDate(date: string): string {
    const parsedDate = new Date(date);
    const adjustedDate = new Date(
      parsedDate.getTime() - parsedDate.getTimezoneOffset() * 60000
    );
    return adjustedDate.toISOString().split("T")[0];
  }

  sendDateRange(startDate: string, endDate: string): void {
    this.graphservice.setStartDate(startDate);
    this.graphservice.setEndDate(endDate);
  }

  refreshDashboard(): void {
    this.applyFilters();
  }

  get formattedPipelineDate(): string {
    if (!this.selectedDateRange?.startDate) {
      return "";
    }
    const [year, month, day] = this.selectedDateRange.startDate
      .split("-")
      .map(Number);
    const date = new Date(year, month - 1, day - 1);
    return date.toLocaleDateString("en-IN", {
      weekday: "long",
      day: "2-digit",
      month: "long",
    });
  }

  // ================= seller / type =================
  sendSellerId(sellerId: number): void {
    this.graphservice.setSellerId(sellerId);
  }

  selectType(value: number, label: string): void {
    this.selectedType = value;
    this.selectedTypeLabel = label;
    this.graphservice.setFileType(value);
    this.fetchData();
  }

  // ================= employees =================
  loadEmployees(): void {
    const params = new HttpParams()
      .set("dataCount", 100)
      .set("page", 1)
      .set("institutionId", this.seller);

    this.http.get(this.apiservice.Users, { params }).subscribe((res: any) => {
      if (res.status) {
        this.employees = res.data.userDetails.filter(
          (employee: any) =>
            employee.roleId == 4 && employee.username !== this.username
        );
        this.EmployeeCount = this.employees.length;
      }
    });
  }

  // ================= data =================
  applyFilters(): void {
    this.currentFilters = {};

    const { startDate, endDate } = this.selectedDateRange;
    this.currentFilters.startDate = startDate;
    this.currentFilters.endDate = endDate;
    this.sendDateRange(startDate, endDate);

    this.fetchData(this.currentFilters);
  }

  fetchData(filters: any = this.currentFilters): void {
    let params = new HttpParams()
      .set("sellerId", this.seller)
      .set("fileType", this.selectedType);

    let startDate = filters.startDate;
    let endDate = filters.endDate;

    if (!startDate || !endDate) {
      const today = this.formatDate(new Date().toISOString());
      startDate = startDate || today;
      endDate = endDate || today;
    }
    params = params.set("startDate", startDate).set("endDate", endDate);

    this.http.get(this.apiservice.Dashboard, { params }).subscribe({
      next: (res: any) => {
        if (res.status) {
          this.cardData = res.data.cards;
          this.sellerwiseData = res.data.sellerWises;
          this.shipmentwiseData = res.data.shipmentWises;
        }
      },
      error: () => {},
    });
  }

  // ================= cards =================
  getCardCount(cardType: string): number {
    const card = this.cardData.find((c) => c.type === cardType);
    return card ? card.count : 0;
  }

  /** Divide-by-zero safe percentage */
  percent(part: number, whole: number): number {
    return whole > 0 ? Math.round((part * 100) / whole) : 0;
  }

  // ================= navigation =================
  private goTo(page: string, statusId?: number): void {
    const queryParams: any = {
      sellerId: this.seller,
      startDate: this.selectedDateRange.startDate,
      endDate: this.selectedDateRange.endDate,
    };
    if (statusId !== undefined) {
      queryParams.statusId = statusId;
    }
    this.router.navigate([`user/${page}`], { queryParams });
  }

  totalOrders(): void {
    this.goTo("orders");
  }

  shippedOrders(): void {
    this.goTo("orders", 5);
  }

  rtoOrders(): void {
    this.goTo("ndr", 14);
  }

  exceptionOrders(): void {
    this.goTo("ndr", 11);
  }

  deliveredOrders(): void {
    this.goTo("shipment", 10);
  }

  totalCouriers(): void {
    this.router.navigate(["user/couriers"]);
  }

  totalUsers(): void {
    this.router.navigate(["user/employees"]);
  }

  /** User side par webhook page nahi hai, isliye kuch nahi hota */
  totalWebhook(): void {}

  // purane naam (agar purane HTML me use ho rahe ho)
  toUser(): void {
    this.totalUsers();
  }

  toCouriers(): void {
    this.totalCouriers();
  }

  // ================= table helpers =================
  getShortBankName(name: string): string {
    return name
      .trim()
      .split(/\s+/)
      .map((word) => word.charAt(0))
      .join("")
      .toUpperCase();
  }

  getStatusMixGradient(data: any, shipment: any): string {
    const segments = [
      { value: data.orders ?? 0, color: "#3b9eef" },
      { value: 0, color: "#8b7ff0" },
      { value: data.shipped ?? 0, color: "#26b99a" },
      { value: shipment?.delivered ?? 0, color: "#1f9d55" },
      { value: data.held ?? 0, color: "#f2617a" },
    ];
    const total = segments.reduce((sum, s) => sum + s.value, 0) || 1;

    let cumulative = 0;
    const stops: string[] = [];

    segments.forEach((seg) => {
      if (seg.value > 0) {
        const start = (cumulative / total) * 100;
        cumulative += seg.value;
        const end = (cumulative / total) * 100;
        stops.push(`${seg.color} ${start}%`, `${seg.color} ${end}%`);
      }
    });

    return stops.length
      ? `linear-gradient(to right, ${stops.join(", ")})`
      : "#eef0f4";
  }
}