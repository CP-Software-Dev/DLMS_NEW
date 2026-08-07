import { Component, OnInit } from "@angular/core";
import { FormGroup, FormControl, FormBuilder } from "@angular/forms";
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
  selectedDateRange: { startDate: string; endDate: string } = {
    startDate: "",
    endDate: "",
  };
  seller: any;
  currentFilters: any = {};
  data: any[] = [];
  cardData: any[] = [];
  sellerwiseData: any[] = [];
  shipmentwiseData: any[] = [];
  hasOrder: boolean = false;
  hasShipments: boolean = false;
  hasReports: boolean = false;
  serviceType: number = 0;
  role: boolean = false;
  employees: any[] = [];
  rolenum: number = 0;
  username: any;
  EmployeeCount: number = 0;
  dateRange = new FormGroup({
    start: new FormControl(),
    end: new FormControl(),
  });

  selectedType: number = 2;
  selectedTypeLabel: string = "Perso";

  constructor(
    private sellerService: SellerService,
    private router: Router,
    private graphservice: GraphService,
    private apiservice: ApiService,
    private http: HttpClient,
    private fb: FormBuilder
  ) {
    const currentDate = new Date();
    const oneMonthAgo = "01-01-2024";
    this.selectedDateRange = {
      startDate: this.formatDate(oneMonthAgo),
      endDate: this.formatDate(new Date().toISOString()),
    };
    this.applyFilters();
  }

  ngOnInit(): void {
    const role = this.sellerService.getItem("role");
    this.serviceType = Number(localStorage.getItem("serviceType"));
    if (this.serviceType === 3) {
      this.selectedType = 3;
      this.graphservice.setFileType(3);
    }
    if (this.serviceType === 1 || this.serviceType === 2) {
      this.selectedType = 2;
      this.graphservice.setFileType(2);
    }
    this.rolenum = Number(role);
    if (role == "4") {
      const hasOrderValue = this.sellerService.getItem("hasOrder");
      this.hasOrder = hasOrderValue === "1";

      const hasShipmentValue = this.sellerService.getItem("hasShipments");
      this.hasShipments = hasShipmentValue === "1";

      const hasReportsValue = this.sellerService.getItem("hasReports");
      this.hasReports = hasReportsValue === "1";
    } else {
      this.hasOrder = true;
      this.hasReports = true;
      this.hasShipments = true;
    }
    this.seller = this.sellerService.getItem("seller");
    this.username = this.sellerService.getItem("username");

    this.sendSellerId(this.seller);
    this.loaEmployees();
    this.applyFilters();
  }

  selectType(value: number, label: string) {
    this.selectedType = value;
    this.selectedTypeLabel = label;
    this.graphservice.setFileType(value);
    this.fetchData();
  }
  loaEmployees(): void {
    let params = new HttpParams()
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

  //----------DateRange

  onDateRangeSelected(dateRange: { startDate: string; endDate: string }): void {
    this.selectedDateRange = {
      startDate: this.formatDate(dateRange.startDate),
      endDate: this.formatDate(dateRange.endDate),
    };
    this.sendDateRange(
      this.selectedDateRange.startDate,
      this.selectedDateRange.endDate
    );
    this.applyFilters();
  }

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

  //----------Seller

  sendSellerId(sellerId: number): void {
    this.graphservice.setSellerId(sellerId);
  }

  //----------Fetching Data

  fetchData(filters: any = this.currentFilters): void {
    debugger;
    let params = new HttpParams();
    params = params
      .set("sellerId", this.seller)
      .set("fileType", this.selectedType);

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

    this.http.get(this.apiservice.Dashboard, { params }).subscribe(
      (res: any) => {
        if (res.status) {
          this.data = res.data;
          this.cardData = res.data.cards;
          this.sellerwiseData = res.data.sellerWises;
          this.shipmentwiseData = res.data.shipmentWises;
        }
      },
      (error) => {}
    );
  }

  applyFilters(): void {
    this.currentFilters = {};

    if (this.selectedDateRange) {
      const { startDate, endDate } = this.selectedDateRange;
      this.currentFilters.startDate = startDate;
      this.currentFilters.endDate = endDate;
      this.sendDateRange(startDate, endDate);
    }
    this.fetchData(this.currentFilters);
  }

  //---------Cards Data

  getCardCount(cardType: string): number {
    const card = this.cardData.find((card) => card.type === cardType);
    return card ? card.count : 0;
  }

  totalOrders(): void {
    const sellerId = this.seller;
    const startDate = this.selectedDateRange.startDate;
    const endDate = this.selectedDateRange.endDate;
    this.router.navigate(["user/orders"], {
      queryParams: {
        sellerId: sellerId,
        startDate: startDate,
        endDate: endDate,
      },
    });
  }

  shippedOrders(): void {
    const sellerId = this.seller;
    const startDate = this.selectedDateRange.startDate;
    const endDate = this.selectedDateRange.endDate;
    const statusID = 5;

    this.router.navigate(["user/orders"], {
      queryParams: {
        sellerId: sellerId,
        startDate: startDate,
        endDate: endDate,
        statusId: statusID,
      },
    });
  }

  rtoOrders(): void {
 
    const sellerId = this.seller;
    const startDate = this.selectedDateRange.startDate;
    const endDate = this.selectedDateRange.endDate;
    const statusID = 14;
 
    this.router.navigate(["user/ndr"], {
      queryParams: {
        sellerId: sellerId,
        startDate: startDate,
        endDate: endDate,
        statusId: statusID,
      },
    });
  }

  exceptionOrders(): void {
    const sellerId = this.seller;
    const startDate = this.selectedDateRange.startDate;
    const endDate = this.selectedDateRange.endDate;
    const statusID = 11;
    this.router.navigate(["user/ndr"], {
      queryParams: {
        sellerId: sellerId,
        startDate: startDate,
        endDate: endDate,
        statusId: statusID,
      },
    });
  }

  deliveredOrders(): void {
    const sellerId = this.seller;
    const startDate = this.selectedDateRange.startDate;
    const endDate = this.selectedDateRange.endDate;
    const statusID = 10;

    this.router.navigate(["user/shipment"], {
      queryParams: {
        sellerId: sellerId,
        startDate: startDate,
        endDate: endDate,
        statusId: statusID,
      },
    });
  }

  toUser(): void {
    this.router.navigate(["user/employees"]);
  }

  toCouriers(): void {
    this.router.navigate(["user/couriers"]);
  }
}
