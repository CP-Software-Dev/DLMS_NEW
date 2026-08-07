import {
  Component,
  EventEmitter,
  HostListener,
  Inject,
  OnInit,
  Output,
  PLATFORM_ID,
} from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';
import { filter } from 'rxjs/operators';
import { SellerService } from '../../services/seller.service';

interface SideNavToggle {
  screenWidth: number;
  collapsed: boolean;
}

@Component({
  selector: 'app-sidenav',
  templateUrl: './sidenav.component.html',
  styleUrl: './sidenav.component.css',
})
export class SidenavComponent implements OnInit {
  data: any;
  constructor(
    private router: Router,
    private sellerService: SellerService,
    @Inject(PLATFORM_ID) private platformId: Object,
  ) {
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe(() => {
        if (isPlatformBrowser(this.platformId)) {
          this.isShipmentActive =
            this.isLinkActive('admin/shipment') ||
            this.isLinkActive('admin/ndr') ||
            this.isLinkActive('admin/rto');
        }
      });
  }
  isLinkActive(url: string): boolean {
    const currentUrl = this.router.url.split('?')[0];
    return currentUrl === `/${url}` || currentUrl.startsWith(`/${url}/`);
  }

  isManageOrdersDropdownActive(): boolean {
    return (
      !this.manageOrdersClicked &&
      (this.isLinkActive('admin/nsz') ||
        this.isLinkActive('admin/branch-master') ||
        this.isLinkActive('admin/zone-master') ||
        this.isLinkActive('admin/awb-finder') ||
        this.isLinkActive('admin/pincode-master') ||
        this.isLinkActive('admin/automation-log') ||
        this.isLinkActive('admin/webhook-log') ||
        this.isLinkActive('admin/rejection-list') ||
        this.isLinkActive('admin/update-address'))
    );
  }

  isShipmentDropdownActive(): boolean {
    return (
      !this.shipmentClicked &&
      (this.isLinkActive('admin/shipment') ||
        this.isLinkActive('admin/ndr') ||
        this.isLinkActive('admin/rto'))
    );
  }
  @Output() onToggleSideNav: EventEmitter<SideNavToggle> = new EventEmitter();
  collapsed = false;
  collapsedfix = false;
  screenWidth = 0;
  shipmentClicked = false;
  manageOrdersClicked = false;
  buttonIcon: string = 'ri-arrow-down-s-line';
  managebuttonIcon: string = 'ri-arrow-down-s-line';
  isShipmentActive = false;
  isShipmentListActive = false;
  isExceptionListActive = false;

  isAdmin: boolean = false;
  isSuperAdmin: boolean = false;
  role: boolean = false;

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    if (isPlatformBrowser(this.platformId)) {
      this.screenWidth = window.innerWidth;
      if (this.screenWidth <= 768) {
        this.collapsed = false;
        this.onToggleSideNav.emit({
          collapsed: this.collapsed,
          screenWidth: this.screenWidth,
        });
      }
    }
  }

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.screenWidth = window.innerWidth;
    }

    const role = this.sellerService.getItem('role');
    if (role == '1') {
      this.isAdmin = true;
      this.isSuperAdmin = true;
    }
    if (role == '2') {
      this.isAdmin = false;
    } else {
      this.isAdmin = true;
    }

    this.onToggleSideNav.emit({
      collapsed: this.collapsed,
      screenWidth: this.screenWidth,
    });
  }

  toggleCollapse(): void {
    this.collapsedfix = !this.collapsedfix;
    this.collapsed = this.collapsedfix; // Ensure collapsed matches collapsedfix
    this.onToggleSideNav.emit({
      collapsed: this.collapsedfix,
      screenWidth: this.screenWidth,
    });
  }

  onMouseEnter() {
    if (this.collapsedfix != true) this.collapsed = true;
  }

  onMouseLeave() {
    if (this.collapsedfix != true) this.collapsed = false;
  }

  closeSidenav(): void {
    this.collapsed = false;
    this.onToggleSideNav.emit({
      collapsed: this.collapsed,
      screenWidth: this.screenWidth,
    });
  }

  toggleShipmentClicked() {
    this.shipmentClicked = !this.shipmentClicked;
    if (this.shipmentClicked) {
      this.buttonIcon = 'ri-arrow-up-s-line';
    } else {
      this.buttonIcon = 'ri-arrow-down-s-line';
    }
  }

  toggleManageOrdersClicked() {
    this.manageOrdersClicked = !this.manageOrdersClicked;
    if (this.manageOrdersClicked) {
      this.managebuttonIcon = 'ri-arrow-up-s-line';
    } else {
      this.managebuttonIcon = 'ri-arrow-down-s-line';
    }
  }

  navigateToDashboard() {
    this.router.navigate(['admin/dashboard']);
  }
  navigateToOrders() {
    this.router.navigate(['admin/orders']);
  }
  navigateToBranchOrders(path: string) {
    this.router.navigate([path]);
  }
  navigateToShipment() {
    this.router.navigate(['admin/shipment']);
  }
  navigateToException() {
    this.router.navigate(['admin/ndr']);
  }
  navigateToRTO() {
    this.router.navigate(['admin/rto']);
  }
  navigateToAllocation() {
    this.router.navigate(['admin/allocation']);
  }
  navigateToCourier() {
    this.router.navigate(['admin/couriers']);
  }
  navigateToNSZ() {
    this.router.navigate(['admin/nsz']);
  }
  navigateToPincodeMaster() {
    this.router.navigate(['admin/pincode-master']);
  }
  navigateToRemake() {
    this.router.navigate(['admin/remake']);
  }
  navigateToRejection() {
    this.router.navigate(['admin/rejection-list']);
  }
  navigateToWarehouse() {
    this.router.navigate(['admin/warehouses']);
  }
  navigateToUser() {
    this.router.navigate(['admin/users']);
  }
  navigateToWebhook() {
    this.router.navigate(['admin/webhook']);
  }
  navigateToReports() {
    this.router.navigate(['admin/reports']);
  }
  navigateToSales() {
    this.router.navigate(['admin/sales']);
  }

  navigateToBank() {
    this.router.navigate(['admin/banks']);
  }

  navigateToIssues() {
    this.router.navigate(['admin/issues']);
  }

  navigateCourierDetails() {
    this.router.navigate(['admin/bank-invoice']);
  }

  navigateToBranchMaster() {
    this.router.navigate(['admin/branch-master']);
  }

  navigateToZoneMaster() {
    this.router.navigate(['admin/zone-master']);
  }

  navigateToOldAwbFinder() {
    this.router.navigate(['admin/awb-finder']);
  }

  navigateToAutomationLog() {
    this.router.navigate(['admin/automation-log']);
  }

  navigateToWebhookLog() {
    this.router.navigate(['admin/webhook-log']);
  }

  navigateToUpdateAddress() {
    this.router.navigate(['admin/update-address']);
  }
}
