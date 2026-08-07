import { ChangeDetectorRef, Component, OnDestroy, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, FormControl } from "@angular/forms";
import {
  trigger,
  state,
  style,
  animate,
  transition,
} from "@angular/animations";
import { MatDialog } from "@angular/material/dialog";
import { ActivatedRoute } from "@angular/router";
import { HttpClient, HttpParams } from "@angular/common/http";
import { Router } from "@angular/router";
import { Subscription } from "rxjs";
import { ToastrService } from "ngx-toastr";
import { ApiService } from "../../services/api.service";
import { RefreshService } from "../../services/refresh.service";

@Component({
  selector: "app-webhook-log",
  templateUrl: "./webhook-log.component.html",
  styleUrl: "./webhook-log.component.css",
  animations: [
    trigger("fadeInOut", [
      state(
        "void",
        style({
          opacity: 0,
        })
      ),
      transition("void <=> *", animate(300)),
    ]),
  ],
})
export class WebhookLogComponent {
  pageIndex: number = 0;
  pageSize: number = 10;
  files: any[] = [];
  totalFiles: number = 0;
  buttonText: string = "Filters";
  buttonIcon: string = "ri-filter-fill";
  showFiltersForm: boolean = false;
  pincode: string = "";
  sellerData: any[] = [];
  sellerId: string = "";

  private refreshSubscription?: Subscription;

  constructor(
    private apiservice: ApiService,
    private dialog: MatDialog,
    private http: HttpClient,
    private refreshservice: RefreshService,
    private router: Router,
    private toastr: ToastrService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.fetchData(this.pageIndex, this.pageSize);
  }

  toggleFiltersForm() {
    this.showFiltersForm = !this.showFiltersForm;
    this.buttonText = this.showFiltersForm ? "Close" : "Filters";
    this.buttonIcon = this.showFiltersForm ? "ri-close-fill" : "ri-filter-fill";
  }

  applyFilters() {
    this.fetchData(this.pageIndex, this.pageSize);
  }

  clearFilters() {
    this.sellerId = "";
    this.fetchData(this.pageIndex, this.pageSize);
  }

  handlePageEvent(event: { pageIndex: number; pageSize: number }) {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.fetchData(this.pageIndex, this.pageSize);
  }

  fetchData(pageIndex: number, pageSize: number) {
    let params = new HttpParams()
      .set("pageNumber", (pageIndex + 1).toString())
      .set("pageSize", pageSize.toString());

    this.http.get(this.apiservice.WebhookFilesView, { params }).subscribe(
      (res: any) => {
        this.files = res.data.data;
        this.totalFiles = res.data.totalCount;
      },
      (error) => {}
    );
  }

  downloadFile(fileName: string) {
    const url = `${this.apiservice.WebhookFilesDownload}?fileName=${fileName}`;

    this.http
      .get(url, { responseType: "blob", observe: "response" })
      .subscribe({
        next: (res) => {
          const blob = new Blob([res.body!], { type: res.body?.type });

          // Extract filename from header (optional)
          let fileNameFromHeader = fileName;
          const contentDisposition = res.headers.get("content-disposition");
          if (contentDisposition) {
            const match = contentDisposition.match(/filename="?(.+)"?/);
            if (match && match[1]) {
              fileNameFromHeader = match[1];
            }
          }

          const link = document.createElement("a");
          link.href = window.URL.createObjectURL(blob);
          link.download = fileNameFromHeader;
          link.click();

          window.URL.revokeObjectURL(link.href);
        },
        error: (err) => {
          console.error("Download failed", err);
        },
      });
  }
}
