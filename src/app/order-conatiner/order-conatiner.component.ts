import { Component, OnInit, ViewChild } from "@angular/core";
import { OrderUploadComponent } from "../Dialog/order-upload/order-upload.component";
import { MatDialog } from "@angular/material/dialog";
import { Router } from "@angular/router";
import { OrdersComponent } from "../orders/orders.component";
import { InstaOrdersComponent } from "../insta-orders/insta-orders.component";
import { RemakeFileUploadComponent } from "../Dialog/remake-file-upload/remake-file-upload.component";

@Component({
  selector: "app-order-conatiner",
  templateUrl: "./order-conatiner.component.html",
  styleUrl: "./order-conatiner.component.css",
})
export class OrderConatinerComponent implements OnInit {
  activeTab: string = "perso";
  serviceType: number = 0;
  buttonText: string = "Filters";
  buttonIcon: string = "ri-filter-fill";

  showPersoFilters: boolean = false;
  @ViewChild("persoOrders", { static: false })
  persoOrders!: OrdersComponent;

  @ViewChild("instaOrders", { static: false })
  instaOrders!: InstaOrdersComponent;
  isExporting: boolean = false;
  isExportingInsta: boolean = false;

  constructor(private dialog: MatDialog, private router: Router) {}

  ngOnInit(): void {
    this.serviceType = Number(localStorage.getItem("serviceType"));

    const savedTab = localStorage.getItem("activeOrderTab");
    // if (this.serviceType === 2) {
    //   this.activeTab = "insta";
    // }

    // if (this.serviceType === 1 || this.serviceType === 3) {
    //   this.activeTab = "perso";
    // }

    if (savedTab) {
      this.activeTab = savedTab;
    } else {
      // fallback logic (your existing logic)
      if (this.serviceType === 2) {
        this.activeTab = "insta";
      }

      if (this.serviceType === 1 || this.serviceType === 3) {
        this.activeTab = "perso";
      }
    }

    this.loadOrders();
  }

  setTab(tab: string) {
    this.activeTab = tab;
    localStorage.setItem("activeOrderTab", tab);
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

  openDialog(): void {
    this.dialog.open(OrderUploadComponent, {
      panelClass: "rounded-dialog",
    });
  }

  // persoExportToCSV() {
  //   if (this.persoOrders) {
  //     this.isExporting = true;
  //     this.persoOrders.exportToCSV();
  //     this.isExporting = false;
  //   }
  // }

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

  navigateToImportList() {
    this.router.navigate(["admin/orders/list"]);
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

  openRemakeDialog(): void {
    this.dialog.open(RemakeFileUploadComponent, {
      panelClass: "rounded-dialog",
    });
  }
}
