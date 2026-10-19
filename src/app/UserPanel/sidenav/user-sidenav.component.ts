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
  selector: 'app-user-sidenav',
  templateUrl: './user-sidenav.component.html',
  styleUrl: './user-sidenav.component.css',
})
export class UserSidenavComponent implements OnInit {
  @Output() onToggleSideNav: EventEmitter<SideNavToggle> = new EventEmitter();

  // ---------- ui state ----------
  collapsed = false;
  collapsedfix = false;
  screenWidth = 0;
  shipmentClicked = false;
  buttonIcon: string = 'ri-arrow-down-s-line';

  // ---------- role / permissions ----------
  rolenum: number = 0;
  hasOrder: boolean = false;
  hasShipments: boolean = false;
  hasNdr: boolean = false;
  hasRto: boolean = false;
  hasReports: boolean = false;

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

    if (this.rolenum === 4) {
      // Role 4 sees only what has been granted
      this.hasOrder = this.flag('hasOrder');
      this.hasShipments = this.flag('hasShipments');
      this.hasRto = this.flag('hasRto');
      this.hasNdr = this.flag('hasNdr');
      this.hasReports = this.flag('hasReports');
    } else if (this.rolenum > 0) {
      // Other known roles see everything; a missing role shows nothing
      this.hasOrder = true;
      this.hasShipments = true;
      this.hasNdr = true;
      this.hasRto = true;
      this.hasReports = true;
    }

    this.onToggleSideNav.emit({
      collapsed: this.collapsed,
      screenWidth: this.screenWidth,
    });
  }

  private flag(key: string): boolean {
    return this.sellerService.getItem(key) === '1';
  }

  // ================= active state =================
  // Matches the exact route or any child route (query string ignored)
  isLinkActive(url: string): boolean {
    const currentUrl = this.router.url.split('?')[0];
    return currentUrl === `/${url}` || currentUrl.startsWith(`/${url}/`);
  }

  isShipmentDropdownActive(): boolean {
    return (
      !this.shipmentClicked &&
      (this.isLinkActive('user/shipment') ||
        this.isLinkActive('user/ndr') ||
        this.isLinkActive('user/rto'))
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

  onMouseEnter() {
    if (!this.collapsedfix) this.collapsed = true;
  }

  onMouseLeave() {
    if (!this.collapsedfix) this.collapsed = false;
  }

  toggleCollapse(): void {
    this.collapsedfix = !this.collapsedfix;
    this.collapsed = this.collapsedfix;
    this.onToggleSideNav.emit({
      collapsed: this.collapsedfix,
      screenWidth: this.screenWidth,
    });
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
}