import { HttpClient } from '@angular/common/http';
import { Component, HostListener } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Loginmodal } from '../../modals/loginmodel';
import { ToastrService } from 'ngx-toastr';
import { SellerService } from '../../services/seller.service';
import { ApiService } from '../../services/api.service';
import { Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { error } from 'console';
import { VerifyService } from '../../services/verify.service';
import { jwtDecode } from "jwt-decode";
import { decode } from 'punycode';


@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  invalidCredentials: boolean = false;
  loginObj: Loginmodal;

  constructor(@Inject(PLATFORM_ID) private platformId: Object,
    private apiService: ApiService, private router: Router,
    private http: HttpClient, private toastr: ToastrService,
    private sellerService: SellerService, private verifyService: VerifyService) {
    this.loginObj = new Loginmodal();
  }

  login() {
    if (isPlatformBrowser(this.platformId)) {
      const emailInput = (document.getElementById('email') as HTMLInputElement);
      const passwordInput = (document.getElementById('password') as HTMLInputElement);
  
      const email = emailInput.value;
      const password = passwordInput.value;
      emailInput.style.borderColor = '';
      passwordInput.style.borderColor = '';

      if (!email.trim() || !password.trim()) {
        if (!email.trim()) {
          emailInput.style.borderColor = 'red';
        }
        if (!password.trim()) {
          passwordInput.style.borderColor = 'red';
        }
      }

      else {
        this.http.post(this.apiService.GenerateOtp, this.loginObj).subscribe((res: any) => {
          if (res.status) {
            if (res.data.token != null) {
              if (isPlatformBrowser(this.platformId)) {
                localStorage.setItem('apitoken', res.data.token);
                const decodedToken: any = jwtDecode(res.data.token);
                const expiryTime = decodedToken.exp * 1000;
                const username = decodedToken.unique_name;
                const role = decodedToken.role;
                const fName = decodedToken.family_name;
                const currentTime = Date.now();
                const timeUntilExpiryMs = expiryTime - currentTime;
                const timeUntilExpiryMinutes = timeUntilExpiryMs / 60000;

                localStorage.setItem('username', username);
                localStorage.setItem('role', role);
                localStorage.setItem('seller', res.data.institutionId);
                localStorage.setItem('fName', fName);
                localStorage.setItem('serviceType', res.data.activePlan);
                //localStorage.setItem('lName', res.data.lastName);
                setTimeout(() => {
                  this.logout();
                }, timeUntilExpiryMs);
                if (role == 1)
                  this.router.navigateByUrl('/admin/dashboard');
                else if (role == 2) {
                  const hasOrdersPermission = res.data.permissions.find((permission: any) => permission.name === 'HasOrders');
                  const hasShipmentsPermission = res.data.permissions.find((permission: any) => permission.name === 'HasShipment');
                  const hasReportsPermission = res.data.permissions.find((permission: any) => permission.name === 'HasReports');
                  localStorage.setItem('hasOrder', hasOrdersPermission.hasPermission.toString());
                  localStorage.setItem('hasShipments', hasShipmentsPermission.hasPermission.toString());
                  localStorage.setItem('hasReports', hasReportsPermission.hasPermission.toString());
                  this.router.navigateByUrl('/admin/dashboard');
                }
                else if (role == 4) {
                  const hasOrdersPermission = res.data.permissions.find((permission: any) => permission.name === 'HasOrders');
                  const hasShipmentsPermission = res.data.permissions.find((permission: any) => permission.name === 'HasShipment');
                  const hasNdrPermission = res.data.permissions.find((permission: any) => permission.name === 'HasNdr');
                  const hasRtoPermission = res.data.permissions.find((permission: any) => permission.name === 'HasRto');
                  const hasReportsPermission = res.data.permissions.find((permission: any) => permission.name === 'HasReports');
                  localStorage.setItem('hasOrder', hasOrdersPermission.hasPermission.toString());
                  localStorage.setItem('hasShipments', hasShipmentsPermission.hasPermission.toString());
                  localStorage.setItem('hasNdr', hasNdrPermission.hasPermission.toString());
                  localStorage.setItem('hasRto', hasRtoPermission.hasPermission.toString());
                  localStorage.setItem('hasReports', hasReportsPermission.hasPermission.toString());
                  this.router.navigateByUrl('/user/dashboard');
                }
                else
                  this.router.navigateByUrl('/user/dashboard');
              } else {
                console.error('localStorage is not available on this platform.');
                this.toastr.error('')
              }
            }
            else {
              this.verifyService.setVerificationData(res.data);
              this.router.navigate(['verification']);
            }
          }
          else {

            this.invalidCredentials = true;
          }
        }, error => {
          this.invalidCredentials = true;
        });

      }
    }
    else {
      console.error('localStorage is not available on this platform.');
    }

  }
  logout() {
    localStorage.clear();
    this.router.navigateByUrl('/login');
    this.toastr.info('Session expired. You have been logged out.');
  }
  // @HostListener('document:keydown.enter')
  // handleEnterKey(event: KeyboardEvent) {
  //   const emailInput = (document.getElementById('email') as HTMLInputElement);
  //   const passwordInput = (document.getElementById('password') as HTMLInputElement);


  //   if (event.target && (event.target as HTMLElement).id === 'email') {
  //     const email = emailInput.value;

  //     passwordInput.focus();
  //   } else if (event.target && (event.target as HTMLElement).id === 'password') {

  //     this.login();
  //   }
  //   else if (event.target && (event.target as HTMLElement).id === 'loginbutton') {
  //     event.preventDefault();
  //     this.login();
  //   }
  // }

  toreset(): void {
    this.router.navigate(['reset']);
  }

}
