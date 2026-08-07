import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../services/api.service';
import { SellerService } from '../../services/seller.service';
import { HttpClient, HttpParams } from '@angular/common/http';
import { ToastrService } from 'ngx-toastr';
import { debug, error } from 'console';
import { RefreshService } from '../../services/refresh.service';

@Component({
  selector: 'app-hellpbtn',
  templateUrl: './hellpbtn.component.html',
  styleUrl: './hellpbtn.component.css'
})
export class HellpbtnComponent implements OnInit {
  showHelpCenter = false;
  showRaiseIssue = false;
  userName: any;
  sellerID: any;
  salesId: any;

  showEmailInput: boolean = false;
  ccEmails: string = '';
  mailSubject: string = '';
  selectedFiles: File[] = [];
  mailContent: string = '';
  isSubmitting: boolean = false; 

  toggleEmailInput() {
    if (this.showEmailInput) {
      this.ccEmails = '';
    }
    this.showEmailInput = !this.showEmailInput;
  }
  constructor(private apiservice: ApiService,
    private http: HttpClient,
    private toastr: ToastrService,
    private refreshservice: RefreshService,
    private sellerService: SellerService) {

  }

  ngOnInit(): void {
    this.userName = this.sellerService.getItem('username');
    this.sellerID = this.sellerService.getItem('seller');
    this.getSalesID();
  }

  getSalesID(): void {
    let params = new HttpParams()
      .set('sellerId', this.sellerID);

    this.http.get(this.apiservice.BankList, { params }).subscribe((res: any) => {
      if (res.status) {
        this.salesId = res.data[0].salesPersonId;
        this.SalesPersonMail(this.salesId);
      }
    })
  }

  SalesPersonMail(sales: number) {
    let params = new HttpParams()
      .set('dataCount', 100)
      .set('page', 1)
      .set('salesPersonId', sales);

    this.http.get(this.apiservice.SalesPerson, { params }).subscribe((res: any) => {
      if (res.status) {

      }
    })
  }

  openHelpCenter(event: MouseEvent) {
    this.showHelpCenter = true;
    this.showRaiseIssue = false;
    event.preventDefault();
  }

  closeHelpCenter() {
    this.showHelpCenter = false;
    this.showRaiseIssue = false;
  }

  openRaiseIssue() {
    this.showRaiseIssue = true;
    this.showHelpCenter = false;
  }

  closeRaiseIssue() {
    this.showRaiseIssue = false;
    this.showHelpCenter = true;
  }

  // onFileSelected(event: any) {
  //   const file = event.target.files[0];
  //   if (file) {
  //     this.selectedFile = file;
  //   }
  // }

  // triggerFileInput() {
  //   const fileInput = document.getElementById('fileInput') as HTMLInputElement;
  //   fileInput.click();
  // }

  onFilesSelected(event: any) {
    const files: FileList = event.target.files;
    for (let i = 0; i < files.length; i++) {
      this.selectedFiles.push(files[i]);
    }
  }

  triggerFileInput() {
    const fileInput = document.getElementById('fileInput') as HTMLInputElement;
    fileInput.click();
  }

  removeFile(index: number) {
    this.selectedFiles.splice(index, 1);
  }

  submitIssue() {
    this.closeHelpCenter();

    const emailPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
    const invalidEmails = this.ccEmailsArray.filter(email => !emailPattern.test(email.trim()));

    if (invalidEmails.length > 0) {
      this.toastr.error(`Invalid email(s): ${invalidEmails.join(', ')}`, 'Failure');
      return;
    }

    if (!this.mailSubject || !this.mailContent) {
      this.toastr.error('Subject and message content cannot be empty.', 'Failure');
      return;
    }

    const formData = new FormData();
    formData.append('username', this.userName.toString());
    formData.append('CC', this.ccEmailsArray.join(','));
    formData.append('Subject', this.mailSubject.toString());
    formData.append('message', this.mailContent.toString());

    this.selectedFiles.forEach((file, index) => {
      formData.append(`Images`, file);  // API expects array format for images
    });

    this.http.post(this.apiservice.RaiseIssue, formData).subscribe(
      (res: any) => {

        console.log(res);
        if (res.status) {
          this.toastr.success('Issue is raised.', 'Success');
          this.clearfields();
          this.closeHelpCenter();

        } else {
          this.toastr.error('Some error occurred, please try again.', 'Failure');
          this.clearfields();
        }
      },
      error => {
        this.toastr.error(error, 'Failure');
        this.closeHelpCenter();
        this.clearfields();
      }
    );
    
  }


  clearfields(): void {
    this.ccEmails = '';
    this.mailSubject = '';
    this.mailContent = '';
    this.ccEmailsArray = [];
    this.selectedFiles = [];
  }

  ccEmailsArray: string[] = [];
  currentEmail: string = '';

  handleKeyUp(event: KeyboardEvent) {
    if (event.key === 'Enter' || event.key === ',') {
      this.addEmailToList();
    }
  }

  addEmailToList() {
    const emails = this.currentEmail.split(/[\s,]+/); // Split by spaces or commas
    emails.forEach(email => {
      const trimmedEmail = email.trim();
      if (trimmedEmail && !this.ccEmailsArray.includes(trimmedEmail)) {
        this.ccEmailsArray.push(trimmedEmail);
      }
    });
    this.currentEmail = ''; // Clear input after adding
  }

  removeEmailFromList(email: string) {
    this.ccEmailsArray = this.ccEmailsArray.filter(e => e !== email);
  }


}
