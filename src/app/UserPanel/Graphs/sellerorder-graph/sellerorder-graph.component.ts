import { AfterViewInit, Component, OnDestroy, OnInit } from "@angular/core";
import { Chart, ChartConfiguration, registerables } from "chart.js";
import { ApiService } from "../../../services/api.service";
import { HttpClient, HttpParams } from "@angular/common/http";
import { GraphService } from "../../../services/graph.service";
import { Subscription, combineLatest } from "rxjs";
import { debounceTime } from "rxjs/operators";
import { FormControl, FormGroup } from "@angular/forms";
import { Router } from "@angular/router";
import { SellerService } from "../../../services/seller.service";

interface OrderData {
  name: string;
  count: number;
}

interface ApiResponse {
  status: boolean;
  data: {
    orderStatusWise: OrderData[];
  };
}

@Component({
  selector: "app-sellerorder-graph",
  templateUrl: "./sellerorder-graph.component.html",
  styleUrl: "./sellerorder-graph.component.css",
})
export class SellerorderGraphComponent implements OnDestroy, AfterViewInit {
  dateRange = new FormGroup({
    start: new FormControl(),
    end: new FormControl(),
  });
  sellerId: number = 0;
  fileType: number = 0;
  startDate: string = "";
  endDate: string = "";
  public chart: any;
  noData: boolean = false;
  private subscription: Subscription = new Subscription();

  constructor(
    private apiservice: ApiService,
    private http: HttpClient,
    private graphService: GraphService,
    private router: Router,
    private sellerService: SellerService
  ) {
    Chart.register(...registerables);
  }
  currentFilters: any = {};

  hasOrder: boolean = false;
  role: boolean = false;
  rolenum: number = 0;

  statusCodeMapping: { [key: string]: number } = {
    Requested: 1,
    Printed: 2,
    Personalized: 3,
    "Ready To Dispatch": 4,
    Shipped: 5,
    Cancelled: 19,
  };

  ngAfterViewInit(): void {
    this.subscription.add(
      combineLatest([
        this.graphService.currentSellerId,
        this.graphService.currentStartDate,
        this.graphService.currentEndDate,
        this.graphService.currentFileType,
      ])
        .pipe(debounceTime(100)) // Debounce to avoid rapid triggers
        .subscribe(([sellerId, startDate, endDate, fileType]) => {
          this.sellerId = sellerId;
          this.startDate = startDate;
          this.endDate = endDate;
          this.fileType = fileType;
          this.applyfilters();
        })
    );

    const role = this.sellerService.getItem("role");
    this.rolenum = Number(role);
    if (role == "4") {
      const hasOrderValue = this.sellerService.getItem("hasOrder");
      this.hasOrder = hasOrderValue === "1";
    } else {
      this.hasOrder = true;
    }
  }

  applyfilters() {
    this.currentFilters = {};

    if (this.sellerId && this.sellerId !== 0) {
      this.currentFilters.sellerId = this.sellerId;
    }
    if (this.startDate) {
      this.currentFilters.startDate = this.startDate;
    }
    if (this.endDate) {
      this.currentFilters.endDate = this.endDate;
    }
    if (this.fileType) {
      this.currentFilters.fileType = this.fileType;
    }
    this.loadChartData(this.currentFilters);
  }

