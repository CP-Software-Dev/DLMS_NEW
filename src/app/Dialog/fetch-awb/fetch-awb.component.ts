import { Component,Inject } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { trigger,state, transition, style, animate } from '@angular/animations';

@Component({
  selector: 'app-fetch-awb',
  templateUrl: './fetch-awb.component.html',
  styleUrls: ['./fetch-awb.component.css'],
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
export class FetchAWBComponent {

  awbCount: number | null = null;
  errorMessage: string = '';
  name: string;
  id: number;

  constructor(@Inject(MAT_DIALOG_DATA) public data: any,private dialogRef: MatDialogRef<FetchAWBComponent>)
  {
    this.name = data.name;
    this.id = data.id;

  }
  closeDialog(){
    this.dialogRef.close()
  }

  validateAWBCount() {
    if (this.awbCount !== null && this.awbCount > 1000) {
      this.errorMessage = 'Count should not exceed 1000.';
    } else {
      this.errorMessage = '';
    }
  }

  
}
