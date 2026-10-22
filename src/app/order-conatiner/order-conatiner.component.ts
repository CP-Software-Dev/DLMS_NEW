import { Component, OnInit, ViewChild } from '@angular/core';
import { OrderUploadComponent } from '../Dialog/order-upload/order-upload.component';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { OrdersComponent } from '../orders/orders.component';
import { InstaOrdersComponent } from '../insta-orders/insta-orders.component';
import { RemakeFileUploadComponent } from '../Dialog/remake-file-upload/remake-file-upload.component';
import { SellerService } from '../services/seller.service';

@Component({
  selector: 'app-order-conatiner',
  templateUrl: './order-conatiner.component.html',
  styleUrl: './order-conatiner.component.css',
})
export class OrderConatinerComponent implements OnInit {
  // ---------- role / permission ----------
  rolenum = 0;
  isAdminView = false; // role 1, 2 => admin side (upload / import list / remake)
  canViewOrders = true; // role 4 ke liye hasOrder flag, baaki roles ke liye true

  // ---------- tabs ----------
  activeTab: string = 'perso';
  serviceType: number = 0;
  buttonText: string = 'Filters';
  buttonIcon: string = 'ri-filter-fill';

  showPersoFilters: boolean = false;
  @ViewChild('persoOrders', { static: false })
  persoOrders!: OrdersComponent;

  @ViewChild('instaOrders', { static: false })
  instaOrders!: InstaOrdersComponent;
  isExporting: boolean = false;
  isExportingInsta: boolean = false;

  constructor(
    private dialog: MatDialog,
    private router: Router,
    private sellerService: SellerService,
  ) {}

  ngOnInit(): void {
    this.rolenum = Number(this.sellerService.getItem('role'));
    this.isAdminView = this.rolenum === 1 || this.rolenum === 2;
    this.canViewOrders =
      this.rolenum !== 4 || this.sellerService.getItem('hasOrder') === '1';

    this.serviceType = Number(this.sellerService.getItem('serviceType'));
    this.activeTab = this.resolveInitialTab();

    this.loadOrders();
  }

  // serviceType 1 => dono tabs, saved tab chalega
  // serviceType 2 => sirf perso | serviceType 3 => sirf insta  (user container + dashboard wala mapping)
  private resolveInitialTab(): string {
    if (this.serviceType === 1) {
      const savedTab = localStorage.getItem('activeOrderTab');
      return savedTab === 'insta' || savedTab === 'perso' ? savedTab : 'perso';
    }
    return this.serviceType === 3 ? 'insta' : 'perso';
  }

  setTab(tab: string) {
    // tab switch sirf tab allowed hai jab dono services hain
    if (this.serviceType !== 1) return;
    this.activeTab = tab;
    localStorage.setItem('activeOrderTab', tab);
    this.loadOrders();
  }

  loadOrders() {
    if (this.activeTab === 'insta') {
      console.log('Load Insta Orders API');
    }

    if (this.activeTab === 'perso') {
      console.log('Load Perso Orders API');
    }
  }

  // ================= admin only actions =================
  openDialog(): void {
    if (!this.isAdminView) return;
    this.dialog.open(OrderUploadComponent, {
      position: { right: '1%', top: '1%' },
      height: '95vh',
      maxHeight: '100vh',
      width: '640px',
      maxWidth: '640px',
      panelClass: 'right-slide-panel',
      backdropClass: 'remake-blur-backdrop',
      hasBackdrop: true,
    });
  }

  openRemakeDialog(): void {
    if (!this.isAdminView) return;
    this.dialog.open(RemakeFileUploadComponent, {
      position: { right: '1%', top: '1%' },
      height: '95vh',
      maxHeight: '100vh',
      width: '700px',
      maxWidth: '700px',
      panelClass: 'right-slide-panel',
      backdropClass: 'remake-blur-backdrop',
      hasBackdrop: true,
    });
  }

  navigateToImportList() {
    if (!this.isAdminView) return;
    this.router.navigate(['admin/orders/list']);
  }

  // ================= export (admin + user dono) =================
  async persoExportToCSV() {
    if (this.persoOrders) {
      this.isExporting = true;

      try {
        await this.persoOrders.exportToCSV();
      } catch (error) {
        console.error(error);
      } finally {
        this.isExporting = false;
      }
    }
  }

  async instaExportToCSV() {
    if (this.instaOrders) {
      this.isExportingInsta = true;
      try {
        await this.instaOrders.exportToCSV();
      } catch (error) {
        console.error(error);
      } finally {
        this.isExportingInsta = false;
      }
    }
  }

  toggleFiltersForm() {}

  onInstaFilters() {
    if (this.instaOrders) {
      this.instaOrders.toggleFiltersForm();
    }
  }

  onPersoFilters() {
    if (this.persoOrders) {
      this.persoOrders.toggleFiltersForm();
    }
  }
}