import { Component } from '@angular/core';
import { Route, Router } from '@angular/router';
@Component({
  selector: 'app-ndrsettings',
  templateUrl: './ndrsettings.component.html',
  styleUrl: './ndrsettings.component.css'
})
export class NdrsettingsComponent {
 
  constructor(private router : Router){}

  navigateToException() {
    this.router.navigate(['admin/ndr'])
  } 
  navigateToAddSettings() {
    this.router.navigate(['/admin/ndr/add_settings']);
  }
}
