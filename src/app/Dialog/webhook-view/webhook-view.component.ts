import { HttpClient, HttpParams } from '@angular/common/http';
import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatDialogRef } from '@angular/material/dialog';
import { ApiService } from '../../services/api.service';
import * as XLSX from 'xlsx';
import { ToastrService } from 'ngx-toastr';
import {
  trigger,
  state,
  transition,
  style,
  animate,
} from '@angular/animations';

@Component({
  selector: 'app-webhook-view',
  templateUrl: './webhook-view.component.html',
  styleUrl: './webhook-view.component.css',
  animations: [
    trigger('fadeSlideInOut', [
      state(
        'void',
        style({
          opacity: 0,
          transform: 'translateY(-50%)',
        }),
      ),
      transition('void => *', [
        animate(
          '700ms ease',
          style({
            opacity: 1,
            transform: 'translateY(0)',
          }),
        ),
      ]),
      transition('* => void', [
        animate(
          '300ms ease',
          style({
            opacity: 0,
            transform: 'translateY(-50%)',
          }),
        ),
      ]),
    ]),
  ],
})
export class WebhookViewComponent implements OnInit {
  orderID: number = 0;
  orderStatus:string="";
  shipmentStatus:string=""
  company:string="";
  awb: string = '';
  JourneyData: any[] = [];

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private http: HttpClient,
    private apiservice: ApiService,
    private toastr: ToastrService,
    private dialogRef: MatDialogRef<WebhookViewComponent>,
  ) {
    this.orderID = data.order;
    this.awb = data.awb || '';
    this.shipmentStatus = data.shipmentStatus || '';
    this.company = data.company || " "
  }

  ngOnInit(): void {
    this.fetchOrderJourney();
  }

  fetchOrderJourney(): void {
    let params = new HttpParams().set('orderId', this.orderID);
    this.http
      .get(this.apiservice.OrderJourney, { params })
      .subscribe((res: any) => {
        if (res.status) {
          this.JourneyData = res.data.statuses;
        }
        
      });
  }

  closeDialog() {
    this.dialogRef.close();
  }

  exportExcel(): void {
    if (this.JourneyData && this.JourneyData.length > 0) {
      const data = this.JourneyData.map((row: any) => ({
        OrderID: `${this.orderID}`,
        OrderStatus: row.orderStatus || '',
        ShipmentStatus: row.shipmentStatus || '',
        EventDateTime: row.eventDateTime || '',
        isWebhookSent: row.isWebhookSent === '1' ? 'Sent' : 'Not Sent',
      }));

      const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(data);

      const wb: XLSX.WorkBook = XLSX.utils.book_new();

      XLSX.utils.book_append_sheet(wb, ws, 'JourneyData');

      XLSX.writeFile(wb, `Webhook_${this.orderID}.xlsx`);
    } else {
      this.toastr.error('No data to Export', 'Failure');
    }
  }

  exportCSV(): void {
    if (this.JourneyData && this.JourneyData.length > 0) {
      const header =
        [
          'OrderID',
          'OrderStatus',
          'ShipmentStatus',
          'EventDateTime',
          'isWebhookSent',
        ].join(',') + '\n';

      const rows = this.JourneyData.map((row: any) => {
        const orderStatus = row.orderStatus || '';
        const shipmentStatus = row.shipmentStatus || '';
        const eventDateTime = row.eventDateTime || '';
        const isWebhookSent = row.isWebhookSent === '1' ? 'Sent' : 'Not Sent';

        return `${this.orderID},${orderStatus},${shipmentStatus},${eventDateTime},${isWebhookSent}`;
      }).join('\n');

      const csvContent = header + rows;

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });

      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `JourneyData_${this.orderID}.csv`;

      link.click();
    } else {
      alert('No data available to export.');
    }
  }

  sendWebhook(webhookId: number) {
    const payload = {
      orderIDs: [String(webhookId)],
    };

    this.http.post(this.apiservice.CallWebhook, payload).subscribe({
      next: (res: any) => {
        this.toastr.success('Webhook sent successfully');
        this.fetchOrderJourney();
      },
      error: (err) => {
        this.toastr.error('Failed to send webhook');
        this.fetchOrderJourney();
        console.error(err);
      },
    });
  }

  copyToClipboard(text: string | number): void {
    if (!text) return;
    navigator.clipboard.writeText(text.toString()).then(() => {
      this.toastr.success('Copied to clipboard');
    });
  }
}
