import { Component, EventEmitter, HostListener,Output,Inject, PLATFORM_ID, OnInit } from '@angular/core';
import { animate, keyframes, style, transition, trigger } from '@angular/animations';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { isPlatformBrowser } from '@angular/common';
import { SellerService } from '../../services/seller.service';
import { BlobOptions } from 'buffer';

interface SideNavToggle {
  screenWidth: number;
  collapsed: boolean;
}

@Component({
  selector: 'app-user-sidenav',
  templateUrl: './user-sidenav.component.html',
  styleUrl: './user-sidenav.component.css'
})
export class UserSidenavComponent {
  @Output() onToggleSideNav: EventEmitter<SideNavToggle> = new EventEmitter();
  collapsed = false;
  screenWidth = 0;
  collapsedfix = false;
  shipmentClicked = false;
  buttonIcon: string = 'ri-arrow-down-s-line';
  isShipmentActive = false;
  isShipmentListActive = false;
  isExceptionListActive = false;

  hasOrder: boolean = false;
  hasShipments: boolean = false;
  hasNdr: boolean = false;
  hasRto: boolean = false;
  hasReports: boolean = false;
  role: boolean = false;
  rolenum: number = 0;



  constructor(private router:Router,@Inject(PLATFORM_ID) private platformId: Object , private sellerService: SellerService)
  {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      if (isPlatformBrowser(this.platformId)) {
        this.isShipmentActive = this.isLinkActive('user/shipment') || this.isLinkActive('user/ndr')|| this.isLinkActive('user/rto');
      }
    });
  }

  isLinkActive(url: string): boolean {
    return this.router.url.includes(url);
  }
  isShipmentDropdownActive(): boolean {
    return !this.shipmentClicked && (this.isLinkActive('user/shipment') || this.isLinkActive('user/ndr') || this.isLinkActive('user/rto'));
  }
  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    if (isPlatformBrowser(this.platformId)) {
      this.screenWidth = window.innerWidth;
      if (this.screenWidth <= 768) {
        this.collapsed = false;
        this.onToggleSideNav.emit({ collapsed: this.collapsed, screenWidth: this.screenWidth });
      }
    }
  }

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)){
      this.screenWidth = window.innerWidth;
    }

    const role = this.sellerService.getItem('role');
    this.rolenum = Number(role);
    if(role == '4')
    {
      const hasOrderValue = this.sellerService.getItem('hasOrder');
      this.hasOrder = hasOrderValue === '1';
  
      const hasShipmentValue = this.sellerService.getItem('hasShipments');
      this.hasShipments = hasShipmentValue === '1';

      const hasRtoValue = this.sellerService.getItem('hasRto');
      this.hasRto = hasRtoValue === '1';

      const hasNdrValue = this.sellerService.getItem('hasNdr');
      this.hasNdr = hasNdrValue === '1';
  
      const hasReportsValue = this.sellerService.getItem('hasReports');
      this.hasReports = hasReportsValue === '1';

    }
    else{
      this.hasOrder = true;
      this.hasReports = true;
      this.hasShipments = true;
      this.hasNdr = true;
      this.hasRto = true;
    }

    this.onToggleSideNav.emit({ collapsed: this.collapsed, screenWidth: this.screenWidth });
  }

  onMouseEnter() {
    if(this.collapsedfix!=true)
      this.collapsed = true; 
  }

  onMouseLeave() {

    if(this.collapsedfix!=true)
      this.collapsed = false;
  }

  toggleCollapse(): void {
    this.collapsedfix = !this.collapsedfix;
    this.collapsed = this.collapsedfix; // Ensure collapsed matches collapsedfix
    this.onToggleSideNav.emit({collapsed: this.collapsedfix, screenWidth: this.screenWidth});
  }

  closeSidenav(): void {
    this.collapsed = false;
    this.onToggleSideNav.emit({collapsed: this.collapsed, screenWidth: this.screenWidth});
  }

  toggleShipmentClicked() {
    this.shipmentClicked = !this.shipmentClicked;
    if (this.shipmentClicked) {
      
      this.buttonIcon = 'ri-arrow-up-s-line';
  } else {
      this.buttonIcon = 'ri-arrow-down-s-line';
  }
}

toUserDashboard() {
  this.router.navigate(['user/dashboard']);
}
toUserOrders() {
  this.router.navigate(['user/orders']);
}
toUserShipments() {
  this.router.navigate(['user/shipment']);
}
toUserNDR() {
  this.router.navigate(['user/ndr']);
}
toUserReports() {
  this.router.navigate(['user/reports']);
}

toUserRTO(){
  this.router.navigate(['user/rto/orders'])
}

toEmployee(){
  this.router.navigate(['user/employees'])
}

toCouriers(){
  this.router.navigate(['user/couriers'])
}

toIssues(){
  this.router.navigate(['user/issues'])
}
}
