import { Component } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-admin-reports',
  templateUrl: './admin-reports.component.html',
  styleUrl: './admin-reports.component.css'
})
export class AdminReportsComponent {
  constructor(private router: Router) { }

  navigateToOrderReport() {
    this.router.navigate(['/admin/reports/orders']);
  }

  navigateToShipmentReport() {
    this.router.navigate(['admin/reports/shipments']);
  }

  navigateToWarehouseReport() {
    this.router.navigate(['admin/reports/warehouse']);
  }
}
