import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { HttpClient } from '@angular/common/http';
import { AddCourierComponent } from '../../Dialog/courier/add-courier/add-courier.component';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-new-courier',
  templateUrl: './new-courier.component.html',
  styleUrl: './new-courier.component.css'
})
export class NewCourierComponent implements OnInit {

  constructor(private router: Router ,private dailog:MatDialog, private apiservice : ApiService , private http : HttpClient) {}
courierData: any [] = [];

Couriers: any[] = [
    { id: 1, name: 'IndiaPost', email: 'john@example.com', imageUrl: 'assets/Images/Indiapost.png' , status: 1 },
    { id: 2, name: 'Bluedart', email: 'alice@example.com', imageUrl: 'assets/Images/bluedart.png' , status: 1 },
    { id: 3, name: 'Delhivery', email: 'michael@example.com', imageUrl: 'assets/Images/delhivery.png' , status: 1 },
    { id: 4, name: 'Trackon', email: 'eva@example.com', imageUrl: 'assets/Images/Trackon.png' , status: 1 },
    { id: 5, name: 'Ekart', email: 'bob@example.com', imageUrl: 'assets/Images/ekart.png' , status: 0 },
    { id: 6, name: 'DTDC', email: 'jane@example.com', imageUrl: 'assets/Images/dtdc.png' , status: 0 },
    { id: 7, name: 'XpressBees', email: 'jane@example.com', imageUrl: 'assets/Images/Xpressbees.png' , status: 0 },
    { id: 8, name: 'Ecom Express', email: 'jane@example.com', imageUrl: 'assets/Images/ecom.png' , status: 0 }
   
  ];

  ngOnInit(): void {
    this.loadCourierData();
  }

  loadCourierData()
  {
    this.http.get<any>(this.apiservice.CourierData).subscribe(response => {
      this.courierData = response.data;
    });
  }

  navigateToIntegratePage() {
    this.router.navigate(['/integrate']); 
  }
  navigateTOCourierlist() {
    this.router.navigate(['admin/couriers'])
  }

  addCourier(){
    this.dailog.open(AddCourierComponent)
  }

}
