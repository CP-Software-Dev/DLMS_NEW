import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class RefreshService {
  private refreshNeeded$ = new Subject<void>();

  get refreshNeeded() {
    return this.refreshNeeded$.asObservable();
  }

  triggerRefresh() {
    this.refreshNeeded$.next();
  }
  constructor() { }
}
