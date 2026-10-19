import { AfterViewInit, Component, OnDestroy } from '@angular/core';
import { Chart, ChartConfiguration, registerables } from 'chart.js';
import { ApiService } from '../../services/api.service';
import { HttpClient, HttpParams } from '@angular/common/http';
import { GraphService } from '../../services/graph.service';
import { SellerService } from '../../services/seller.service';
import { Subscription, combineLatest } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { FormControl, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';

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

interface LegendItem {
  label: string;
  count: number;
  percent: number;
  color: string;
}

@Component({
  selector: 'app-orders-graph',
  templateUrl: './orders-graph.component.html',
  styleUrl: './orders-graph.component.css',
})
export class OrdersGraphComponent implements AfterViewInit, OnDestroy {
  dateRange = new FormGroup({
    start: new FormControl(),
    end: new FormControl(),
  });
  sellerId: number = 0;
  startDate: string = '';
  endDate: string = '';
  fileType: number = 2;
  noData: boolean = false;
  public chart: any;
  private subscription: Subscription = new Subscription();

  // ---------- role / permission ----------
  rolenum = 0;
  basePath: 'admin' | 'user' = 'user'; // role 1, 2 => admin, baaki => user
  canOpenOrders = true; // role 4 ke liye hasOrder flag, baaki roles ke liye true

  private readonly chartColors: string[] = [
    'rgba(6, 141, 252, 0.86)',
    'rgba(0, 227, 151, 0.94)',
    'rgba(254, 177, 22, 0.94)',
    'rgba(52, 209, 209, 0.93)',
    'rgba(111, 46, 240, 0.93)',
    'rgba(243, 143, 43, 0.93)',
    'rgba(245, 78, 41, 0.92)',
    'rgba(17, 247, 181, 0.89)',
    'rgba(27, 240, 44, 0.86)',
    'rgba(34, 247, 247, 0.86)',
    'rgba(228, 24, 228, 0.97)',
    'rgba(238, 71, 25, 0.95)',
    'rgba(26, 87, 253, 0.92)',
    'rgba(31, 183, 243, 0.87)',
    'rgba(123, 26, 235, 0.94)',
    'rgba(245, 11, 151, 0.88)',
    'rgba(17, 250, 33, 0.9)',
    'rgba(12, 240, 103, 0.93)',
    'rgba(27, 80, 253, 0.97)',
    'rgba(245, 21, 245, 0.93)',
  ];

  legendData: LegendItem[] = [];
  totalCount: number = 0;

  constructor(
    private apiservice: ApiService,
    private http: HttpClient,
    private router: Router,
    private graphService: GraphService,
    private sellerService: SellerService,
  ) {
    Chart.register(...registerables);

    this.rolenum = Number(this.sellerService.getItem('role'));
    this.basePath = this.rolenum === 1 || this.rolenum === 2 ? 'admin' : 'user';
    this.canOpenOrders =
      this.rolenum !== 4 || this.sellerService.getItem('hasOrder') === '1';
  }

  currentFilters: any = {};

  statusCodeMapping: { [key: string]: number } = {
    Requested: 1,
    Printed: 2,
    Personalized: 3,
    'Ready To Dispatch': 4,
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
        .pipe(debounceTime(50))
        .subscribe(([sellerId, startDate, endDate, fileType]) => {
          this.sellerId = sellerId;
          this.startDate = startDate;
          this.endDate = endDate;
          this.fileType = fileType;
          this.applyfilters();
        }),
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
      params = params.set('sellerId', filters.sellerId);
    }

    if (filters.startDate) {
      params = params.set('startDate', filters.startDate);
    }

    if (filters.endDate) {
      params = params.set('endDate', filters.endDate);
    }

    if (filters.fileType) {
      params = params.set('fileType', filters.fileType);
    }

    this.http.get<ApiResponse>(this.apiservice.Dashboard, { params }).subscribe(
      (res) => {
        if (res.status) {
          const orderData: OrderData[] = res.data.orderStatusWise;

          if (orderData.length === 0) {
            this.noData = true;
            this.legendData = [];
            this.totalCount = 0;
          } else {
            this.noData = false;

            const filteredData = orderData.filter(
              (item: OrderData) => item.name !== 'Cancelled',
            );

            const labels = filteredData.map((item: OrderData) => item.name);
            const counts = filteredData.map((item: OrderData) => item.count);

            this.updateLegend(labels, counts);
            this.createChart(labels, counts);
          }
        }
      },
      (error) => {
        console.error('Error fetching chart data', error);
      },
    );
  }

  updateLegend(labels: string[], counts: number[]): void {
    const total = counts.reduce((sum, c) => sum + c, 0);

    this.totalCount = total;

    this.legendData = labels.map((label, i) => ({
      label,
      count: counts[i],
      percent: total > 0 ? Math.round((counts[i] / total) * 100) : 0,
      color: this.chartColors[i % this.chartColors.length],
    }));
  }

  createChart(labels: string[], counts: number[]) {
    setTimeout(() => {
      const chartElement = document.getElementById(
        'myChart1',
      ) as HTMLCanvasElement;

      if (chartElement) {
        if (this.chart) {
          this.chart.destroy();
        }

        const backgroundColors = this.chartColors;
        const borderColors = backgroundColors;
        const total = counts.reduce((sum, c) => sum + c, 0);

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

        const centerTextPlugin = {
          id: 'centerText',

          beforeDraw: (chart: any) => {
            const { ctx, chartArea } = chart;

            if (!chartArea) return;

            const { width, height, top, left } = chartArea;

            const centerX = left + width / 2;
            const centerY = top + height / 2;

            const meta = chart.getDatasetMeta(0);
            const arc = meta.data[0];

            const innerRadius = arc.innerRadius;
            const paddingX = 15;
            const maxTextWidth = innerRadius * 2 - paddingX * 2;

            ctx.save();

            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';

            ctx.font =
              '800 28px "Nunito Sans", system-ui, -apple-system, "Segoe UI", sans-serif';

            ctx.fillStyle = '#1a1a2e';
            ctx.letterSpacing = '1px';

            ctx.fillText(total.toLocaleString(), centerX, centerY - 12, maxTextWidth);

            ctx.font =
              '600 11px "Nunito Sans", system-ui, -apple-system, "Segoe UI", sans-serif';

            ctx.fillStyle = '#9aa0b4';
            ctx.letterSpacing = '2px';

            ctx.fillText('ORDERS', centerX, centerY + 15, maxTextWidth);

            ctx.restore();
          },
        };

        const config: ChartConfiguration<'doughnut'> = {
          type: 'doughnut',
          data: data,
          plugins: [centerTextPlugin],
          options: {
            responsive: true,
            maintainAspectRatio: false,
            cutout: '72%',
            plugins: {
              legend: {
                display: false,
              },
            },
            onClick: (event, elements) => {
              // permission nahi hai to click par kuch nahi hoga
              if (!this.canOpenOrders) return;

              if (elements.length > 0) {
                const index = elements[0].index;
                const status = data.labels[index];
                const statusCode = this.statusCodeMapping[status] || 0;

                this.navigateToOrders(statusCode);
              }
            },
            onHover: (event, elements) => {
              const el = event.native
                ? (event.native.target as HTMLElement)
                : null;

              if (el) {
                el.style.cursor =
                  this.canOpenOrders && elements.length > 0
                    ? 'pointer'
                    : 'default';
              }
            },
          },
        };

        this.chart = new Chart(chartElement, config);
      } else {
        console.error('Chart element not found');
      }
    }, 100);
  }

  navigateToOrders(statusCode: number) {
    this.router.navigate([`${this.basePath}/orders`], {
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