import { Component, OnInit, ViewChild } from "@angular/core";
import { UserOrdersComponent } from "../orders/user-orders.component";
import { Router } from "@angular/router";
import { MatDialog } from "@angular/material/dialog";
import { UserInstaOrdersComponent } from "../user-insta-orders/user-insta-orders.component";

@Component({
  selector: "app-user-order-container",
  templateUrl: "./user-order-container.component.html",
  styleUrl: "./user-order-container.component.css",
})
export class UserOrderContainerComponent implements OnInit {
  activeTab: string = "perso";
  serviceType: number = 0;
  buttonText: string = "Filters";
  buttonIcon: string = "ri-filter-fill";

  showPersoFilters: boolean = false;
  @ViewChild("persoOrders", { static: false })
  persoOrders!: UserOrdersComponent;

  @ViewChild("instaOrders", { static: false })
  instaOrders!: UserInstaOrdersComponent;

  constructor(private dialog: MatDialog, private router: Router) {}

  ngOnInit(): void {
    this.serviceType = Number(localStorage.getItem("serviceType"));
    debugger;
    const savedTab = localStorage.getItem("activeUserOrderTab");
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
    localStorage.setItem("activeUserOrderTab", tab);
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
    if (this.persoOrders) {
      this.persoOrders.exportToCSV();
    }
  }

  instaExportToCSV() {
    if (this.instaOrders) {
      this.instaOrders.exportToCSV();
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
