import { Component, OnInit } from '@angular/core';
import { ApiService } from '../services/api.service';
import { HttpClient, HttpParams } from '@angular/common/http';
import { ToastrService } from 'ngx-toastr';
import { Prioritymodal } from '../modals/courierPrioritymodal';
import { Router } from '@angular/router';
import { EditpriorityComponent } from '../Dialog/editpriority/editpriority.component';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-allocation-shippingrules',
  templateUrl: './allocation-shippingrules.component.html',
  styleUrl: './allocation-shippingrules.component.css'
})
export class AllocationShippingrulesComponent implements OnInit {

  priorityObj: Prioritymodal = new Prioritymodal()
  constructor(private apiservice: ApiService,
    private router: Router,
    private dialog: MatDialog,
    private http: HttpClient, private toastr: ToastrService) {

    this.priorityObj = new Prioritymodal();
  }
  cardCount: number = 1; // Initial card count
  sellerId: string = '';
  institutionID: string = '';
  name: string = '';
  firstPriority: string = '';
  secondPriority: string = '';
  thirdPriority: string = '';
  sellerData: any[] = [];
  courierData: any[] = [];
  courierPriority: any[] = [];
  priority: { isActive: string; id: number } = { isActive: 'Inactive', id: 0 };
  selectedCouriers: any[] = [];


  ngOnInit(): void {
    this.GetSeller();
    this.GetCourier();
    this.GetPriority();
  }

  onPriorityStatusChange(event: Event, priorityId: number): void {
    const inputElement = event.target as HTMLInputElement;
    this.priority.isActive = inputElement.checked ? 'Active' : 'Inactive';
    this.handlePriorityChange(priorityId);
  }


  handlePriorityChange(priorityId: number): void {
    console.log(`Priority ID: ${priorityId}`);

  }


  onBankChange(event: Event): void {
    const selectedBankId = (event.target as HTMLSelectElement).value;
    this.GetPriority(selectedBankId);
  }

  GetPriority(bankID?: string): void {
    let params = new HttpParams();

    if (bankID) {
      params = params.set('institutionId', Number(bankID));
    }

    this.http.get<any>(this.apiservice.CourierPriority, { params }).subscribe(res => {
      this.courierPriority = res.data;
    });
  }


  GetSeller(): void {
    this.http.get<any>(this.apiservice.SellerData).subscribe(response => {
      this.sellerData = response.data;
    });
  }

  GetCourier(): void {
    this.http.get<any>(this.apiservice.CourierData).subscribe(response => {
      this.courierData = response.data;
    })

  }

  saveReport() {

    if (!this.name || !this.sellerId || !this.firstPriority || !this.secondPriority || !this.thirdPriority) {
      this.toastr.error('Please fill in all required fields.', 'Validation Error');
      return;
    }

    debugger;
    this.priorityObj.name = this.name;
    this.priorityObj.institutionId = Number(this.sellerId);
    this.priorityObj.firstPriority = Number(this.firstPriority);
    this.priorityObj.secondPriority = Number(this.secondPriority);
    this.priorityObj.thirdPriority = Number(this.thirdPriority);

    this.http.post(this.apiservice.CourierPriority, this.priorityObj).subscribe((res: any) => {
      if (res.status) {
        this.toastr.success('Courier Priority Updated.')
        window.location.reload();
      }
      else {
        this.toastr.error(res.errors, 'Failure');
      }
    })

  }


  onEditPriority(priority:any): void {

    const dialogData = {
      id : priority.id,
      name: priority.name,
      institution: priority.institution,
      firstPriority: priority.firstPriority,
      secondPriority : priority.secondPriority,
      thirdPriority: priority.thirdPriority
    };

    this.dialog.open(EditpriorityComponent, {
      data: dialogData
    });
  }

}
