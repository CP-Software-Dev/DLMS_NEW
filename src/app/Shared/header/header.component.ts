import { Component, Input, OnInit, PLATFORM_ID, Inject, HostListener } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { ChangePasswordComponent } from '../../change-password/change-password.component';
import { isPlatformBrowser } from '@angular/common';
import { SellerService } from '../../services/seller.service';
import { ApiService } from '../../services/api.service';
import { HttpClient, HttpParams } from '@angular/common/http';
import { RefreshService } from '../../services/refresh.service';
import { ToastrService } from 'ngx-toastr';
import { OrderStateService } from '../../services/States/Orders/order-state.service';
import { ShipmentStateService } from '../../services/States/Shipments/shipment-state.service';
import { ExceptionStateService } from '../../services/States/Exceptions/exception-state.service';
import { RtoStateService } from '../../services/States/RTO/rto-state.service';
import { NavigationEnd, ActivatedRoute } from '@angular/router';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent implements OnInit {
  pageTitle: string = 'Dashboard';
  data: any;
  username: any;
  fName: any;
  lName: any;
  FullName: any;
  role: any;
  searchtext: any;
  @Input() collapsed = false;
  @Input() screenWidth = 0;
  isDropdownOpen: boolean = false;

  constructor(@Inject(PLATFORM_ID) private platformId: Object,
    private route: ActivatedRoute,
    private toastr: ToastrService,
    private refreshservice: RefreshService,
    private http: HttpClient,
    private router: Router,
    private shipmentService : ShipmentStateService,
    private ordersService : OrderStateService,
    private exceptionService : ExceptionStateService,
    private rtoService : RtoStateService,
    private apiservice: ApiService,
    private dialog: MatDialog,
    private sellerservice: SellerService) {

    // ------- get route data for header title -----------------------
    this.setPageTitleFromRoute();
    this.router.events
      .pipe(filter((e) => e instanceof NavigationEnd))
      .subscribe(() => this.setPageTitleFromRoute());
  }

  ngOnInit(): void {
    this.username = this.sellerservice.getItem('username');
    this.fName = this.sellerservice.getItem('fName');
    this.role = this.sellerservice.getItem('role')

    if (isPlatformBrowser(this.platformId)) {
      this.data = localStorage.getItem('apitoken');
    }
    if (this.data === null || this.data === '') {

      const currentUrl = window.location.href;
      if (!currentUrl.includes('/confirm') && !currentUrl.includes('/reset')) {
        this.router.navigateByUrl('/login');
      }
    }
  }

  isNotRoleOne(): boolean {
    return this.role != 1 && this.role != 2;
}



  getHeadClass(): string {
    let styleClass = '';
    if (this.collapsed && this.screenWidth > 768) {
      styleClass = 'head-trimmed';
    }
    else {
      styleClass = 'head-md-screen';
    }
    return styleClass;
  }

  toggleDropdown(event: Event) {
    this.isDropdownOpen = !this.isDropdownOpen;
    event.stopPropagation();
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event) {
    const target = event.target as HTMLElement;
    const isInside = target.closest('.navbar-profile-icon, .dropdown-menu');
    if (!isInside) {
      this.isDropdownOpen = false;
    }
  }


  isUserPage(): boolean {
    const url = this.router.url;
    return url.includes('user') && !url.includes('userlist') && !url.includes('user-dialog');
  }


  chnagePassword() {
    const username = localStorage.getItem('username');
    this.dialog.open(ChangePasswordComponent);
  }

  logout() {
    localStorage.clear();
    this.shipmentService.reset();
    this.ordersService.reset();
    this.exceptionService.reset();
    this.rtoService.reset();
    this.router.navigate(['/login']).then(() => {
      this.collapsed = false;
      
    });
  }

  options: string[] = ['AWB', 'Phone', 'Kit'];
  selectedOption: string = 'AWB';

  selectOption(option: string) {
    this.selectedOption = option;
  }

  searchOrder(searchData: string) {
    if (searchData) {
      this.checkOrderExists(searchData).subscribe(
        (res: any) => {
          if (res.status && res.data.orders.length > 0) {
            if (this.selectedOption == 'AWB') {
              if (this.role == '1' || this.role == '2') {
                this.router.navigate(['admin/status', searchData])
              }
              else {
                this.router.navigate(['user/status', searchData])
              }

            }
            else {
              if (this.role == '1' || this.role == '2') {
                this.router.navigate(['/admin/orders/details', searchData]);
              }
              else {
                this.router.navigate(['/user/orders/details', searchData]);
              }

            }
            // this.refreshservice.triggerRefresh();
          } else {
            this.toastr.error('No such data found');
          }
        },
        (error) => {
          if (this.selectedOption == 'AWB') {
            this.toastr.error('No such AWB Present', 'Failure');
          }
          else if (this.selectedOption == 'Phone') {
            this.toastr.error('No such Phone No. Present', 'Failure');
          }
          else if (this.selectedOption == 'Kit') {
            this.toastr.error('No such Kit Number Present', 'Failure');
          }

        }
      );
    } else {
      this.toastr.error('Nothing to search.', 'Failure');
    }
  }


  checkOrderExists(orderID: string) {
    let params = new HttpParams().set('uid', orderID);
    return this.http.get(this.apiservice.OrderDetails, { params });
  }


  // ------- get route data for header title -----------------------
  private setPageTitleFromRoute(): void {
    let child = this.route.root.firstChild;
    while (child?.firstChild) {
      child = child.firstChild;
    }

    const titleFromData = child?.snapshot.data?.['title'];
    if (titleFromData) {
      this.pageTitle = titleFromData;
      return;
    }

    // Fallback: no data.title set on the route yet — derive from the URL
    const segments = this.router.url.split('?')[0].split('/').filter(Boolean);
    const last = segments[segments.length - 1] || 'dashboard';
    this.pageTitle = last.charAt(0).toUpperCase() + last.slice(1);
  }
}