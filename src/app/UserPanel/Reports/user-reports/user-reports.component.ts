import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-user-reports',
  templateUrl: './user-reports.component.html',
  styleUrl: './user-reports.component.css'
})
export class UserReportsComponent {
  activeReport: 'order' | 'shipment' = 'order';

  constructor(private router: Router) { }

  navigateToOrderReport() {
    this.activeReport = 'order';
  }

  navigateToShipmentReport() {
    this.activeReport = 'shipment';
  }

  navigateToWarehouseReport() {
    this.router.navigate(['user/reports/warehouse']);
  }
}