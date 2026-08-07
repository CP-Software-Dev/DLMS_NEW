import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class InstaOrdersService {
 private statusId: number | null = null;
  private pageIndex: number = 0;


  setStatusId(statusId: number | null): void {
    this.statusId = statusId;
  }

  getStatusId(): number | null {
    return this.statusId;
  }

  setPageIndex(pageIndex: number): void {
    this.pageIndex = pageIndex;
  }

  getPageIndex(): number {
    return this.pageIndex;
  }


  reset(): void {
    this.statusId = null;
    this.pageIndex = 0;
  }
  constructor() { }
}
