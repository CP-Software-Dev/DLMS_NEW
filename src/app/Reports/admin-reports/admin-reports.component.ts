import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-admin-reports',
  templateUrl: './admin-reports.component.html',
  styleUrl: './admin-reports.component.css'
})
export class AdminReportsComponent {
  activeReport: 'order' | 'shipment' = 'order';

  constructor(private router: Router) { }

  navigateToOrderReport() {
    this.activeReport = 'order';
  }

  navigateToShipmentReport() {
    this.activeReport = 'shipment';
  }

  navigateToWarehouseReport() {
    this.router.navigate(['admin/reports/warehouse']);
  }
}