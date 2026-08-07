import { Component,Inject } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { trigger, state, style, transition, animate } from '@angular/animations';

@Component({
  selector: 'app-add-courier',
  templateUrl: './add-courier.component.html',
  styleUrl: './add-courier.component.css',
  animations: [
    trigger('fadeSlideInOut', [
      state('void', style({
        opacity: 0,
        transform: 'translateY(-50%)'
      })),
      transition('void => *', [
        animate('700ms ease', style({
          opacity: 1,
          transform: 'translateY(0)'
        }))
      ]),
      transition('* => void', [
        animate('300ms ease', style({
          opacity: 0,
          transform: 'translateY(-50%)'
        }))
      ])
    ])
  ]
})
export class AddCourierComponent {
  name: string = '';
  code: string = '';
  isDataPresent: boolean = false;

  constructor(@Inject(MAT_DIALOG_DATA) public data: any,private dialogRef: MatDialogRef<AddCourierComponent>)
  {
    if (data) {
      this.name = data.name || '';
      this.code = data.code || '';
      this.isDataPresent = true;
    }
  }
  closeDialog() {
    this.dialogRef.close();
  }
}