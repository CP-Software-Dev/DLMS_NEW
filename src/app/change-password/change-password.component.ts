import { Component, OnInit } from '@angular/core';
import {MatDialogRef } from '@angular/material/dialog';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { ChangePasswordModal } from '../modals/changepasswordmodal';
import { ToastrService } from 'ngx-toastr';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { ApiService } from '../services/api.service';
declare var bootstrap: any;

@Component({
  selector: 'app-change-passowrd',
  templateUrl: './change-password.component.html',
  styleUrl: './change-password.component.css',
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
export class ChangePasswordComponent implements OnInit {

  changepassmodal:ChangePasswordModal;
  passwordsMatch:boolean=true;
  passwordErrorMessage: string = '';

  ngOnInit(): void {
    var tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'))
    var tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl) {
      return new bootstrap.Tooltip(tooltipTriggerEl)
    })
  }

  constructor(private apiservice : ApiService, private router:Router,private http:HttpClient,private toastr:ToastrService,private dialogRef: MatDialogRef<ChangePasswordComponent>)
  {
    this.changepassmodal = new ChangePasswordModal();

    const username = localStorage.getItem('username');
    if (username !== null)
    {
      this.changepassmodal.username = username;
    }
    else
    {
         
    }
  }
  
  closeDialog() {
    this.dialogRef.close();
  }

  changePassword()
  {
    this.checkPasswords();
    const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[\W_])(?!.*\s).{8,}$/;
    if (!this.passwordsMatch) {
      this.passwordErrorMessage = 'Passwords mismatch';
      return;
    }

    if (!passwordPattern.test(this.changepassmodal.newPassword)) {
      //this.passwordErrorMessage = 'Password is too weak , Create a strong one.';
      this.toastr.error('Password is too weak , Create a strong one.' , 'Invalid Password')
      return;
    }

    this.http.put(this.apiservice.ChangePassword,this.changepassmodal).subscribe((res:any)=>
      {
        if(res.status)
        {
          this.toastr.success('Password Changed Successfully. Please Login','Success');
          this.dialogRef.close();
          localStorage.clear();
          this.router.navigateByUrl('/login')
        }
        else
        {
          this.toastr.error(res.errors,'Failure');
        }
      })
  }

  checkPasswords() {
    this.passwordsMatch = this.changepassmodal.newPassword === this.changepassmodal.confirmPassword;
    if (this.passwordsMatch) {
      this.passwordErrorMessage = '';
    }
  }
}
