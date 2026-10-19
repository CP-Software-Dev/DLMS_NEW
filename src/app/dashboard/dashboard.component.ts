import { HttpClient, HttpParams } from "@angular/common/http";
import { Component, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { ApiService } from "../services/api.service";
import { GraphService } from "../services/graph.service";
import { SellerService } from "../services/seller.service";

@Component({
  selector: "app-dashboard",
  templateUrl: "./dashboard.component.html",
  styleUrl: "./dashboard.component.css",
})
export class DashboardComponent implements OnInit {
  // ---------- role / view ----------
  rolenum = 0;
  isAdminView = false;            // role 1, 2 => admin side
  basePath: "admin" | "user" = "user";
  canManage = false;              // role 1 (super admin) / role 3 (institution admin) => links clickable
  permissions = { orders: true, shipments: true, reports: true };

  // ---------- filters ----------
  selectedDateRange = { startDate: "", endDate: "" };
  selectedQuickRange = 30; // 0 = All time
  selectedQuickRangeLabel = "30 days";
  currentFilters: any = {};
  selectedType = 2;
  selectedTypeLabel = "Perso";
  serviceType = 0;

  // ---------- seller ----------
  sellerData: any[] = [];
  selectedSeller: any = null;      // admin view only
  moreButtonText = "All";
  private userSellerId: any = 0;   // user view only (localStorage)

  // ---------- data ----------
  cardData: any[] = [];
  sellerwiseData: any[] = [];
  shipmentwiseData: any[] = [];
  employees: any[] = [];
  EmployeeCount = 0;
  username: any;

  constructor(
    private http: HttpClient,
    private apiservice: ApiService,
    private sellerService: SellerService,
    private graphservice: GraphService,
    private router: Router
  ) {
    this.setRange(30);
  }

  ngOnInit(): void {
    this.rolenum = Number(this.sellerService.getItem("role"));
    this.isAdminView = this.rolenum === 1 || this.rolenum === 2;
    this.basePath = this.isAdminView ? "admin" : "user";
    this.canManage = this.rolenum === 1 || this.rolenum === 3;

    this.loadPermissions();
    this.initServiceType();

    if (this.isAdminView) {
      this.loadSellerData(); // isme selectSeller(0) -> applyFilters() chalega
    } else {
      this.userSellerId = this.sellerService.getItem("seller");
      this.username = this.sellerService.getItem("username");
      this.sendSellerId(this.userSellerId);
      this.loadEmployees();
      this.applyFilters();
    }
  }

  // ================= permissions / service type =================
  private loadPermissions(): void {
    if (this.rolenum !== 4) return;
    const flag = (key: string) => this.sellerService.getItem(key) === "1";
    this.permissions = {
      orders: flag("hasOrder"),
      shipments: flag("hasShipments"),
      reports: flag("hasReports"),
    };
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

  // ================= date range =================
  selectQuickRange(days: number): void {
    this.selectedQuickRange = days;
    this.setRange(days);
    this.sendDateRange(this.selectedDateRange.startDate, this.selectedDateRange.endDate);
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
    this.selectedQuickRange = -1; // custom range, koi quick button active nahi
    this.selectedQuickRangeLabel = "Custom";
    this.sendDateRange(this.selectedDateRange.startDate, this.selectedDateRange.endDate);
    this.applyFilters();
  }

  formatDate(date: string): string {
    const parsed = new Date(date);
    const adjusted = new Date(parsed.getTime() - parsed.getTimezoneOffset() * 60000);
    return adjusted.toISOString().split("T")[0];
  }

  sendDateRange(startDate: string, endDate: string): void {
    this.graphservice.setStartDate(startDate);
    this.graphservice.setEndDate(endDate);
  }

  refreshDashboard(): void {
    this.applyFilters();
  }

  get formattedPipelineDate(): string {
    if (!this.selectedDateRange?.startDate) return "";
    const [y, m, d] = this.selectedDateRange.startDate.split("-").map(Number);
    return new Date(y, m - 1, d - 1).toLocaleDateString("en-IN", {
      weekday: "long", day: "2-digit", month: "long",
    });
  }

  // ================= seller =================
  get currentSellerId(): any {
    return this.isAdminView ? this.selectedSeller?.id ?? 0 : this.userSellerId;
  }

  loadSellerData(): void {
    this.http.get<any>(this.apiservice.SellerData).subscribe((response) => {
      this.sellerData = [{ id: 0, name: "All Banks" }, ...response.data];
      this.selectSeller(0);
    });
  }

  selectSeller(sellerId: number): void {
    if (!this.selectedSeller || this.selectedSeller.id !== sellerId) {
      this.selectedSeller = this.sellerData.find((s) => s.id === sellerId);
      if (this.selectedSeller) {
        this.moreButtonText = this.selectedSeller.name;
        this.sendSellerId(sellerId);
        this.applyFilters();
      }
    }
  }

  isDropdownItemActive(sellerId: number): boolean {
    return this.selectedSeller && this.selectedSeller.id === sellerId;
  }

  sendSellerId(sellerId: number): void {
    this.graphservice.setSellerId(sellerId);
  }

  selectType(value: number, label: string): void {
    this.selectedType = value;
    this.selectedTypeLabel = label;
    this.graphservice.setFileType(value);
    this.fetchFilteredData();
  }

  // ================= employees (user view) =================
  loadEmployees(): void {
    const params = new HttpParams()
      .set("dataCount", 100)
      .set("page", 1)
      .set("institutionId", this.userSellerId);

    this.http.get(this.apiservice.Users, { params }).subscribe((res: any) => {
      if (res.status) {
        this.employees = res.data.userDetails.filter(
          (e: any) => e.roleId == 4 && e.username !== this.username
        );
        this.EmployeeCount = this.employees.length;
      }
    });
  }

  // ================= data =================
  applyFilters(): void {
    this.currentFilters = {};
    const sid = this.currentSellerId;
    if (sid) this.currentFilters.sellerId = sid;

    const { startDate, endDate } = this.selectedDateRange;
    this.currentFilters.startDate = startDate;
    this.currentFilters.endDate = endDate;
    this.sendDateRange(startDate, endDate);

    this.fetchFilteredData(this.currentFilters);
  }

  fetchFilteredData(filters: any = this.currentFilters): void {
    let params = new HttpParams().set("fileType", this.selectedType);
    if (filters.sellerId) params = params.set("sellerId", filters.sellerId);

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

  percent(part: number, whole: number): number {
    return whole > 0 ? Math.round((part * 100) / whole) : 0;
  }

  get usersCount(): number {
    return this.isAdminView ? this.getCardCount("Users") : this.EmployeeCount;
  }

  // ================= navigation =================
  goTo(page: "orders" | "ndr" | "shipment", statusId?: number): void {
    const queryParams: any = {
      sellerId: this.currentSellerId,
      startDate: this.selectedDateRange.startDate,
      endDate: this.selectedDateRange.endDate,
    };
    if (statusId !== undefined) queryParams.statusId = statusId;
    this.router.navigate([`${this.basePath}/${page}`], { queryParams });
  }

  goToCouriers(): void {
    this.router.navigate([`${this.basePath}/couriers`]);
  }

  goToUsers(): void {
    if (this.isAdminView) {
      this.router.navigate(["admin/users"], { queryParams: { statusId: "Active" } });
    } else {
      this.router.navigate(["user/employees"]);
    }
  }

  goToWebhook(): void {
    this.router.navigate(["admin/webhook"], { queryParams: { sellerId: this.currentSellerId } });
  }

  // ================= table helpers =================
  getShortBankName(name: string): string {
    return name.trim().split(/\s+/).map((w) => w.charAt(0)).join("").toUpperCase();
  }

  getStatusMixGradient(data: any, shipment: any): string {
    const segments = [
      { value: data.orders ?? 0, color: "#3b9eef" },
      { value: 0, color: "#8b7ff0" },
      { value: data.shipped ?? 0, color: "#26b99a" },
      { value: shipment?.delivered ?? 0, color: "#1f9d55" },
      { value: data.held ?? 0, color: "#f2617a" },
    ];
    const total = segments.reduce((s, x) => s + x.value, 0) || 1;
    let cumulative = 0;
    const stops: string[] = [];
    segments.forEach((seg) => {
      if (seg.value > 0) {
        const start = (cumulative / total) * 100;
        cumulative += seg.value;
        stops.push(`${seg.color} ${start}%`, `${seg.color} ${(cumulative / total) * 100}%`);
      }
    });
    return stops.length ? `linear-gradient(to right, ${stops.join(", ")})` : "#eef0f4";
  }
}