import { Component, OnInit } from '@angular/core';
import { trigger, state, transition, style, animate } from '@angular/animations';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { ApiService } from '../../services/api.service';
import { EmployeeModal } from '../../modals/employeemodal';
import { SellerService } from '../../services/seller.service';

declare var bootstrap: any;

@Component({
  selector: 'app-add-employee',
  templateUrl: './add-employee.component.html',
  styleUrl: './add-employee.component.css',
  animations: [
    trigger('fadeSlideInOut', [
      state('void', style({
        opacity: 0,
        transform: 'translateX(100%)'
      })),
      transition('void => *', [
        animate('350ms ease-out', style({
          opacity: 1,
          transform: 'translateX(0)'
        }))
      ]),
      transition('* => void', [
        animate('250ms ease-in', style({
          opacity: 0,
          transform: 'translateX(100%)'
        }))
      ])
    ])
  ]
})
export class AddEmployeeComponent implements OnInit {

  seller: any;
  bankName: string = '';
  username: any;
  formSubmitted: boolean = false;
  constructor(private apiservice : ApiService,
     private sellerService : SellerService , private http:HttpClient,private dialog: MatDialog,private router:Router,private toastr:ToastrService ,private dialogRef: MatDialogRef<AddEmployeeComponent>)
  {
    this.newUserObj = new EmployeeModal();
  }
  newUserObj: EmployeeModal;

  ngOnInit(): void {
    this.seller = this.sellerService.getItem('seller');
    this.username = this.sellerService.getItem('username');
    console.log(this.seller);

    var tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'))
    var tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl) {
      return new bootstrap.Tooltip(tooltipTriggerEl)
    })
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
  
  closeDialog() {
    this.dialogRef.close();
  }

  invalidInput: boolean = false;

  validateInput() {
    const regex = /^[a-z0-9]+$/;
    this.invalidInput = !regex.test(this.newUserObj.username);
  }
 
  invalidemail: boolean = false;
  invalidphone: boolean = false;
  invaliduser: boolean = false;

  resetEmailValidation() {
    this.invalidemail = false;
  }

  resetPhoneValidation() {
    this.invalidphone = false;
  }

  resetUserValidation() {
    this.invaliduser = false;
  }


  updatePermission(permission: keyof EmployeeModal, isChecked: boolean) {
    (this.newUserObj as any)[permission] = isChecked ? 1 : 0;
}

 
  user(){
    this.formSubmitted = true;
    //const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@.,]+$/;
    const phonePattern = /^\d{10}$/;
    const userPattern = /^[a-z0-9]+$/;
 
    const firstname = (document.getElementById('fname') as HTMLInputElement);
    const lastname = (document.getElementById('lname') as HTMLInputElement);
    const email = (document.getElementById('email') as HTMLInputElement);
    const password = (document.getElementById('password') as HTMLInputElement);
    const phonenum = (document.getElementById('phone') as HTMLInputElement);
    const usercode = (document.getElementById('usercode') as HTMLInputElement);
    const inputs = [firstname, lastname, email, password, phonenum, usercode];

    this.invalidemail = false;
    this.invalidphone = false;
    this.invaliduser = false;
 
    if (!emailPattern.test(email.value)) {
      this.invalidemail = true;
    }
    if (phonenum.value.length<10) {
      this.invalidphone = true;
    }
    if (!userPattern.test(usercode.value))
      {
        this.invaliduser = true;
      }

    if(!this.invalidemail && !this.invalidphone && !this.invaliduser)
    {
      this.newUserObj.institutionId = Number(this.seller);
      this.newUserObj.createdBy = this.username;
      this.newUserObj.password = 'User@1234';
      this.http.post(this.apiservice.CreateUser , this.newUserObj).subscribe((res:any)=>{
        if(res.status)
        {
          this.toastr.success('Verification mail sent to your email address.','Success');
          this.closeDialog();
        }
        else
        {
          this.toastr.error('Failed to Create User.' , 'Failure');
        }
      },error=>
      {
        this.toastr.error(error , 'Failure');
      })
    }
  }
}