import { Component, OnInit, Inject } from '@angular/core';
import { trigger, state, transition, style, animate } from '@angular/animations';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { ApiService } from '../../services/api.service';
import { RefreshService } from '../../services/refresh.service';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { SellerService } from '../../services/seller.service';

@Component({
  selector: 'app-salesperson-dialog',
  templateUrl: './salesperson-dialog.component.html',
  styleUrl: './salesperson-dialog.component.css',
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
export class SalespersonDialogComponent implements OnInit {

  Name: string = '';
  contact: string = '';
  email: string = '';
  fName: any;
  lName: any;
  FullName: any;
  id: any;


  ngOnInit(): void {
    this.FullName = this.sellerservice.getItem('username');
  }

  constructor(private apiservice: ApiService,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private refreshservice: RefreshService,
    private http: HttpClient,
    private sellerservice: SellerService,
    private toastr: ToastrService,
    private dialogRef: MatDialogRef<SalespersonDialogComponent>) {
    if (data) {
      this.id = data.id;
      this.Name = data.name;
      this.email = data.email || '';
      this.contact = data.contact || '';
    }
  }

  invalidInput: boolean = false;
  invalidemail: boolean = false;
  invalidphone: boolean = false;
  invalidsubmit: boolean = false;
  invalidname: boolean = false;


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

  allowOnlyNumeric(event: KeyboardEvent): void {
    const charCode = event.key.charCodeAt(0);
    // Check if the character is an alphabet, number, space, or underscore
    if (
      !(
        (charCode >= 48 && charCode <= 57) 
      )
    ) {
      event.preventDefault(); // Prevent the key press
    }
  }

  closeDialog() {
    this.dialogRef.close();
  }

  user(): void {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phonePattern = /^\d{10}$/;
    const namePattern = /^[A-Za-z\s]+$/;

    const firstname = (document.getElementById('fname') as HTMLInputElement);
    const email = (document.getElementById('email') as HTMLInputElement);
    const phonenum = (document.getElementById('phone') as HTMLInputElement);
    const inputs = [firstname, email, phonenum];

    inputs.forEach(input => {

      if (input.value.trim() === '') {
        input.classList.add('empty-input');
      }
      else {
        input.classList.remove('empty-input');
      }
    });

    this.invalidemail = false;
    this.invalidphone = false;
    this.invalidsubmit = false;
    this.invalidname = false;

    if (!emailPattern.test(email.value)) {
      this.invalidemail = true;
    }
    if (!phonePattern.test(phonenum.value)) {
      this.invalidphone = true;
    }
    if(!namePattern.test(firstname.value)) {
      this.invalidname = true;
    }

    if (!this.invalidsubmit && !this.invalidemail && !this.invalidphone && !this.invalidname) {
      const full_name = this.Name;
      const email = this.email;
      const contact = this.contact;

      if (!this.data) {
        const requestBody = {
          name: full_name,
          contact: contact,
          email: email
        };
        this.http.post(this.apiservice.AddSalesPerson, requestBody).subscribe((res: any) => {
          if (res.status) {
            this.toastr.success('Sales Person Added.', 'Success');
            this.refreshservice.triggerRefresh();
            this.closeDialog();
          }
          else {
            this.toastr.error('Failed to add sales person. Please try again.', 'Failure');
          }
        },
          error => {
            this.toastr.error(error.message, 'Failure');
          })
      }
      else {
        const requestBody1 = {
          id:this.id,
          name: full_name,
          contact: contact,
          email: email,
        };
        this.http.put(`${this.apiservice.EditSalesPerson}/${this.id}`, requestBody1)
          .subscribe(
            (res: any) => {
              if (res.status) {
                this.toastr.success('Changes made Successfully.', 'Success');
                this.refreshservice.triggerRefresh();
                this.closeDialog();
              } else {
                this.toastr.error('Failed to update details. Please try again.', 'Failure');
              }
            },
            error => {
              this.toastr.error(error.message, 'Failure');
            }
          );
      }

    }
  }

}
