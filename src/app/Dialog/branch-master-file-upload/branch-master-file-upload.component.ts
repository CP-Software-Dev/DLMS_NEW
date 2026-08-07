import { Component, OnDestroy, OnInit } from "@angular/core";
import {
  trigger,
  state,
  transition,
  style,
  animate,
} from "@angular/animations";
import {
  HttpEventType,
  HttpClient,
  HttpHeaders,
  HttpErrorResponse,
} from "@angular/common/http";
import { ToastrService } from "ngx-toastr";
import { MatDialogRef } from "@angular/material/dialog";
import { ApiService } from "../../services/api.service";
import { RefreshService } from "../../services/refresh.service";

@Component({
  selector: 'app-branch-master-file-upload',
  templateUrl: './branch-master-file-upload.component.html',
  styleUrl: './branch-master-file-upload.component.css'
})
export class BranchMasterFileUploadComponent {
constructor(
    private apiservice: ApiService,
    private http: HttpClient,
    private toastr: ToastrService,
    private refreshservice: RefreshService,
    private dialogRef: MatDialogRef<BranchMasterFileUploadComponent>
  ) {}
  selectedFileName: string = "";
  fileInvalid: boolean = false;
  fileSelected: boolean = false;
  file: File | null = null;
  sellerData: any[] = [];
  sellerId: string = "";

  onFileSelected(event: any) {
    const file: File = event.target.files[0];

    if (file) {
      // Accept both XLSX and XLS formats
      if (file.type === 'text/csv') {
        this.selectedFileName = file.name;
        this.fileSelected = true;
        this.fileInvalid = false;
        this.file = file;

      } else {
        this.selectedFileName = '';
        this.fileSelected = false;
        this.fileInvalid = true;
        this.file = null;

      }
    } else {
      this.selectedFileName = '';
      this.fileSelected = false;
      this.fileInvalid = false;
      this.file = null; // Reset fileInvalid flag
    }
  }

  uploadFile() {
    if (this.file) {
      const formData: FormData = new FormData();
      formData.append("file", this.file, this.file.name);

      const url = `${this.apiservice.BranchFileUpload}?file=${this.file.name}`;

      const headers = new HttpHeaders({
        Accept: "application/json",
      });

      this.http.post(url, formData, { headers }).subscribe((res: any) => {
        if (res.status) {
          this.toastr.success("File Uploaded Successfully.", "Success");
          this.dialogRef.close();
          this.refreshservice.triggerRefresh();
        } else {
          this.toastr.error(res.errors, "Failure");
        }
      });
    }
  }

  closeDialog() {
    this.dialogRef.close();
  }
}
