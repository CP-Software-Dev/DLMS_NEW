import { Component } from '@angular/core';
import { Router } from '@angular/router';


@Component({
  selector: 'app-edit-courier',
  templateUrl: './edit-courier.component.html',
  styleUrl: './edit-courier.component.css'
})
export class EditCourierComponent {
  activeTab: string = 'Delivery';
  constructor(private router: Router) {}

  navigateToNewCourier() {
    this.router.navigate(['/newcourier']);
}
}
