import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class VerifyService {

  private verificationData: string='';

  constructor() {}

  setVerificationData(data: string) {
    this.verificationData = data;
  }

  getVerificationData(): string {
    return this.verificationData;
  }
}
