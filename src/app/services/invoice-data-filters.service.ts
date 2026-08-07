import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

interface StatusClickData {
  institutionName: string;
  courierName: string;
  invoicestartDate: string;
  invoiceendDate: string;
}

const LOCAL_STORAGE_KEY = 'invoiceFilterData';

@Injectable({
  providedIn: 'root'
})
export class InvoiceDataFiltersService {
private statusDataSource!: BehaviorSubject<StatusClickData | null>; // definite assignment assertion
  statusData$ = this.statusDataSource?.asObservable();

  constructor() {
    const storedData = localStorage.getItem(LOCAL_STORAGE_KEY);
    const parsedData: StatusClickData | null = storedData ? JSON.parse(storedData) : null;
    this.statusDataSource = new BehaviorSubject<StatusClickData | null>(parsedData);
    this.statusData$ = this.statusDataSource.asObservable(); // now safe to call
  }

  setStatusData(data: StatusClickData): void {
    this.statusDataSource.next(data);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data));
  }

  getStatusData(): StatusClickData | null {
    return this.statusDataSource.value;
  }

  clearStatusData(): void {
    this.statusDataSource.next(null);
    localStorage.removeItem(LOCAL_STORAGE_KEY);
  }
}
