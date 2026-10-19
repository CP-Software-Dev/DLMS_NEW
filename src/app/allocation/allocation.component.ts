import { Component } from '@angular/core';

@Component({
  selector: 'app-allocation',
  templateUrl: './allocation.component.html',
  styleUrl: './allocation.component.css'
})
export class AllocationComponent {
  showAddRuleModal: boolean = false;

  addNewRules(): void {
    this.showAddRuleModal = true;
  }

  onModalClosed(): void {
    this.showAddRuleModal = false;
  }
}