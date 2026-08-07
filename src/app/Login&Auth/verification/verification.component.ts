import { Component, Inject, OnInit, PLATFORM_ID } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { VerifyService } from '../../services/verify.service';
import { ApiService } from '../../services/api.service';
import { isPlatformBrowser } from '@angular/common';
import { ToastrService } from 'ngx-toastr';
import { VerificationModal } from '../../modals/verificationmodal';
import { jwtDecode } from "jwt-decode";

@Component({
  selector: 'app-verification',
  templateUrl: './verification.component.html',
  styleUrl: './verification.component.css'
})
export class VerificationComponent implements OnInit {

  verificationData: string = '';
  otp: string = ''
  verifyObj: VerificationModal;
  constructor(private verifyService: VerifyService,
    @Inject(PLATFORM_ID) private platformId: Object,
    private apiService: ApiService,
    private router: Router,
    private toastr: ToastrService,
    private http: HttpClient
  ) {
    this.verifyObj = new VerificationModal()
  }

  ngOnInit(): void {
    this.verificationData = this.verifyService.getVerificationData();
    this.login();

  }

  login(): void {
    this.verifyObj.username = this.verificationData;
    this.verifyObj.otp = this.otp.toString();
    this.http.post(this.apiService.GenerateToken, this.verifyObj).subscribe((res: any) => {
      if (res.status) {
        if (isPlatformBrowser(this.platformId)) {
          localStorage.setItem('apitoken', res.data.token);
          const decodedToken: any = jwtDecode(res.data.token);
          const username = decodedToken.unique_name;
          const role = decodedToken.role;
          const fName = decodedToken.family_name;
          localStorage.setItem('username', username);
          localStorage.setItem('role',role);
          localStorage.setItem('seller', res.data.institutionId);
          localStorage.setItem('fName', fName);
          localStorage.setItem('serviceType', res.data.activePlan);
          //localStorage.setItem('lName', res.data.lastName);
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

      }
    }, error => {
    });
  }
}
