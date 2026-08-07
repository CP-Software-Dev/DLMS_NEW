import { Component, OnDestroy, OnInit } from "@angular/core";
import { FormsModule } from "@angular/forms";
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
  selector: "app-zone-master-file-upload",
  templateUrl: "./zone-master-file-upload.component.html",
  styleUrl: "./zone-master-file-upload.component.css",
  animations: [
    trigger("fadeSlideInOut", [
      state(
        "void",
        style({
          opacity: 0,
          transform: "translateY(-50%)",
        })
      ),
      transition("void => *", [
        animate(
          "700ms ease",
          style({
            opacity: 1,
            transform: "translateY(0)",
          })
        ),
      ]),
      transition("* => void", [
        animate(
          "300ms ease",
          style({
            opacity: 0,
            transform: "translateY(-50%)",
          })
        ),
      ]),
    ]),
  ],
})
export class ZoneMasterFileUploadComponent implements OnInit {
  constructor(
    private apiservice: ApiService,
    private http: HttpClient,
    private toastr: ToastrService,
    private refreshservice: RefreshService,
    private dialogRef: MatDialogRef<ZoneMasterFileUploadComponent>
  ) {}
  selectedFileName: string = "";
  fileInvalid: boolean = false;
  fileSelected: boolean = false;
  file: File | null = null;
  courierData: any[] = [];
  courierId: string = "";

  ngOnInit(): void {
    this.loadCourierData();
  }

  loadCourierData(): void {
    this.http.get<any>(this.apiservice.CourierData).subscribe((response) => {
      this.courierData = response.data;
    });
  }

   onFileSelected(event: any) {
    const file: File = event.target.files[0];

    if (file) {
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
      this.file = null; // Reset fileInvalid flag
    }
  }

  uploadFile() {
    if (this.file && this.courierId) {
      const formData: FormData = new FormData();
      formData.append('file', this.file, this.file.name);

      const url = `${this.apiservice.ZoneMasterUpload}?file=${this.file.name}&courier=${this.courierId}`;

      const headers = new HttpHeaders({
        'Accept': 'application/json'
      });

      this.http.post(url, formData, { headers }).subscribe((res: any) => {
        if (res.status) {
          this.toastr.success('File Uploaded Successfully.', 'Success');
          this.dialogRef.close();
          this.refreshservice.triggerRefresh();
        }
        else {
          this.toastr.error(res.errors, 'Failure');
        }
      })
    }
  }

  closeDialog() {
    this.dialogRef.close();
  }
}
