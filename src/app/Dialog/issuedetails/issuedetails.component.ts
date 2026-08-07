import { HttpClient } from '@angular/common/http';
import { Component, Inject, OnInit } from '@angular/core';
import { ApiService } from '../../services/api.service';
import { ToastrService } from 'ngx-toastr';
import { MatDialogRef } from '@angular/material/dialog';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-issuedetails',
  templateUrl: './issuedetails.component.html',
  styleUrl: './issuedetails.component.css'
})
export class IssuedetailsComponent implements OnInit {


  ticketID : number = 0;
  subject : string = "";
  description : string = "";
  institution: string = "";
  status : string = "";
  createdDate : any;

  ngOnInit(): void {

  }

  constructor(@Inject(MAT_DIALOG_DATA) public data: any,
    private dialogRef: MatDialogRef<IssuedetailsComponent>,
    private http: HttpClient,
    private apiservice: ApiService,
    private toastr: ToastrService) {
    if (data) {
      this.ticketID = data.ticketId
      this.subject = data.subject
      this.institution = data.institution
      this.description = data.description
      this.createdDate = data.createdAt
      this.status = data.status
    }
  }

  getStatusClass(status: string): string {
    switch (status.toLowerCase()) {
      case 'open':
        return 'open';
      case 'in progress':
        return 'in-progress';
      case 'closed':
        return 'closed';
        case 'resolved':
        return 'resolved';
      default:
        return '';
    }
  }
  

  closeDialog() {
    this.dialogRef.close();
  }
}
