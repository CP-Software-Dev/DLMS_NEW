import {
  Component,
  EventEmitter,
  HostListener,
  Inject,
  OnInit,
  Output,
  PLATFORM_ID,
} from '@angular/core';
import { Router } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';
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
  @Output() onToggleSideNav: EventEmitter<SideNavToggle> = new EventEmitter();

  // ---------- role / view ----------
  // 1 = Super Admin, 2 = Admin, 3 = Client, 4 = Client User
  rolenum = 0;
  hasValidRole = false;
  isAdminView = false; // roles 1 and 2 use the admin side
  basePath: 'admin' | 'user' = 'user';
  isAdmin = false; // every valid role except 2
  isSuperAdmin = false; // role 1

  private readonly permissionRoles: number[] = [4];

  permissions = {
    orders: true,
    shipments: true,
    ndr: true,
    rto: true,
    reports: true,
  };

  // ---------- ui state ----------
  collapsed = false;
  collapsedfix = false;
  screenWidth = 0;
  shipmentClicked = false;
  manageOrdersClicked = false;
  accessClicked = false;
  integrationsClicked = false;
  buttonIcon: string = 'ri-arrow-down-s-line';
  managebuttonIcon: string = 'ri-arrow-down-s-line';
  accessButtonIcon: string = 'ri-arrow-down-s-line';
  integrationsButtonIcon: string = 'ri-arrow-down-s-line';

  constructor(
    private router: Router,
    private sellerService: SellerService,
    @Inject(PLATFORM_ID) private platformId: Object,
  ) {}

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.screenWidth = window.innerWidth;
    }

    this.rolenum = Number(this.sellerService.getItem('role'));
    this.hasValidRole = [1, 2, 3, 4].includes(this.rolenum);
    this.isAdminView = this.rolenum === 1 || this.rolenum === 2;
    this.basePath = this.isAdminView ? 'admin' : 'user';
    this.isAdmin = this.hasValidRole && this.rolenum !== 2;
    this.isSuperAdmin = this.rolenum === 1;

    this.loadPermissions();

    this.onToggleSideNav.emit({
      collapsed: this.collapsed,
      screenWidth: this.screenWidth,
    });
  }

  // ================= permissions =================
  private loadPermissions(): void {
    if (!this.permissionRoles.includes(this.rolenum)) return;

    const flag = (key: string) => this.sellerService.getItem(key) === '1';
    this.permissions = {
      orders: flag('hasOrder'),
      shipments: flag('hasShipments'),
      ndr: flag('hasNdr'),
      rto: flag('hasRto'),
      reports: flag('hasReports'),
    };
  }

  // Admin side, excluding role 2 (Allocation, Integrations, Access, ...)
  get isFullAdmin(): boolean {
    return this.isAdminView && this.isAdmin;
  }

  // Users List page: admin/users on the admin side, user/employees for banks
  get usersPage(): string {
    return this.isAdminView ? 'users' : 'employees';
  }

  // ================= active state =================
  // Matches the exact route or any child route (query string ignored)
  isLinkActive(url: string): boolean {
    const currentUrl = this.router.url.split('?')[0];
    return currentUrl === `/${url}` || currentUrl.startsWith(`/${url}/`);
  }

  // isActive('orders') -> admin/orders or user/orders
  isActive(page: string): boolean {
    return this.isLinkActive(`${this.basePath}/${page}`);
  }

  isShipmentDropdownActive(): boolean {
    return (
      !this.shipmentClicked &&
      (this.isActive('shipment') || this.isActive('ndr') || this.isActive('rto'))
    );
  }

  isManageOrdersDropdownActive(): boolean {
    return (
      !this.manageOrdersClicked &&
      (this.isLinkActive('admin/nsz') ||
        this.isLinkActive('admin/remake') ||
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

  isAccessDropdownActive(): boolean {
    return (
      !this.accessClicked &&
      (this.isActive(this.usersPage) ||
        this.isActive('roles') ||
        this.isActive('audit-log') ||
        this.isActive('system-settings'))
    );
  }

  isIntegrationsDropdownActive(): boolean {
    return (
      !this.integrationsClicked &&
      (this.isActive('webhook') ||
        this.isActive('awb-series') ||
        this.isActive('status-mapping') ||
        this.isActive('error-codes') ||
        this.isActive('sftp-sources'))
    );
  }

  // ================= layout =================
  @HostListener('window:resize')
  onResize() {
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

  toggleCollapse(): void {
    this.collapsedfix = !this.collapsedfix;
    this.collapsed = this.collapsedfix;
    this.onToggleSideNav.emit({
      collapsed: this.collapsedfix,
      screenWidth: this.screenWidth,
    });
  }

  onMouseEnter() {
    if (!this.collapsedfix) this.collapsed = true;
  }

  onMouseLeave() {
    if (!this.collapsedfix) this.collapsed = false;
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
    this.buttonIcon = this.shipmentClicked
      ? 'ri-arrow-up-s-line'
      : 'ri-arrow-down-s-line';
  }

  toggleManageOrdersClicked() {
    this.manageOrdersClicked = !this.manageOrdersClicked;
    this.managebuttonIcon = this.manageOrdersClicked
      ? 'ri-arrow-up-s-line'
      : 'ri-arrow-down-s-line';
  }

  toggleAccessClicked() {
    this.accessClicked = !this.accessClicked;
    this.accessButtonIcon = this.accessClicked
      ? 'ri-arrow-up-s-line'
      : 'ri-arrow-down-s-line';
  }

  toggleIntegrationsClicked() {
    this.integrationsClicked = !this.integrationsClicked;
    this.integrationsButtonIcon = this.integrationsClicked
      ? 'ri-arrow-up-s-line'
      : 'ri-arrow-down-s-line';
  }

  // ================= navigation =================
  // goTo('orders') -> admin/orders or user/orders depending on role
  goTo(page: string): void {
    this.router.navigate([`${this.basePath}/${page}`]);
  }

  // RTO routes differ per side: admin/rto and user/rto/orders
  goToRto(): void {
    this.router.navigate([this.isAdminView ? 'admin/rto' : 'user/rto/orders']);
  }
}