import { Component } from "@angular/core";
import { ApiService } from "../../services/api.service";
import { HttpClient } from "@angular/common/http";

@Component({
  selector: "app-old-awb-finder",
  templateUrl: "./old-awb-finder.component.html",
  styleUrl: "./old-awb-finder.component.css",
})
export class OldAwbFinderComponent {
  // constructor(private api: ApiService, private http: HttpClient) {}

  // fileName: string | null = null;
  // selectedFile!: File;

  // onFileSelected(event: any) {
  //   const file = event.target.files[0];
  //   if (file) {
  //     this.handleFile(file);
  //   }
  // }

  // onDragOver(event: DragEvent) {
  //   event.preventDefault();
  // }

  // onDrop(event: DragEvent) {
  //   event.preventDefault();
  //   if (event.dataTransfer?.files.length) {
  //     const file = event.dataTransfer.files[0];
  //     this.handleFile(file);
  //   }
  // }

  // handleFile(file: File) {
  //   const validTypes = [
  //     "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  //     "application/vnd.ms-excel",
  //   ];

  //   if (!validTypes.includes(file.type)) {
  //     alert("Only Excel files are allowed");
  //     return;
  //   }

  //   this.selectedFile = file;
  //   this.fileName = file.name;

  //   // 👉 Call API here
  //    this.uploadFile();
  // }

  // isUploading = false;

  // uploadFile() {
  //   if (!this.selectedFile) return;

  //   const formData = new FormData();
  //   formData.append("file", this.selectedFile); // 👈 match API param name (case-sensitive!)

  //   this.isUploading = true;

  //   this.http
  //     .post(this.api.AwbMapping, formData, {
  //       responseType: "blob",
  //     })
  //     .subscribe({
  //       next: (res: Blob) => {
  //         this.isUploading = false;

  //         // ✅ Directly use res
  //         const url = window.URL.createObjectURL(res);

  //         const a = document.createElement("a");
  //         a.href = url;
  //         a.download = "Mapped_AWB.xlsx";
  //         a.click();

  //         window.URL.revokeObjectURL(url);
  //       },

  //       error: async (err) => {
  //         this.isUploading = false;

  //         // ⚠️ Handle backend error (important!)
  //         if (err.error instanceof Blob) {
  //           const text = await err.error.text(); // convert blob → string
  //           try {
  //             const json = JSON.parse(text);
  //             alert(json?.errors?.[0] || "Upload failed");
  //           } catch {
  //             alert(text);
  //           }
  //         } else {
  //           alert("Upload failed");
  //         }

  //         console.error(err);
  //       },
  //     });
  // }

  constructor(private api: ApiService, private http: HttpClient) {}

  fileName: string | null = null;
  selectedFile!: File;
  isUploading = false;

  // 📁 File Select
  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.handleFile(file);
    }
  }

  // 🖱 Drag Over
  onDragOver(event: DragEvent) {
    event.preventDefault();
  }

  // 📥 Drop
  onDrop(event: DragEvent) {
    event.preventDefault();

    if (event.dataTransfer?.files.length) {
      const file = event.dataTransfer.files[0];
      this.handleFile(file);
    }
  }

  // 📦 Validate + Upload
  handleFile(file: File) {
    const validTypes = [
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "application/vnd.ms-excel",
    ];

    if (!validTypes.includes(file.type)) {
      alert("Only Excel files are allowed");
      return;
    }

    this.selectedFile = file;
    this.fileName = file.name;

    this.uploadFile();
  }

  // 🚀 Upload API
  uploadFile() {
    if (!this.selectedFile) return;

    const formData = new FormData();
    formData.append("file", this.selectedFile);

    this.isUploading = true;

    this.http
      .post(this.api.AwbMapping, formData, {
        responseType: "blob",
      })
      .subscribe({
        next: async (res: Blob) => {
          await new Promise((resolve) => setTimeout(resolve, 300));

          const url = window.URL.createObjectURL(res);

          const a = document.createElement("a");
          a.href = url;
          a.download = "Mapped_AWB.xlsx";

          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);

          window.URL.revokeObjectURL(url);

          // ✅ RESET EVERYTHING AFTER SUCCESS
          this.resetForm();

          // ✅ STOP loader AFTER reset
          this.isUploading = false;
        },

        error: async (err) => {
          this.isUploading = false;

          if (err.error instanceof Blob) {
            const text = await err.error.text();
            try {
              const json = JSON.parse(text);
              alert(json?.errors?.[0] || "Upload failed");
            } catch {
              alert(text);
            }
          } else {
            alert("Upload failed");
          }

          console.error(err);
        },
      });
  }

  resetForm() {
    this.selectedFile = null as any;
    this.fileName = null;

    // 🔥 IMPORTANT: reset input field (otherwise same file can't be reselected)
    const input =
      document.querySelector<HTMLInputElement>('input[type="file"]');
    if (input) {
      input.value = "";
    }
  }
}
