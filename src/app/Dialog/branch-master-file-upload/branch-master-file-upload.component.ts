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
  selector: "app-branch-master-file-upload",
  templateUrl: "./branch-master-file-upload.component.html",
  styleUrl: "./branch-master-file-upload.component.css",
  animations: [
    trigger("fadeSlideInOut", [
      state(
        "void",
        style({
          opacity: 0,
          transform: "translateX(100%)",
        })
      ),
      transition("void => *", [
        animate(
          "350ms ease-out",
          style({
            opacity: 1,
            transform: "translateX(0)",
          })
        ),
      ]),
      transition("* => void", [
        animate(
          "250ms ease-in",
          style({
            opacity: 0,
            transform: "translateX(100%)",
          })
        ),
      ]),
    ]),
  ],
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
  isDragOver: boolean = false;

  // File picked through the browse dialog
  onFileSelected(event: any) {
    this.handleFile(event.target.files[0]);
  }

  // Drag and drop handlers
  onDragOver(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver = true;
  }

  onDragLeave(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver = false;
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver = false;
    this.handleFile(event.dataTransfer?.files?.[0]);
  }

  // Shared validation for browse and drop
  private handleFile(file: File | null | undefined) {
    if (file) {
      // Accept only CSV files
      if (file.type === "text/csv") {
        this.selectedFileName = file.name;
        this.fileSelected = true;
        this.fileInvalid = false;
        this.file = file;
      } else {
        this.selectedFileName = "";
        this.fileSelected = false;
        this.fileInvalid = true;
        this.file = null;
      }
    } else {
      this.selectedFileName = "";
      this.fileSelected = false;
      this.fileInvalid = false;
      this.file = null;
    }
  }

  // Remove the chosen file and reset the hidden input
  clearFile(input: HTMLInputElement) {
    input.value = "";
    this.handleFile(null);
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