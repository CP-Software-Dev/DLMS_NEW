import { Component, OnInit } from '@angular/core';
import { trigger, state, transition, style, animate } from '@angular/animations';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { Registermodal } from '../modals/registermodal';
import { ApiService } from '../services/api.service';
import { SellerService } from '../services/seller.service';
import { RefreshService } from '../services/refresh.service';

@Component({
  selector: 'app-user-dialog',
  templateUrl: './user-dialog.component.html',
  styleUrl: './user-dialog.component.css',
  animations: [
    trigger('fadeSlideInOut', [
      state('void', style({
        opacity: 0,
        transform: 'translateY(-50%)'
      })),
      transition('void => *', [
        animate('700ms ease', style({
          opacity: 1,
          transform: 'translateY(0)'
        }))
      ]),
      transition('* => void', [
        animate('300ms ease', style({
          opacity: 0,
          transform: 'translateY(-50%)'
        }))
      ])
    ])
  ]
})
export class UserDialogComponent implements OnInit {

  roleId: string = "";
  institutionId: string = "";

  userRole = [
    { id: 2, role: 'Admin (For Colorplast)' },
    { id: 3, role: 'Primary (For Banks)' },
  ];    


  banks: any[] = [];
  selectedSalesPersonName: string | null = null;
  selectedBankID: number | null = null;
  selectedCouriers: any[] = [];
  registerObj: Registermodal;
  invalidBankSelection: boolean = false; 
  constructor(private apiservice: ApiService,
    private http: HttpClient,
    private dialog: MatDialog,
    private router: Router,
    private refreshservice: RefreshService,
    private sellerservice: SellerService,
    private toastr: ToastrService,
    private dialogRef: MatDialogRef<UserDialogComponent>) {
    this.registerObj = new Registermodal();
  }

  ngOnInit(): void {
    this.fetchBanks();
  }

  allowOnlyNumeric(event: KeyboardEvent): void {
    const charCode = event.key.charCodeAt(0);
    if (
      !(
        (charCode >= 48 && charCode <= 57)
      )
    ) {
      event.preventDefault(); // Prevent the key press
    }
  }

  allowOnlyAlphanumeric(event: KeyboardEvent): void {
    const charCode = event.key.charCodeAt(0);
    // Check if the character is an alphabet, number, space, or underscore
    if (
      !(
        (charCode >= 65 && charCode <= 90) || // Uppercase A-Z
        (charCode >= 97 && charCode <= 122) || // Lowercase a-z
        charCode === 32 // Space
      )
    ) {
      event.preventDefault(); // Prevent the key press
    }
  }

  fetchBanks(): void {

    this.http.get(this.apiservice.BankList).subscribe((res: any) => {
      if (res.status) {
        this.banks = res.data;
      }
      else {

      }
    }, error => {

    });
  }

  onBankChange(bankId: number): void {
    const numericBankId = Number(bankId);
    const selectedBank = this.banks.find((bank: any) => bank.id === numericBankId);

    if (selectedBank) {
      this.selectedBankID = selectedBank.id;
      this.selectedSalesPersonName = selectedBank.salesPersonName;
      this.selectedCouriers = selectedBank.couriers.filter((courier: any) => courier.isSelected === 1);
      this.invalidBankSelection = false;
    } else {
      this.invalidBankSelection = true;
      console.error('Bank not found');
    }
  }



  closeDialog() {
    this.dialogRef.close();
  }



  invalidInput: boolean = false;

  validateInput() {
    const regex = /^[a-z][a-z0-9]*$/;
    this.invalidInput = !regex.test(this.registerObj.username);
  }

  invalidemail: boolean = false;
  invalidphone: boolean = false;
  invaliduser: boolean = false;
  invalidpassword: boolean = false;

  
isSaving: boolean = false;

  user() {

     if (this.isSaving) return;

     this.isSaving = true;
    // const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@.,]+$/;
    // const phonePattern = /^\d{10}$/;
    const userPattern = /^[a-z0-9]+$/;
    const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[\W_])(?!.*\s).{8,}$/;

    const firstname = (document.getElementById('fname') as HTMLInputElement);
    const lastname = (document.getElementById('lname') as HTMLInputElement);
    const email = (document.getElementById('email') as HTMLInputElement);
    const phonenum = (document.getElementById('phone') as HTMLInputElement);
    const usercode = (document.getElementById('usercode') as HTMLInputElement);
    const companyname = (document.getElementById('company') as HTMLInputElement);
    // const checkbox = (document.getElementById('CheckboxId') as HTMLInputElement);
    const inputs = [firstname, lastname, email, phonenum, usercode, companyname];

    inputs.forEach(input => {

      if (input.value.trim() === '') {
        input.classList.add('empty-input');
      }
      else {
        input.classList.remove('empty-input');
      }
    });
    if (!this.selectedBankID) {
      this.invalidBankSelection = true;
    } else {
      this.invalidBankSelection = false;
    }


    this.invalidemail = false;
    this.invalidphone = false;
    this.invaliduser = false;
    this.invalidpassword = false;
    // this.invalidsubmit = false;

    if (!emailPattern.test(email.value)) {
      this.invalidemail = true;
    }
    if (phonenum.value.length<10)
    {
      this.invalidphone = true;
    }
    if (!userPattern.test(usercode.value)) {
      this.invaliduser = true;
    }
    this.registerObj.roleId = Number(this.roleId);
    this.registerObj.institutionId = Number(this.institutionId);
    this.registerObj.password = 'User@123';

    if (!this.invalidemail && !this.invalidphone && !this.invaliduser && !this.invalidBankSelection) {
      this.http.post(this.apiservice.CreateUser, this.registerObj).subscribe((res: any) => {
        if (res.status) {
          this.toastr.success('Verification mail sent to your email address.', 'Success');
          this.refreshservice.triggerRefresh();
          this.closeDialog();
          this.isSaving = false;
        }
        else {
          this.toastr.error('Failed to Register.', 'Failure');
          this.isSaving = false;
        }
      })
    }
  }
}