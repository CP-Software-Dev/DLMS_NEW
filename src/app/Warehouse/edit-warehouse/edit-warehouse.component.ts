import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ApiService } from '../../services/api.service';
import { HttpClient } from '@angular/common/http';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-edit-warehouse',
  templateUrl: './edit-warehouse.component.html',
  styleUrl: './edit-warehouse.component.css',
})
export class EditWarehouseComponent implements OnInit {
  institutionId: string = '';
  warehouseId: number = 0;
  warehouseType: string = '';
  banks: any[] = [];
  selectedBankID: number | null = null;
  invalidBankSelection: boolean = false;

  warehouseObj = {
    warehouseName: '',
    uid: '',
    contactPerson: '',
    contactPersonNumber: '',
    address1: '',
    address2: '',
    address3: '',
    city: '',
    pincode: '',
  };

  userRole = [
    { id: 'pick', role: 'Pickup' },
    { id: 'rto', role: 'RTO' },
  ];

  constructor(
    private dialogRef: MatDialogRef<EditWarehouseComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private apiservice: ApiService,
    private http: HttpClient,
    private toastr: ToastrService,
  ) {
    this.dialogRef.addPanelClass('edit-side-panel');
    this.dialogRef.updateSize('min(640px, 95vw)', 'calc(100vh - 32px)');
    this.dialogRef.updatePosition({ top: '16px', right: '16px' });
  }

  ngOnInit() {
    this.fetchBanks();
  }

  onSubmit() {
    if (
      !this.warehouseObj.warehouseName ||
      !this.warehouseObj.uid ||
      !this.institutionId ||
      !this.warehouseType ||
      !this.warehouseObj.contactPerson ||
      !this.warehouseObj.contactPersonNumber ||
      !this.warehouseObj.address1 ||
      !this.warehouseObj.city ||
      !this.warehouseObj.pincode
    ) {
      alert('Please fill all required fields');
      return;
    }

    const selectedBank = this.banks.find(
      (x) => x.id == Number(this.institutionId),
    );

    const payload = {
      id: this.warehouseId,
      institutionId: Number(this.institutionId),
      institutionName: selectedBank?.name || '',
      uid: this.warehouseObj.uid,
      warehouseName: this.warehouseObj.warehouseName,
      address1: this.warehouseObj.address1,
      address2: this.warehouseObj.address2,
      address3: this.warehouseObj.address3,
      city: this.warehouseObj.city,
      pincode: Number(this.warehouseObj.pincode),
      type: this.warehouseType,
      contactPerson: this.warehouseObj.contactPerson,
      contactPersonNumber: this.warehouseObj.contactPersonNumber,
      date: new Date().toISOString(),
    };

    this.http.put(this.apiservice.UpdateWarehouse, payload).subscribe({
      next: (res: any) => {
        this.toastr.success('Warehouse Updated Successfully', 'Success');
        this.dialogRef.close(true);
      },
      error: (err) => {
        console.error(err);
        this.toastr.error('Failed to update warhouse', 'Success');
      },
    });
  }

  fetchBanks(): void {
    this.http.get(this.apiservice.BankList).subscribe((res: any) => {
      if (res.status) {
        this.banks = res.data;
        const warehouse = this.data?.warehouseData ?? history.state?.warehouse;

        if (warehouse) {
          this.warehouseId = warehouse.id;
          const selectedBank = this.banks.find(
            (bank: any) =>
              bank.name?.trim().toLowerCase() ===
              warehouse.institutionName?.trim().toLowerCase(),
          );

          if (selectedBank) {
            this.institutionId = selectedBank.id.toString();
            this.selectedBankID = selectedBank.id;
          }

          this.warehouseType = warehouse.type || '';

          this.warehouseObj = {
            warehouseName: warehouse.warehouseName || '',
            uid: warehouse.uid || '',
            contactPerson: warehouse.contactPerson || '',
            contactPersonNumber: warehouse.contactPersonNumber || '',
            address1: warehouse.address1 || '',
            address2: warehouse.address2 || '',
            address3: warehouse.address3 || '',
            city: warehouse.city || '',
            pincode: warehouse.pincode?.toString() || '',
          };
        }
      }
    });
  }

  onBankChange(bankId: number): void {
    const numericBankId = Number(bankId);
    const selectedBank = this.banks.find(
      (bank: any) => bank.id === numericBankId,
    );

    if (selectedBank) {
      this.selectedBankID = selectedBank.id;
      this.invalidBankSelection = false;
    } else {
      this.invalidBankSelection = true;
      console.error('Bank not found');
    }
  }

  close() {
    this.dialogRef.close();
  }
}