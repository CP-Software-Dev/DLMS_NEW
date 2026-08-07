import { Component, OnDestroy, OnInit } from "@angular/core";
import { AfterViewInit } from "@angular/core";
import { Chart, ChartConfiguration, registerables } from "chart.js";
import { ApiService } from "../../../services/api.service";
import { HttpClient, HttpParams } from "@angular/common/http";
import { GraphService } from "../../../services/graph.service";
import { Subscription, combineLatest } from "rxjs";
import { debounceTime } from "rxjs/operators";
import { FormControl, FormGroup } from "@angular/forms";

interface CourierData {
  name: string;
  count: number;
}

interface ApiResponse {
  status: boolean;
  data: {
    courierWise: CourierData[];
  };
}

@Component({
  selector: "app-sellercourier-graph",
  templateUrl: "./sellercourier-graph.component.html",
  styleUrl: "./sellercourier-graph.component.css",
})
export class SellercourierGraphComponent implements AfterViewInit, OnDestroy {
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
    private graphService: GraphService
  ) {
    Chart.register(...registerables);
  }
  currentFilters: any = {};

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
          const courierData: CourierData[] = res.data.courierWise;
          if (courierData.length === 0) {
            this.noData = true;
          } else {
            this.noData = false;
            const labels = courierData.map((item: CourierData) => item.name);
            const counts = courierData.map((item: CourierData) => item.count);
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
        "sellerCourier-chart"
      ) as HTMLCanvasElement;
      const backgroundColors = [
        "rgba(6, 142, 252, 0.6)",
        "rgba(0, 227, 151, 0.6)",
        "rgba(254, 177, 22, 0.6)",
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
      ];

      const borderColors = backgroundColors;

      const data = {
        labels: labels,
        datasets: [
          {
            label: "Order's Count",
            data: counts,
            backgroundColor: backgroundColors.slice(0, counts.length),
            borderColor: borderColors.slice(0, counts.length),
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

  ngOnDestroy() {
    if (this.chart) {
      this.chart.destroy();
    }
    this.subscription.unsubscribe();
  }
}
