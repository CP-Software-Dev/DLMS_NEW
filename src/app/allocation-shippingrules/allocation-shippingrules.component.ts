import {
  Component,
  OnInit,
  OnChanges,
  SimpleChanges,
  Input,
  Output,
  EventEmitter,
  ViewChild,
  TemplateRef,
} from '@angular/core';
import { ApiService } from '../services/api.service';
import { HttpClient, HttpParams } from '@angular/common/http';
import { ToastrService } from 'ngx-toastr';
import { Prioritymodal } from '../modals/courierPrioritymodal';
import { Router } from '@angular/router';
import { EditpriorityComponent } from '../Dialog/editpriority/editpriority.component';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-allocation-shippingrules',
  templateUrl: './allocation-shippingrules.component.html',
  styleUrl: './allocation-shippingrules.component.css',
})
export class AllocationShippingrulesComponent implements OnInit, OnChanges {
  @Input() showAddModal: boolean = false;
  @Output() modalClosed = new EventEmitter<void>();

  @ViewChild('addRuleTpl', { static: true }) addRuleTpl!: TemplateRef<any>;
  private addDialogRef?: MatDialogRef<any>;

  priorityObj: Prioritymodal = new Prioritymodal();

  cardCount: number = 1;
  sellerId: string = '';
  institutionID: string = '';
  name: string = '';
  firstPriority: string = '';
  secondPriority: string = '';
  thirdPriority: string = '';
  sellerData: any[] = [];
  courierData: any[] = [];
  courierPriority: any[] = [];
  priority: { isActive: string; id: number } = { isActive: 'Inactive', id: 0 };
  selectedCouriers: any[] = [];
  selectedBankId: string = '';

  constructor(
    private apiservice: ApiService,
    private router: Router,
    private dialog: MatDialog,
    private http: HttpClient,
    private toastr: ToastrService,
  ) {
    this.priorityObj = new Prioritymodal();
  }

  ngOnInit(): void {
    this.GetSeller();
    this.GetCourier();
    this.GetPriority();
  }

  // Parent ka flag true hote hi popup khulega
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['showAddModal'] && this.showAddModal) {
      this.openAddDialog();
    }
  }

  openAddDialog(): void {
    this.addDialogRef = this.dialog.open(this.addRuleTpl, {
      width: '600px',
      maxWidth: '100vw',
      height: 'calc(100vh - 32px)',
      maxHeight: 'calc(100vh - 32px)',
      position: { right: '16px', top: '16px' },
      panelClass: 'side-drawer',
      autoFocus: false,
    });

    this.addDialogRef.afterClosed().subscribe(() => {
      this.resetForm();
      this.modalClosed.emit();
    });
  }

  closeModal(): void {
    this.addDialogRef?.close();
  }

  onPriorityStatusChange(event: Event, priorityId: number): void {
    const inputElement = event.target as HTMLInputElement;
    this.priority.isActive = inputElement.checked ? 'Active' : 'Inactive';
    this.handlePriorityChange(priorityId);
  }

  handlePriorityChange(priorityId: number): void {
    console.log(`Priority ID: ${priorityId}`);
  }

  onBankChange(event: Event): void {
    this.selectedBankId = (event.target as HTMLSelectElement).value;
    this.GetPriority(this.selectedBankId);
  }

  GetPriority(bankID?: string): void {
    let params = new HttpParams();

    if (bankID) {
      params = params.set('institutionId', Number(bankID));
    }

    this.http
      .get<any>(this.apiservice.CourierPriority, { params })
      .subscribe((res) => {
        this.courierPriority = res.data;
      });
  }

  GetSeller(): void {
    this.http.get<any>(this.apiservice.SellerData).subscribe((response) => {
      this.sellerData = response.data;
    });
  }

  GetCourier(): void {
    this.http.get<any>(this.apiservice.CourierData).subscribe((response) => {
      this.courierData = response.data;
    });
  }

  saveReport(): void {
    if (
      !this.name ||
      !this.sellerId ||
      !this.firstPriority ||
      !this.secondPriority ||
      !this.thirdPriority
    ) {
      this.toastr.error(
        'Please fill in all required fields.',
        'Validation Error',
      );
      return;
    }

    this.priorityObj.name = this.name;
    this.priorityObj.institutionId = Number(this.sellerId);
    this.priorityObj.firstPriority = Number(this.firstPriority);
    this.priorityObj.secondPriority = Number(this.secondPriority);
    this.priorityObj.thirdPriority = Number(this.thirdPriority);

    this.http
      .post(this.apiservice.CourierPriority, this.priorityObj)
      .subscribe((res: any) => {
        if (res.status) {
          this.toastr.success('Courier Priority Updated.');
          this.closeModal();
          this.GetPriority(this.selectedBankId);
        } else {
          this.toastr.error(res.errors, 'Failure');
        }
      });
  }

  resetForm(): void {
    this.name = '';
    this.sellerId = '';
    this.firstPriority = '';
    this.secondPriority = '';
    this.thirdPriority = '';
  }

  onEditPriority(priority: any): void {
    const dialogData = {
      id: priority.id,
      name: priority.name,
      institution: priority.institution,
      firstPriority: priority.firstPriority,
      secondPriority: priority.secondPriority,
      thirdPriority: priority.thirdPriority,
    };

    const dialogRef = this.dialog.open(EditpriorityComponent, {
      data: dialogData,
      width: '600px',
      maxWidth: '100vw',
      height: 'calc(100vh - 32px)',
      maxHeight: 'calc(100vh - 32px)',
      position: { right: '16px', top: '16px' },
      panelClass: 'side-drawer',
      autoFocus: false,
    });

    dialogRef.afterClosed().subscribe(() => {
      this.GetPriority(this.selectedBankId);
    });
  }
}
