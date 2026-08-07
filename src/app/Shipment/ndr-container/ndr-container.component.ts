import { ExceptionListComponent } from '../exception-list/exception-list.component';
import { Component, OnInit, ViewChild } from '@angular/core';
import { ShipmentListComponent } from '../shipment-list/shipment-list.component';
import { Router } from '@angular/router';
import { InstaExceptionsComponent } from '../insta-exceptions/insta-exceptions.component';

@Component({
  selector: 'app-ndr-container',
  templateUrl: './ndr-container.component.html',
  styleUrl: './ndr-container.component.css',
})
export class NdrContainerComponent implements OnInit {
  activeTab: string = 'perso';
  serviceType: number = 0;
  buttonText: string = 'Filters';
  buttonIcon: string = 'ri-filter-fill';
  isExportingPerso: boolean = false;
  isExportingInsta: boolean = false;

  @ViewChild('persoShipments', { static: false })
  persoShipments!: ExceptionListComponent;

  @ViewChild('instaShipments', { static: false })
  instaShipments!: InstaExceptionsComponent;

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.serviceType = Number(localStorage.getItem('serviceType'));
    const savedTab = localStorage.getItem('activeShipmentsTab');
    if (savedTab) {
      this.activeTab = savedTab;
    } else {
      if (this.serviceType === 2) {
        this.activeTab = 'insta';
      }
      if (this.serviceType === 1 || this.serviceType === 3) {
        this.activeTab = 'perso';
      }
    }

    this.loadOrders();
  }

    setTab(tab: string) {
    this.activeTab = tab;
    localStorage.setItem("activeShipmentsTab", tab);
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

  async instaExportToCSV() {
    if (this.instaShipments) {
      this.isExportingInsta = true;
      try {
        await this.instaShipments.exportToCSV();
      } catch (error) {
        console.error(error);
      } finally {
        this.isExportingInsta = false;
      }
    }
  }

  async persoExportToCSV() {
    if (this.persoShipments) {
      this.isExportingPerso = true;
      try {
        await this.persoShipments.exportToCSV();
      } catch (error) {
        console.error(error);
      } finally {
        this.isExportingPerso = false;
      }
    }
  }

  onInstaFilters() {
    if (this.instaShipments) {
      this.instaShipments.toggleFiltersForm();
    }
  }

  onPersoFilters() {
    if (this.persoShipments) {
      this.persoShipments.toggleFiltersForm();
    }
  }

  navigateToInstaList() {
    this.router.navigate(["admin/insta-exports"]);
  }
}
