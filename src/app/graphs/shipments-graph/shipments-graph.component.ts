import { AfterViewInit, Component, OnDestroy, OnInit } from "@angular/core";
import { Chart, ChartConfiguration, registerables } from "chart.js";
import { ApiService } from "../../services/api.service";
import { HttpClient, HttpParams } from "@angular/common/http";
import { GraphService } from "../../services/graph.service";
import { Subscription, combineLatest } from "rxjs";
import { debounceTime } from "rxjs/operators";
import { Router } from "@angular/router";

interface ShipmentStatusData {
  name: string;
  count: number;
}

interface ApiResponse {
  status: boolean;
  data: {
    shipmentStatusWises: ShipmentStatusData[];
  };
}

@Component({
  selector: "app-shipments-graph",
  templateUrl: "./shipments-graph.component.html",
  styleUrls: ["./shipments-graph.component.css"],
})
export class ShipmentsGraphComponent implements AfterViewInit, OnDestroy {
  public barChart: any;
  sellerId: number = 0;
  currentFilters: any = {};
  startDate: string = "";
  fileType: number = 2;
  endDate: string = "";
  noData: boolean = false;
  private subscription: Subscription = new Subscription();

  constructor(
    private apiservice: ApiService,
    private graphService: GraphService,
    private router: Router,
    private http: HttpClient
  ) {
    Chart.register(...registerables);
  }

  // ngAfterViewInit(): void {
  //   this.subscription.add(
  //     this.graphService.currentSellerId.subscribe(sellerId => {
  //       this.sellerId = sellerId;
  //       if (this.sellerId !== null) {
  //         this.applyfilters();
  //       }
  //     })
  //   );

  //   this.subscription.add(
  //     this.graphService.currentStartDate.subscribe(startDate => {
  //       this.startDate = startDate;
  //       if (this.startDate !== null) {
  //         this.applyfilters();
  //       }
  //     })
  //   );

  //   this.subscription.add(
  //     this.graphService.currentEndDate.subscribe(endDate => {
  //       if (endDate !== null) {
  //         this.endDate = endDate;
  //         this.applyfilters();
  //       }
  //     })
  //   );
  // }

  ngAfterViewInit(): void {
    this.subscription.add(
      combineLatest([
        this.graphService.currentSellerId,
        this.graphService.currentStartDate,
        this.graphService.currentEndDate,
        this.graphService.currentFileType,
      ])
        .pipe(debounceTime(50)) // Debounce to avoid rapid triggers
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
          const shipmentData: ShipmentStatusData[] =
            res.data.shipmentStatusWises;
          if (shipmentData.length === 0) {
            this.noData = true;
          } else {
            this.noData = false;
            const labels = shipmentData.map(
              (item: ShipmentStatusData) => item.name
            );
            const counts = shipmentData.map(
              (item: ShipmentStatusData) => item.count
            );
            this.createBarChart(labels, counts);
          }
        }
      },
      (error) => {
        console.error("Error fetching chart data", error);
      }
    );
  }

  statusCodeMapping: { [key: string]: number } = {
    Booked: 6,
    "Waiting for Pickup": 7,
    "In Transit": 8,
    "Out for Delivery": 9,
    Delivered: 10,
    Exception: 11,
    "RTO In Transit": 12,
    "RTO Out for Delivery": 13,
    "RTO Delivered": 14,
    Lost: 15,
    Damaged: 16,
    "RTO Lost": 17,
    "RTO Damaged": 18,
    Cancelled: 19,
  };

  createBarChart(labels: string[], counts: number[]) {
    // setTimeout(() => {
    //   const chartElement = document.getElementById('barChart') as HTMLCanvasElement;
    //   const backgroundColors = [
    //     'rgba(6, 142, 252, 0.6)', 'rgba(0, 227, 151, 0.6)',
    //     'rgba(254, 177, 22, 0.6)', 'rgba(75, 192, 192, 0.6)',
    //     'rgba(153, 102, 255, 0.6)', 'rgba(255, 159, 64, 0.6)',
    //     'rgba(255, 99, 64, 0.6)', 'rgba(54, 162, 132, 0.6)',
    //     'rgba(75, 206, 86, 0.6)', 'rgba(153, 192, 192, 0.6)',
    //     'rgba(255, 206, 255, 0.6)', 'rgba(255, 159, 132, 0.6)',
    //     'rgba(54, 102, 235, 0.6)', 'rgba(75, 159, 192, 0.6)',
    //     'rgba(153, 64, 255, 0.6)', 'rgba(255, 99, 192, 0.6)',
    //     'rgba(54, 206, 64, 0.6)', 'rgba(75, 102, 86, 0.6)',
    //     'rgba(153, 162, 192, 0.6)', 'rgba(255, 159, 255, 0.6)'
    //   ];

    //   const borderColors = backgroundColors;

    //   const data = {
    //     labels: labels,
    //     datasets: [{
    //       label: "Order's Count",
    //       data: counts,
    //       backgroundColor: backgroundColors.slice(0, counts.length),
    //       borderColor: borderColors.slice(0, counts.length),
    //       borderWidth: 1
    //     }]
    //   };

    //   const config: ChartConfiguration<'doughnut'> = {
    //     type: 'doughnut',
    //     data: data,
    //     options: {
    //       responsive: true,
    //       maintainAspectRatio: false,
    //       cutout: '65%',
    //       plugins: {
    //         legend: {
    //           position: 'bottom',
    //           labels: {
    //             boxWidth: 10,
    //             boxHeight: 10,
    //             padding: 20,
    //             usePointStyle: true,
    //           }
    //         }
    //       }
    //     }
    //   };

    //   if (chartElement) {
    //     if (this.barChart) {
    //       this.barChart.destroy();
    //     }
    //     this.barChart = new Chart(chartElement, config);
    //   } else {
    //     console.error('Chart element not found');
    //   }
    // },100);

    setTimeout(() => {
      const chartElement = document.getElementById(
        "barChart"
      ) as HTMLCanvasElement;
      const backgroundColors = [
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
          onClick: (event, elements) => {
            if (elements.length > 0) {
              const chartElement = elements[0];
              const index = chartElement.index;
              const status = data.labels[index];
              const statusCode = this.statusCodeMapping[status] || 0; // Default to 0 if status not found
              if (statusCode > 10 && statusCode < 19) {
                this.navigateToExceptionPage(statusCode);
              } else {
                this.navigateToShipments(statusCode);
              }
              // this.navigateToShipments(statusCode);
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
        if (this.barChart) {
          this.barChart.destroy();
        }
        this.barChart = new Chart(chartElement, config);
      } else {
        console.error("Chart element not found");
      }
    }, 100);
  }

  navigateToShipments(statusCode: number) {
    this.router.navigate(["admin/shipment"], {
      queryParams: {
        sellerId: this.sellerId,
        statusId: statusCode,
        startDate: this.startDate,
        endDate: this.endDate,
      },
    });
  }
  navigateToExceptionPage(statusCode: number) {
    this.router.navigate(["admin/ndr"], {
      queryParams: {
        sellerId: this.sellerId,
        statusId: statusCode,
        startDate: this.startDate,
        endDate: this.endDate,
      },
    });
  }

  ngOnDestroy() {
    if (this.barChart) {
      this.barChart.destroy();
    }
    this.subscription.unsubscribe();
  }
}
