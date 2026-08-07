import {
  trigger,
  state,
  style,
  transition,
  animate,
} from '@angular/animations';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { BulkShipmodal } from '../../modals/bulkshipmodel';
import { ToastrService } from 'ngx-toastr';
import { ApiService } from '../../services/api.service';
import { RefreshService } from '../../services/refresh.service';
import { WebhookService } from '../../services/webhook.service';
import { WebhookCallmodal } from '../../modals/webhookCall';
import { error } from 'console';

@Component({
  selector: 'app-bulkship',
  templateUrl: './bulkship.component.html',
  styleUrl: './bulkship.component.css',
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
export class BulkshipComponent {
  bulkshipObj: BulkShipmodal = new BulkShipmodal();
  callwebhookObj: WebhookCallmodal = new WebhookCallmodal();
  constructor(
    private apiservice: ApiService,
    private toastr: ToastrService,
    private dialogRef: MatDialogRef<BulkshipComponent>,
    private http: HttpClient,
    private refreshservice: RefreshService,
    private webhookService: WebhookService,
    @Inject(MAT_DIALOG_DATA)
    public data: { orderDetails: { orderID: string; status: string }[] },
  ) { }

  selectedTab: string = 'Manual';
  warehouseID: number = 0;
  isLoading: boolean = false;

  onTabChange(tab: string) {
    this.selectedTab = tab;
  }

  orders: any[] = [];
  warehouses: any[] = [];
  courierData: any[] = [];
  courierData1: any[] = [];
  banks: any[] = [];
  institutionID: number = 0;
  institutionID1: number = 0;

  selectedBankId: number = 0;

  ngOnInit(): void {
    //this.loadStatusdata();
    this.loadBank();
  }

  loadBank(): void {
    this.http.get(this.apiservice.BankList).subscribe(
      (res: any) => {
        if (res.status) {
          this.banks = res.data;
        } else {
        }
      },
      (error) => { },
    );
  }

  loadStatusdata(bankID: string) {
    const selectedBank = this.banks.find((bank) => bank.id == bankID);
    this.institutionID = selectedBank.id;
    const params = {
      dataCount: 100,
      page: 1,
      institutionId: this.institutionID, // replace with actual value
      type: 'pick', // replace with actual value
    };
    this.http
      .get<any>(this.apiservice.Warehouse, { params })
      .subscribe((response) => {
        debugger;
        this.warehouses = response.data.warehouses;
      });
  }

  onBankChange(event: Event): void {
    const selectedBankId = (event.target as HTMLSelectElement).value;
    this.selectedBankId = Number(selectedBankId);
    this.loadStatusdata(selectedBankId);
    this.loadCouriersForBank(selectedBankId);
  }

  loadCouriersForBank(bankID: string): void {
    const selectedBank = this.banks.find((bank) => bank.id == bankID);
    this.institutionID = selectedBank.id;
    if (selectedBank) {
      this.courierData = selectedBank.couriers.filter(
        (courier: any) => courier.isSelected === 1,
      );
    } else {
      this.courierData = [];
    }
  }

  onBankChange1(event: Event): void {
    const selectedBankId = (event.target as HTMLSelectElement).value;
    this.selectedBankId = Number(selectedBankId);
    this.loadStatusdata(selectedBankId);
    this.loadCouriersForBank1(selectedBankId);
  }

  firstPriority: string = '';
  secondPriority: string = '';
  thirdPriority: string = '';

  loadCouriersForBank1(bankID: string): void {
    const selectedBank = this.banks.find((bank) => bank.id == bankID);
    this.institutionID1 = selectedBank.id;
    if (selectedBank) {
      let params = new HttpParams().set('institutionId', Number(bankID));

      this.http
        .get(this.apiservice.CourierPriority, { params })
        .subscribe((res: any) => {
          if (res.status) {
            const activeEntry = res.data.find(
              (item: any) => item.isActive === 'Active',
            );

            console.log(activeEntry);
            if (activeEntry) {
              this.firstPriority = activeEntry.firstPriority;
              this.secondPriority = activeEntry.secondPriority;
              this.thirdPriority = activeEntry.thirdPriority;

              this.courierData1 = [
                this.firstPriority,
                this.secondPriority,
                this.thirdPriority,
              ];
              console.log('Priority data', this.courierData1);
            } else {
              this.courierData1 = [];
              this.toastr.error('Some Error Occured.');
            }
          }
        });

      //this.courierData1 = selectedBank.couriers.filter((courier: any) => courier.isSelected === 1);
    } else {
      this.courierData1 = [];
    }
  }

  closeDialog() {
    this.dialogRef.close();
  }

  manualShip() {
    this.isLoading = true;
    const hasRtoOrders = this.data.orderDetails.some(
      (detail) => detail.status === 'RTO Received',
    );
    const queryType = hasRtoOrders ? true : false;
    const queryType1 = false;

    this.bulkshipObj.institutionId = Number(this.institutionID);
    this.bulkshipObj.orderIDs = this.data.orderDetails.map((detail) =>
      String(detail.orderID),
    );
    this.bulkshipObj.warehouseID = Number(this.bulkshipObj.warehouseID); // Ensure warehouseID is a number
    this.bulkshipObj.courierID = Number(this.bulkshipObj.courierID);

    if(this.bulkshipObj.warehouseID <1){
      this.toastr.error('Please Select Warehouse', 'Failure');
      this.isLoading = false;
      return;
    }

    const url = `${this.apiservice.OrderCreation}?isPriorityShip=${queryType1}&isRTO=${queryType}`;

    debugger;
    this.http.post(url, this.bulkshipObj).subscribe((res: any) => {
      if (res.status) {
        this.toastr.info(res.data);
        this.dialogRef.close();
        //this.handleOrderDetails();
        this.refreshservice.triggerRefresh();
        this.isLoading = false;
      } else {
        this.toastr.error(res.errors, 'Failure');
        this.isLoading = false;
      }
    });
  }

  autoShip(): void {
    this.isLoading = true;
    const hasRtoOrders = this.data.orderDetails.some(
      (detail) => detail.status === 'RTO Received',
    );
    const queryType = hasRtoOrders ? true : false;
    const queryType1 = true;

    this.bulkshipObj.institutionId = Number(this.institutionID1);
    this.bulkshipObj.orderIDs = this.data.orderDetails.map((detail) =>
      String(detail.orderID),
    );
    this.bulkshipObj.warehouseID = Number(this.warehouseID); // Ensure warehouseID is a number
    this.bulkshipObj.courierID = Number(this.bulkshipObj.courierID);

    if(this.bulkshipObj.warehouseID <1){
      this.toastr.error('Please Select Warehouse', 'Failure');
      this.isLoading = false;
      return;
    }

    const url = `${this.apiservice.OrderCreation}?isPriorityShip=${queryType1}&isRTO=${queryType}`;
    this.http.post(url, this.bulkshipObj).subscribe((res: any) => {
      console.log(res);
      if (res.status) {
        this.toastr.info(res.data);
        this.dialogRef.close();
        //this.handleOrderDetails();
        this.refreshservice.triggerRefresh();
        this.isLoading = false;
      } else {
        this.toastr.error(res.errors, 'Failure');
        this.isLoading = false;
      }
    });
  }

  onManualIPAwb(): void {
    this.isLoading = true;
   
    this.bulkshipObj.institutionId = Number(this.institutionID);
    this.bulkshipObj.orderIDs = this.data.orderDetails.map((detail) =>
      String(detail.orderID),
    );
    this.bulkshipObj.warehouseID = Number(this.bulkshipObj.warehouseID); // Ensure warehouseID is a number
    this.bulkshipObj.courierID = Number(this.bulkshipObj.courierID);

     if(this.bulkshipObj.warehouseID <1){
      this.toastr.error('Please Select Warehouse', 'Failure');
      this.isLoading = false;
      return;
    }

    const url = this.apiservice.AssignManualIPawb;
    this.http.patch(url, this.bulkshipObj).subscribe((res: any) => {
      console.log(res);
      if (res.status) {
        this.toastr.info(res.data);
        this.dialogRef.close();
        //this.handleOrderDetails();
        this.refreshservice.triggerRefresh();
        this.isLoading = false;
      } else {
        this.toastr.error(res.errors, 'Failure');
        this.isLoading = false;
      }
    });
  }

  handleOrderDetails() {
    this.callwebhookObj.orderIDs = this.data.orderDetails.map((detail) =>
      String(detail.orderID),
    );

    debugger;
    this.http.post(this.apiservice.CallWebhook, this.callwebhookObj).subscribe(
      (res: any) => {
        if (res.status) {
          console.log('Webhook sent Successfully.');
        }
      },
      (error) => {
        this.toastr.error(error, 'Failure');
      },
    );
  }
}
