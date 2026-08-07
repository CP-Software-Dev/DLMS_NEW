import { HttpClient, HttpParams } from "@angular/common/http";
import { Component, OnInit } from "@angular/core";
import { FormControl, FormGroup, FormBuilder } from "@angular/forms";
import { ApiService } from "../services/api.service";
import { Router } from "@angular/router";
import { GraphService } from "../services/graph.service";
import { SellerService } from "../services/seller.service";

@Component({
  selector: "app-dashboard",
  templateUrl: "./dashboard.component.html",
  styleUrl: "./dashboard.component.css",
})
export class DashboardComponent implements OnInit {
  selectedDateRange: { startDate: string; endDate: string } = {
    startDate: "",
    endDate: "",
  };
  currentFilters: any = {};
  sellerData: any[] = [];
  data: any[] = [];
  cardData: any[] = [];
  sellerwiseData: any[] = [];
  shipmentwiseData: any[] = [];
  moreButtonText: string = "All";
  selectedSeller: any = null;


  selectedType: number = 2;
  selectedTypeLabel: string = "Perso";
  serviceType: number = 2;

  constructor(
    private http: HttpClient,
    private apiservice: ApiService,
    private sellerService: SellerService,
    private graphservice: GraphService,
    private router: Router
  ) {
    // const oneMonthAgo = "01-01-2024";
    // this.selectedDateRange = {
    //   startDate: this.formatDate(oneMonthAgo),
    //   endDate: this.formatDate(new Date().toISOString()),
    // };
    //this.applyFilters();

    const endDate = new Date(); // Today
    const startDate = new Date(); // Clone today
    startDate.setDate(startDate.getDate() - 29); // Last 30 days

    this.selectedDateRange = {
      startDate: this.formatDate(startDate.toISOString()),
      endDate: this.formatDate(endDate.toISOString()),
    };
  }

  isAdmin: boolean = false;
  role: boolean = false;

  ngOnInit(): void {
    this.loadSellerData();
    this.serviceType = Number(localStorage.getItem("serviceType"));
    if (this.serviceType === 3) {
      this.selectedType = 3;
      this.graphservice.setFileType(3);
    }
    if (this.serviceType === 1 || this.serviceType === 2) {
      this.selectedType = 2;
      this.graphservice.setFileType(2);
    }
    const role = this.sellerService.getItem("role");
    if (role == "2") {
      this.isAdmin = false;
    } else {
      this.isAdmin = true;
    }
  }

  //----------DateRange

  formatDate(date: string): string {
    return new Date(date).toISOString().split("T")[0];
  }

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
  sendDateRange(startDate: string, endDate: string): void {
    this.graphservice.setStartDate(startDate);
    this.graphservice.setEndDate(endDate);
  }

  //----------Seller ID

  loadSellerData(): void {
    this.http.get<any>(this.apiservice.SellerData).subscribe((response) => {
      this.sellerData = [{ id: 0, name: "All" }, ...response.data];
      this.selectSeller(0);
    });
  }

  setDefaultSeller(): void {
    const defaultSeller = this.sellerData.find((seller) => seller.id === 1);
    if (defaultSeller) {
      this.selectSeller(defaultSeller.id);
    }
  }

  selectSeller(sellerId: number): void {
    if (!this.selectedSeller || this.selectedSeller.id !== sellerId) {
      this.selectedSeller = this.sellerData.find(
        (seller) => seller.id === sellerId
      );
      if (this.selectedSeller) {
        this.moreButtonText = this.selectedSeller.name;
        this.sendSellerId(sellerId);
        this.applyFilters();
      }
    }
  }

  selectType(value: number, label: string) {
    this.selectedType = value;
    this.selectedTypeLabel = label;
    this.graphservice.setFileType(value);
    this.fetchFilteredData();
  }

  isDropdownItemActive(sellerId: number): boolean {
    return this.selectedSeller && this.selectedSeller.id === sellerId;
  }

  sendSellerId(sellerId: number): void {
    this.graphservice.setSellerId(sellerId);
  }

  //----------Data Fetching

  fetchFilteredData(filters: any = this.currentFilters) {
    let params = new HttpParams().set("fileType", this.selectedType);

    if (filters.sellerId) {
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

    if (this.selectedSeller && this.selectedSeller.id !== 0) {
      this.currentFilters.sellerId = this.selectedSeller.id;
    }
    if (this.selectedDateRange) {
      const { startDate, endDate } = this.selectedDateRange;
      this.currentFilters.startDate = startDate;
      this.currentFilters.endDate = endDate;
      this.sendDateRange(startDate, endDate);
    }
    this.fetchFilteredData(this.currentFilters);
  }

  //----------Card Data

  getCardCount(cardType: string): number {
    const card = this.cardData.find((card) => card.type === cardType);
    return card ? card.count : 0;
  }

  totalOrders(): void {
    const sellerId = this.selectedSeller.id;
    const startDate = this.selectedDateRange.startDate;
    const endDate = this.selectedDateRange.endDate;

    this.router.navigate(["admin/orders"], {
      queryParams: {
        sellerId: sellerId,
        startDate: startDate,
        endDate: endDate,
      },
    });
  }

  shippedOrders(): void {
    const sellerId = this.selectedSeller.id;
    const startDate = this.selectedDateRange.startDate;
    const endDate = this.selectedDateRange.endDate;
    const statusID = 5;

    this.router.navigate(["admin/orders"], {
      queryParams: {
        sellerId: sellerId,
        startDate: startDate,
        endDate: endDate,
        statusId: statusID,
      },
    });
  }

  rtoOrders(): void {
    const sellerId = this.selectedSeller.id;
    const startDate = this.selectedDateRange.startDate;
    const endDate = this.selectedDateRange.endDate;
    const statusID = 14;

    this.router.navigate(["admin/ndr"], {
      queryParams: {
        sellerId: sellerId,
        startDate: startDate,
        endDate: endDate,
        statusId: statusID,
      },
    });
  }

  exceptionOrders(): void {
    const sellerId = this.selectedSeller.id;
    const startDate = this.selectedDateRange.startDate;
    const endDate = this.selectedDateRange.endDate;
    const statusID = 11;
    this.router.navigate(["admin/ndr"], {
      queryParams: {
        sellerId: sellerId,
        startDate: startDate,
        endDate: endDate,
        statusId: statusID,
      },
    });
  }

  deliveredOrders(): void {
    const sellerId = this.selectedSeller.id;
    const startDate = this.selectedDateRange.startDate;
    const endDate = this.selectedDateRange.endDate;
    const statusID = 10;

    this.router.navigate(["admin/shipment"], {
      queryParams: {
        sellerId: sellerId,
        startDate: startDate,
        endDate: endDate,
        statusId: statusID,
      },
    });
  }

  totalCouriers(): void {
    this.router.navigate(["admin/couriers"]);
  }

  totalUsers(): void {
    const status = "Active";
    this.router.navigate(["admin/users"], {
      queryParams: {
        statusId: "Active",
      },
    });
  }

  totalWebhook(): void {
    const sellerId = this.selectedSeller.id;
    this.router.navigate(["admin/webhook"], {
      queryParams: {
        sellerId: sellerId,
      },
    });
  }
}