  loadChartData(filters: any = this.currentFilters): void {
    let params = new HttpParams();

    if (filters.sellerId) {
      params = params.set("sellerId", filters.sellerId);
    }
    if (filters.startDate) {
      params = params.set("startDate", filters.startDate);
    }
    if (filters.endDate) {
      params = params.set("endDate", filters.endDate);
    }
    if (filters.fileType) {
      params = params.set("fileType", filters.fileType);
    }

    this.http.get<ApiResponse>(this.apiservice.Dashboard, { params }).subscribe(
      (res) => {
        if (res.status) {
          const orderData: OrderData[] = res.data.orderStatusWise;
          if (orderData.length === 0) {
            this.noData = true;
          } else {
            this.noData = false;
            const filteredData = orderData.filter(
              (item: OrderData) => item.name !== "Cancelled"
            );
            const labels = filteredData.map((item: OrderData) => item.name);
            const counts = filteredData.map((item: OrderData) => item.count);
            this.createChart(labels, counts);
          }
        }
      },
      (error) => {
        console.error("Error fetching chart data", error);
      }
    );
  }
  createChart(labels: string[], counts: number[]) {
    setTimeout(() => {
      const chartElement = document.getElementById(
        "sellerOrder-chart"
      ) as HTMLCanvasElement;
      const data = {
        labels: labels,
        datasets: [
          {
            label: "Order's Count",
            data: counts,
            backgroundColor: [
              "rgba(255, 99, 132, 0.6)",
              "rgba(54, 162, 235, 0.6)",
              "rgba(255, 206, 86, 0.6)",
              "rgba(75, 192, 192, 0.6)",
              "rgba(153, 102, 255, 0.6)",
              "rgba(255, 159, 64, 0.6)",
              "rgba(255, 99, 64, 0.6)",
              "rgba(54, 162, 132, 0.6)",
              "rgba(75, 206, 86, 0.6)",
              "rgba(153, 192, 192, 0.6)",
              "rgba(255, 206, 255, 0.6)",
              "rgba(255, 159, 132, 0.6)",
              "rgba(54, 102, 235, 0.6)",
              "rgba(75, 159, 192, 0.6)",
              "rgba(153, 64, 255, 0.6)",
              "rgba(255, 99, 192, 0.6)",
              "rgba(54, 206, 64, 0.6)",
              "rgba(75, 102, 86, 0.6)",
              "rgba(153, 162, 192, 0.6)",
              "rgba(255, 159, 255, 0.6)",
            ],
            borderColor: [
              "rgba(255, 99, 132, 0.6)",
              "rgba(54, 162, 235, 0.6)",
              "rgba(255, 206, 86, 0.6)",
              "rgba(75, 192, 192, 0.6)",
              "rgba(153, 102, 255, 0.6)",
              "rgba(255, 159, 64, 0.6)",
              "rgba(255, 99, 64, 0.6)",
              "rgba(54, 162, 132, 0.6)",
              "rgba(75, 206, 86, 0.6)",
              "rgba(153, 192, 192, 0.6)",
              "rgba(255, 206, 255, 0.6)",
              "rgba(255, 159, 132, 0.6)",
              "rgba(54, 102, 235, 0.6)",
              "rgba(75, 159, 192, 0.6)",
              "rgba(153, 64, 255, 0.6)",
              "rgba(255, 99, 192, 0.6)",
              "rgba(54, 206, 64, 0.6)",
              "rgba(75, 102, 86, 0.6)",
              "rgba(153, 162, 192, 0.6)",
              "rgba(255, 159, 255, 0.6)",
            ],
            borderWidth: 1,
          },
        ],
      };

      const config: ChartConfiguration<"doughnut"> = {
        type: "doughnut",
        data: data,
        options: {
          responsive: true,
          maintainAspectRatio: false,
          cutout: "65%",
          plugins: {
            legend: {
              position: "bottom",
              labels: {
                boxWidth: 10,
                boxHeight: 10,
                padding: 20,
                usePointStyle: true,
              },
            },
          },
          onClick: (event, elements) => {
            if (this.hasOrder && elements.length > 0) {
              const chartElement = elements[0];
              const index = chartElement.index;
              const status = data.labels[index];
              const statusCode = this.statusCodeMapping[status] || 0; // Default to 0 if status not found
              this.navigateToOrders(statusCode);
            }
          },
          onHover: (event, elements) => {
            const chartElement = event.native
              ? (event.native.target as HTMLElement)
              : null;
            if (chartElement && elements.length > 0) {
              chartElement.style.cursor = "pointer";
            } else if (chartElement) {
              chartElement.style.cursor = "default";
            }
          },
        },
      };

      if (chartElement) {
        if (this.chart) {
          this.chart.destroy();
        }
        this.chart = new Chart(chartElement, config);
      } else {
        console.error("Chart element not found");
      }
    }, 100);
  }

  navigateToOrders(statusCode: number) {
    this.router.navigate(["user/orders"], {
      queryParams: {
        sellerId: this.sellerId,
        statusId: statusCode,
        startDate: this.startDate,
        endDate: this.endDate,
      },
    });
  }

  ngOnDestroy() {
    if (this.chart) {
      this.chart.destroy();
    }
    this.subscription.unsubscribe();
  }
}
