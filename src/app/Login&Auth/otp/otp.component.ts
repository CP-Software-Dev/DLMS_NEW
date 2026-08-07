import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-otp',
  templateUrl: './otp.component.html',
  styleUrl: './otp.component.css'
})
export class OtpComponent {
  invalidCredentials: boolean = false;

    constructor(private router: Router) {}

    otp() {
        const otpInput = (document.getElementById('otp') as HTMLInputElement);

        const otp = otpInput.value;

        const numberPattern = /^\d+$/;

        otpInput.style.borderColor = '';

        if (!otp.trim() || !numberPattern.test(otp)) {
            otpInput.style.borderColor = 'red';
            this.invalidCredentials = true;
        } else {

            if (parseInt(otp, 10) === 123456) { 
                this.router.navigateByUrl('/reset');
            } else {
                this.invalidCredentials = true;
            }
        }
    }
}
