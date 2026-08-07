import { Component, EventEmitter, Input, Output, OnChanges, SimpleChanges } from '@angular/core';

@Component({
  selector: 'app-paginator',
  templateUrl: './paginator.component.html',
  styleUrls: ['./paginator.component.css']
})
export class PaginatorComponent implements OnChanges {
  @Input() length: number = 0;
  @Input() pageSize: number = 10;
  @Input() pageSizeOptions: number[] = [10, 20, 50, 100];
  @Input() pageIndex: number = 0;
  @Output() page = new EventEmitter<{ pageIndex: number, pageSize: number }>();

  inputPageNumber: number | null = null;

  setPageSizeOptions(options: string) {
    this.pageSizeOptions = options.split(',').map(str => +str);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['length'] || changes['pageSize'] || changes['pageIndex']) {
      this.updatePagination();
    }
  }

  onPageSizeChange(event: any) {
    this.pageSize = +event.target.value;
    this.pageIndex = 0;
    this.page.emit({ pageIndex: this.pageIndex, pageSize: this.pageSize });
  }

  goToPage(pageIndex: number) {
    if (pageIndex >= 0 && pageIndex < this.totalPages) {
      this.pageIndex = pageIndex;
      this.page.emit({ pageIndex: this.pageIndex, pageSize: this.pageSize });
    }
  }

  goToInputPage() {
    if (this.inputPageNumber !== null) {
      const pageIndex = this.inputPageNumber - 1; // converting 1-based page number to 0-based index
      if (pageIndex >= 0 && pageIndex < this.totalPages) {
        this.goToPage(pageIndex);
      }
    }
  }

  validateInput(event: any) {
    const input = event.target.value;
    const maxLength = this.maxDigits(this.totalPages);
    if (input.length > maxLength) {
      event.target.value = input.slice(0, maxLength);
    }
  }

  get totalPages(): number {
    return Math.ceil(this.length / this.pageSize);
  }

  get startIndex(): number {
    return this.pageIndex * this.pageSize;
  }

  get endIndex(): number {
    return Math.min(this.startIndex + this.pageSize, this.length);
  }

  get shouldShowPagination(): boolean {
    return this.totalPages > 1 && this.length > this.pageSize;
  }

  get pages(): number[] {
    const totalPages = this.totalPages;
    const currentPage = this.pageIndex;

    let startPage = Math.max(0, currentPage - 2);
    let endPage = Math.min(totalPages - 1, currentPage + 1);

    if (currentPage < 2) {
      endPage = Math.min(3, totalPages - 1);
    } else if (currentPage > totalPages - 3) {
      startPage = Math.max(totalPages - 4, 0);
    }

    const pages = [];
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    return pages;
  }

  maxDigits(number: number): number {
    return number.toString().length;
  }
  
  private updatePagination() {
    // No-op for now
  }
}