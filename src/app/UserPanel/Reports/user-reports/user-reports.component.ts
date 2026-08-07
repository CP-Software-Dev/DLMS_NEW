import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-user-reports',
  templateUrl: './user-reports.component.html',
  styleUrl: './user-reports.component.css'
})
export class UserReportsComponent {
  constructor(private router: Router) { }

  navigateToOrderReport() {
    this.router.navigate(['user/reports/order']);
  }

  navigateToShipmentReport() {
    this.router.navigate(['user/reports/shipments']);
  }

  navigateToWarehouseReport() {
    this.router.navigate(['user/reports/warehouse']);
  }
}
