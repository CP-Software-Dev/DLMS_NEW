import { Component } from '@angular/core';

@Component({
  selector: 'app-courier-settings',
  templateUrl: './courier-settings.component.html',
  styleUrl: './courier-settings.component.css'
})
export class CourierSettingsComponent {

  onSubmit(){

    const length = (document.getElementById('length') as HTMLInputElement);
    const breadth = (document.getElementById('breadth') as HTMLInputElement);
    const weight = (document.getElementById('weight') as HTMLInputElement);
    const height = (document.getElementById('height') as HTMLInputElement);
    const inputs = [length,breadth,weight,height];

    inputs.forEach(input => {
      
        if (input.value.trim() === '') {
          input.classList.add('empty-input');
        } else {
          input.classList.remove('empty-input');
        }
      
    });
  }
}
