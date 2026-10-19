import { Component, AfterViewInit, OnDestroy } from '@angular/core';
import { Chart, ChartConfiguration, registerables } from 'chart.js';

@Component({
  selector: 'app-intake-vs-delivery',
  templateUrl: './intake-vs-delivery.component.html',
  styleUrl: './intake-vs-delivery.component.css',
})
export class IntakeVsDeliveryComponent implements AfterViewInit, OnDestroy {
  public chart: any;
  noData: boolean = false;

  //--------- i have added Static data — last 14 days (19 Aug – 01 Sep) for testing purpose-------------
  private labels: string[] = [
    '19 Aug',
    '20 Aug',
    '21 Aug',
    '22 Aug',
    '23 Aug',
    '24 Aug',
    '25 Aug',
    '26 Aug',
    '27 Aug',
    '28 Aug',
    '29 Aug',
    '30 Aug',
    '31 Aug',
    '01 Sep',
  ];

  private ordersData: number[] = [
    15, 18, 20, 22, 25, 28, 30, 32, 35, 38, 40, 42, 45, 48,
  ];

  private deliveredData: number[] = [
    10, 12, 14, 15, 18, 20, 22, 24, 25, 28, 30, 32, 35, 38,
  ];
  totalOrders: number = this.ordersData.reduce((a, b) => a + b, 0);
  totalDelivered: number = this.deliveredData.reduce((a, b) => a + b, 0);
  deliveryPercent: number = Math.round(
    (this.totalDelivered * 100) / this.totalOrders,
  );

  constructor() {
    Chart.register(...registerables);
  }

  ngAfterViewInit(): void {
    if (this.totalOrders === 0 && this.totalDelivered === 0) {
      this.noData = true;
    } else {
      this.createChart();
    }
  }

  createChart(): void {
    setTimeout(() => {
      const chartElement = document.getElementById(
        'intakeDeliveryChart',
      ) as HTMLCanvasElement;

      if (!chartElement) {
        console.error('Chart element not found');
        return;
      }

      if (this.chart) {
        this.chart.destroy();
      }

      const ctx = chartElement.getContext('2d')!;

      // Purple gradient fill (Orders)
      const purpleGradient = ctx.createLinearGradient(0, 0, 0, 280);
      purpleGradient.addColorStop(0, 'rgba(112, 97, 252, 0.28)');
      purpleGradient.addColorStop(1, 'rgba(100, 84, 243, 0)');

      // Green gradient fill (Delivered)
      const greenGradient = ctx.createLinearGradient(0, 0, 0, 280);
      greenGradient.addColorStop(0, 'rgba(28, 236, 115, 0.28)');
      greenGradient.addColorStop(1, 'rgba(27, 214, 105, 0)');

      const config: ChartConfiguration<'line'> = {
        type: 'line',
        data: {
          labels: this.labels,
          datasets: [
            {
              label: 'Orders received',
              data: this.ordersData,
              borderColor: '#7C6FEA',
              backgroundColor: purpleGradient,
              borderWidth: 3,
              tension: 0.4,
              fill: true,
              pointRadius: 4,
              pointHoverRadius: 7,
              pointBackgroundColor: '#FFFFFF',
              pointBorderColor: '#7C6FEA',
              pointBorderWidth: 2,
              pointHoverBackgroundColor: '#7C6FEA',
              pointHoverBorderColor: '#FFFFFF',
              pointHoverBorderWidth: 3,
            },
            {
              label: 'Parcels delivered',
              data: this.deliveredData,
              borderColor: '#2ECC71',
              backgroundColor: greenGradient,
              borderWidth: 3,
              tension: 0.4,
              fill: true,
              pointRadius: 4,
              pointHoverRadius: 7,
              pointBackgroundColor: '#FFFFFF',
              pointBorderColor: '#2ECC71',
              pointBorderWidth: 2,
              pointHoverBackgroundColor: '#2ECC71',
              pointHoverBorderColor: '#FFFFFF',
              pointHoverBorderWidth: 3,
            },
          ],
        },

        options: {
          responsive: true,
          maintainAspectRatio: false,

          interaction: {
            intersect: false,
            mode: 'index',
          },

          plugins: {
            legend: {
              display: false, // custom legend in HTML
            },

            tooltip: {
              backgroundColor: '#1A1A2E',
              displayColors: false,
              padding: 12,

              titleFont: {
                family: 'Nunito Sans',
                size: 12,
              },

              bodyFont: {
                family: 'Nunito Sans',
                size: 12,
              },

              callbacks: {
                label: (context) => {
                  return `${context.dataset.label}: ${Number(context.raw).toLocaleString()}`;
                },
              },
            },
          },

          scales: {
            y: {
              beginAtZero: true,

              border: {
                display: false,
              },

              grid: {
                color: '#EEF0F4',
                drawTicks: false,
              },

              ticks: {
                color: '#9AA0B4',
                font: {
                  family: 'Nunito Sans',
                  size: 11,
                },
                padding: 10,
                callback: (value) => Number(value).toLocaleString(),
              },
            },

            x: {
              border: {
                display: false,
              },

              grid: {
                display: false,
              },

              ticks: {
                color: '#6C7080',
                font: {
                  family: 'Nunito Sans',
                  size: 11,
                },
                padding: 12,

                callback: function (val, index) {
                  return index % 3 === 0
                    ? this.getLabelForValue(val as number)
                    : '';
                },
                maxRotation: 0,
                autoSkip: false,
              },
            },
          },
        },
      };

      this.chart = new Chart(chartElement, config);
    }, 100);
  }

  ngOnDestroy() {
    if (this.chart) {
      this.chart.destroy();
    }
  }
}
