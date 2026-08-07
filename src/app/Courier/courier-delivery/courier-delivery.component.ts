import { Component } from '@angular/core';

@Component({
  selector: 'app-courier-delivery',
  templateUrl: './courier-delivery.component.html',
  styleUrl: './courier-delivery.component.css'
})
export class CourierDeliveryComponent {

  onSubmit()
  {
    const cname = (document.getElementById('courier-name') as HTMLInputElement);
    const akey = (document.getElementById('api-key') as HTMLInputElement);
    const stage = (document.getElementById('stage') as HTMLSelectElement);
    const status = (document.getElementById('status') as HTMLSelectElement);
    const inputs = [cname, akey, stage, status];

    inputs.forEach(input => {
      if (input.tagName.toLowerCase() === 'select') {
          if (input.value === 'Select Stages' || input.value === 'Select Status') {
              input.classList.add('empty-input');
          } else {
              input.classList.remove('empty-input');
          }
      }  else {
          if (input.value.trim() === '') {
              input.classList.add('empty-input');
          } else {
              input.classList.remove('empty-input');
          }
      }
  });
  }
}
