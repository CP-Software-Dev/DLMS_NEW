import { Component, OnInit, ViewChild } from "@angular/core";
import { UserShipmentComponent } from "../shipment/user-shipment.component";
import { UserInstaShipmentsComponent } from "../user-insta-shipments/user-insta-shipments.component";

@Component({
  selector: "app-user-shipments-container",
  templateUrl: "./user-shipments-container.component.html",
  styleUrl: "./user-shipments-container.component.css",
})
export class UserShipmentsContainerComponent implements OnInit {
  activeTab: string = "perso";
  serviceType: number = 0;
  buttonText: string = "Filters";
  buttonIcon: string = "ri-filter-fill";

  @ViewChild("persoShipments", { static: false })
  persoShipments!: UserShipmentComponent;

  @ViewChild("instaShipments", { static: false })
  instaShipments!: UserInstaShipmentsComponent;

  ngOnInit(): void {
    this.serviceType = Number(localStorage.getItem("serviceType"));
    const savedTab = localStorage.getItem("activeUserShipmentsTab");
    if (savedTab) {
      this.activeTab = savedTab;
    } else {
      if (this.serviceType === 3) {
        this.activeTab = "insta";
      }
      if (this.serviceType === 1 || this.serviceType === 2) {
        this.activeTab = "perso";
      }
    }
    this.loadOrders();
  }

  setTab(tab: string) {
    this.activeTab = tab;
    localStorage.setItem("activeUserShipmentsTab", tab);
    this.loadOrders();
  }

  loadOrders() {
    if (this.activeTab === "insta") {
      console.log("Load Insta Orders API");
    }

    if (this.activeTab === "perso") {
      console.log("Load Perso Orders API");
    }
  }

  persoExportToCSV() {
    if (this.persoShipments) {
      this.persoShipments.exportToCSV();
    }
  }

  instaExportToCSV() {
    if (this.instaShipments) {
      this.instaShipments.exportToCSV();
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
}
