import { Component } from '@angular/core';

@Component({
  selector: 'app-integrate',
  templateUrl: './integrate.component.html',
  styleUrl: './integrate.component.css'
})
export class IntegrateComponent {

  onsubmit() {
    const cname = (document.getElementById('courier-name') as HTMLInputElement);
    const apikey = (document.getElementById('api-id') as HTMLInputElement);
    const apipass = (document.getElementById('api-password') as HTMLInputElement);
    const stage = (document.getElementById('stage') as HTMLSelectElement);
    const status = (document.getElementById('status') as HTMLSelectElement);
    const inputs = [cname, apikey, apipass, stage, status];

    inputs.forEach(input => {
      if (input.tagName.toLowerCase() === 'select') {
        if (input.value === 'Select Stages' || input.value === 'Select Status') {
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

}
