import { Component, ElementRef, EventEmitter, HostListener, Input, OnInit, Output } from '@angular/core';
import moment from 'moment';

interface Preset {
  label: string;
  range: () => [moment.Moment, moment.Moment];
}

@Component({
  selector: 'app-date-range-filter',
  templateUrl: './date-range-filter.component.html',
  styleUrl: './date-range-filter.component.css'
})
export class DateRangeFilterComponent implements OnInit {
  @Input() selectedRange!: { startDate: string; endDate: string };
  @Output() dateRangeSelected = new EventEmitter<{ startDate: any; endDate: any }>();

  isOpen = false;

  presets: Preset[] = [
    { label: 'Today', range: () => [moment(), moment()] },
    { label: 'Yesterday', range: () => [moment().subtract(1, 'days'), moment().subtract(1, 'days')] },
    { label: 'Last 7 Days', range: () => [moment().subtract(6, 'days'), moment()] },
    { label: 'Last 30 Days', range: () => [moment().subtract(29, 'days'), moment()] },
    { label: 'This Month', range: () => [moment().startOf('month'), moment().endOf('month')] },
    { label: 'Last Month', range: () => [moment().subtract(1, 'month').startOf('month'), moment().subtract(1, 'month').endOf('month')] },
    { label: 'Lifetime', range: () => [moment('2024-01-01'), moment()] },
  ];

  selectedLabel = 'Last 30 Days';
  selectedRangeValue: [moment.Moment, moment.Moment] = [moment().subtract(29, 'days'), moment()];

  pendingLabel = this.selectedLabel;
  isCustomSelected = false;
  customStart: string = '';
  customEnd: string = '';

  constructor(private elRef: ElementRef) {}

  ngOnInit() {
    if (this.selectedRange?.startDate && this.selectedRange?.endDate) {
      const start = moment(this.selectedRange.startDate);
      const end = moment(this.selectedRange.endDate);
      this.selectedRangeValue = [start, end];
      this.selectedLabel = this.matchPresetLabel(start, end) ?? 'Custom range';
    }
  }

  matchPresetLabel(start: moment.Moment, end: moment.Moment): string | null {
    for (const preset of this.presets) {
      const [rangeStart, rangeEnd] = preset.range();
      if (start.isSame(rangeStart, 'day') && end.isSame(rangeEnd, 'day')) {
        return preset.label;
      }
    }
    return null;
  }

  toggleOpen() {
    this.isOpen = !this.isOpen;
    if (this.isOpen) {
      this.pendingLabel = this.selectedLabel;
      this.isCustomSelected = this.pendingLabel === 'Custom range';
      if (this.isCustomSelected) {
        this.customStart = this.selectedRangeValue[0].format('YYYY-MM-DD');
        this.customEnd = this.selectedRangeValue[1].format('YYYY-MM-DD');
      }
    }
  }

  selectPreset(label: string) {
    this.pendingLabel = label;
    this.isCustomSelected = label === 'Custom range';
    if (this.isCustomSelected && !this.customStart) {
      this.customStart = moment().subtract(29, 'days').format('YYYY-MM-DD');
      this.customEnd = moment().format('YYYY-MM-DD');
    }
  }

  cancel() {
    this.isOpen = false;
  }

  apply() {
    if (this.isCustomSelected) {
      this.selectedRangeValue = [moment(this.customStart), moment(this.customEnd)];
      this.selectedLabel = 'Custom range';
    } else {
      const preset = this.presets.find(p => p.label === this.pendingLabel);
      if (preset) {
        this.selectedRangeValue = preset.range();
        this.selectedLabel = preset.label;
      }
    }

    this.dateRangeSelected.emit({
      startDate: this.selectedRangeValue[0],
      endDate: this.selectedRangeValue[1],
    });

    this.isOpen = false;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    if (this.isOpen && !this.elRef.nativeElement.contains(event.target)) {
      this.isOpen = false;
    }
  }
}