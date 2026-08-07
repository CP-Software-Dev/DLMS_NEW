import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { ToastrService } from 'ngx-toastr';
import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
declare var bootstrap: any;

@Component({
  selector: 'app-reset',
  templateUrl: './reset.component.html',
  styleUrl: './reset.component.css'
})
export class ResetComponent {

  newpassword: string = '';
  confirmpassword: string = '';
  username: string = '';
  otp: string = '';

  constructor(private router: Router,
    private route: ActivatedRoute,
    private apiservice: ApiService,
    private http: HttpClient,
    private toastr: ToastrService) { }

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      this.username = params['username'];
      this.otp = params['otp'];
    });

    var tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'))
    var tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl) {
      return new bootstrap.Tooltip(tooltipTriggerEl)
    })
  }

  reset() {
    let params = new HttpParams()
    .set('username',this.username)
    .set('otp', this.otp)
    .set('newPassword',this.confirmpassword);
    const password1 = this.newpassword.trim();
    const password2 = this.confirmpassword.trim();

    if(password1 == password2)
      {
        this.http.post(this.apiservice.UpdatePassword , {}, {params})
        .subscribe((res: any) => {
          if (res.status) {
            this.toastr.success('Password Changed.', 'Success');
            this.router.navigate(['login']);
          }
          else {
            this.toastr.error(res.errors, 'Failure');
            this.router.navigate(['login']);
          }
        })
      }

      else{
        this.toastr.error('Password Mismatch.' , 'Failure');
      }
  }
}
