import { Component, HostListener } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-warehouse-report',
  templateUrl: './warehouse-report.component.html',
  styleUrl: './warehouse-report.component.css'
})
export class WarehouseReportComponent {
 
  statuses: string[] = ['Open', 'Done', 'In Progress', 'To Verify', 'On Hold'];
  warehouseCheckboxes = [
    { id: 'WarehouseName', label: 'Warehouse Name', checked: false },
    { id: 'WarehouseAddress', label: 'Warehouse Address', checked: false },
    { id: 'WarehousePhone', label: 'Warehouse Phone', checked: false },
    { id: 'WarehouseCity', label: 'Warehouse City', checked: false },
    { id: 'WarehouseState', label: 'Warehouse State', checked: false },
    { id: 'WarehousePincode', label: 'Warehouse Pincode', checked: false },
  ];


  selectAllWarehouseChecked: boolean = false;
  selectedStatuses: string[] = [];
  filteredStatuses: string[] = this.statuses;
  searchText: string = '';
  dropdownOpen: boolean = false;
  allSelected: boolean = false;
  selectAllShipmentChecked: boolean = false;
  constructor(private router: Router) {}

  dateRange = new FormGroup({
    start: new FormControl(),
    end: new FormControl()
  });
  
  selectedReportType: string='';
  onReportTypeChange(event: Event): void {
    const inputElement = event.target as HTMLInputElement;
    this.selectedReportType = inputElement.value;
  }
  toggleDropdown() {
    this.dropdownOpen = !this.dropdownOpen;
    if (!this.dropdownOpen) {
      this.selectedStatuses = []; // Clear selected statuses when closing dropdown
    }
  }

  filterStatuses() {
    this.filteredStatuses = this.statuses.filter(status => 
      status.toLowerCase().includes(this.searchText.toLowerCase())
    );
  }

  toggleSelection(status: string) {
    const index = this.selectedStatuses.indexOf(status);
    if (index === -1) {
      this.selectedStatuses.push(status);
    } else {
      this.selectedStatuses.splice(index, 1);
    }
    this.allSelected = this.selectedStatuses.length === this.statuses.length;
  }

  toggleSelectAll(event: Event) {
    const isChecked = (event.target as HTMLInputElement).checked;
    if (isChecked) {
      this.selectedStatuses = [...this.statuses];
    } else {
      this.selectedStatuses = [];
    }
    this.allSelected = isChecked;
  }

  @HostListener('document:click', ['$event'])
  onClick(event: MouseEvent) {
    if (!this.isClickInsideDropdown(event)) {
      this.dropdownOpen = false; // Close dropdown if clicked outside
    }
  }

  private isClickInsideDropdown(event: MouseEvent): boolean {
    // Check if the click event is inside the dropdown
    const dropdownElement = document.getElementById('statusFilterDropdown');
    if (dropdownElement && dropdownElement.contains(event.target as Node)) {
      return true;
    }
    return false;
  }

  selectAllWarehouseCheckboxChanged() {
    this.warehouseCheckboxes.forEach(checkbox => {
      checkbox.checked = this.selectAllWarehouseChecked;
    });
  }

  checkboxChanged() {
    this.selectAllWarehouseChecked = this.warehouseCheckboxes.every(checkbox => checkbox.checked);
  }

  navigatetoReports() {
    this.router.navigate(['/admin/reports']);
  }
}
