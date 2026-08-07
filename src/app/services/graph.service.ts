import { Injectable } from "@angular/core";
import { BehaviorSubject } from "rxjs";
import { Subject } from "rxjs";

@Injectable({
  providedIn: "root",
})
export class GraphService {
  private sellerIdSource = new BehaviorSubject<number>(0); // Default to 0 or some valid initial value
  currentSellerId = this.sellerIdSource.asObservable();

  private startDateSource = new BehaviorSubject<string>("");
  currentStartDate = this.startDateSource.asObservable();

  private endDateSource = new BehaviorSubject<string>("");
  currentEndDate = this.endDateSource.asObservable();

  private fileTypeSource = new BehaviorSubject<number>(2);
  currentFileType = this.fileTypeSource.asObservable();

  setSellerId(sellerId: number): void {
    this.sellerIdSource.next(sellerId);
  }

  setStartDate(startDate: string): void {
    this.startDateSource.next(startDate);
  }

  setEndDate(endDate: string): void {
    this.endDateSource.next(endDate);
  }

  setFileType(fileType: number): void {
    this.fileTypeSource.next(fileType);
  }

  constructor() {}
}
