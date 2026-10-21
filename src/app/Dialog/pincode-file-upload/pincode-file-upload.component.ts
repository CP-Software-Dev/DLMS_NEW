import { Component } from "@angular/core";
import {
  HttpClient,
  HttpHeaders,
} from "@angular/common/http";
import { ToastrService } from "ngx-toastr";
import { MatDialogRef } from "@angular/material/dialog";
import { ApiService } from "../../services/api.service";
import { RefreshService } from "../../services/refresh.service";

@Component({
  selector: "app-pincode-file-upload",
  templateUrl: "./pincode-file-upload.component.html",
  styleUrl: "./pincode-file-upload.component.css",
})
export class PincodeFileUploadComponent {
  constructor(
    private apiservice: ApiService,
    private http: HttpClient,
    private toastr: ToastrService,
    private refreshservice: RefreshService,
    private dialogRef: MatDialogRef<PincodeFileUploadComponent>
  ) {}

  selectedFileName: string = "";
  fileInvalid: boolean = false;
  fileSelected: boolean = false;
  isDragging: boolean = false;
  uploading: boolean = false;
  file: File | null = null;

  onFileSelected(event: any) {
    const file: File | undefined = event.target.files[0];
    this.handleFile(file);
    event.target.value = ""; // same file dobara select karne par bhi change event chale
  }

  onDragOver(event: DragEvent) {
    event.preventDefault();
    this.isDragging = true;
  }

  onDragLeave(event: DragEvent) {
    event.preventDefault();
    this.isDragging = false;
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    this.isDragging = false;
    this.handleFile(event.dataTransfer?.files?.[0]);
  }

  private handleFile(file?: File) {
    if (!file) {
      this.resetFile(false);
      return;
    }
    // Windows par csv ka type kabhi 'application/vnd.ms-excel' aata hai,
    // isliye extension se check karte hain
    if (file.name.toLowerCase().endsWith(".csv")) {
      this.selectedFileName = file.name;
      this.fileSelected = true;
      this.fileInvalid = false;
      this.file = file;
    } else {
      this.resetFile(true);
    }
  }

  private resetFile(invalid: boolean) {
    this.selectedFileName = "";
    this.fileSelected = false;
    this.fileInvalid = invalid;
    this.file = null;
  }

  uploadFile() {
    if (!this.file) return;

    const formData: FormData = new FormData();
    formData.append("file", this.file, this.file.name);

    const url = `${this.apiservice.PincodeFileUpload}?file=${this.file.name}`;
    const headers = new HttpHeaders({ Accept: "application/json" });

    this.uploading = true;
    this.http.post(url, formData, { headers }).subscribe({
      next: (res: any) => {
        this.uploading = false;
        if (res.status) {
          this.toastr.success("File Uploaded Successfully.", "Success");
          this.dialogRef.close();
          this.refreshservice.triggerRefresh();
        } else {
          this.toastr.error(res.errors, "Failure");
        }
      },
      error: () => {
        this.uploading = false;
        this.toastr.error("Something went wrong.", "Failure");
      },
    });
  }

  closeDialog() {
    this.dialogRef.close();
  }
}