import { Component } from '@angular/core';
import { Router } from '@angular/router';
@Component({
  selector: 'app-ndrnew',
  templateUrl: './ndrnew.component.html',
  styleUrl: './ndrnew.component.css'
})
export class NdrnewComponent {

    constructor( private router : Router) { }

  submitForm(){

    
  const couriername = (document.getElementById('courierName') as HTMLSelectElement);
  const emailcount = (document.getElementById('emailcount') as HTMLInputElement);
  const timings = (document.getElementById('timings') as HTMLInputElement);
  const sendToEmail = (document.getElementById('sendToEmail') as HTMLInputElement);
  const ccEmail = (document.getElementById('ccEmail') as HTMLInputElement);
  const status = (document.getElementById('status') as HTMLSelectElement);
  const inputs = [couriername, emailcount, timings, sendToEmail, ccEmail, status];



  inputs.forEach(input => {
    if (input.tagName.toLowerCase() === 'select') {
        if (input.value === 'Select Option' || input.value === 'Select Courier') {
            input.classList.add('empty-input');
        } else {
            input.classList.remove('empty-input');
        }
    } else if (input.id === 'timings') { // Check for time input
        const timeRegex = /^(0?[1-9]|1[0-2]):[0-5][0-9]$/; // Regular expression for 12-hour time format
        if (!timeRegex.test(input.value.trim())) {
            input.classList.add('empty-input');
        } else {
            input.classList.remove('empty-input');
        }
    } else {
        if (input.value.trim() === '') {
            input.classList.add('empty-input');
        } else {
            input.classList.remove('empty-input');
        }
    }
});

  }

  navigateToSettings() {
    this.router.navigate(['/admin/ndr/settings']);
  }
}
