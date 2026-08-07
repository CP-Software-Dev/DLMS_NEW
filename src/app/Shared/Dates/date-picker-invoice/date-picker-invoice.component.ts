import {
  Component,
  ViewChild,
  ElementRef,
  Output,
  EventEmitter,
  Input,
  SimpleChanges,
  OnInit,
  OnChanges,
} from "@angular/core";
import { Router } from "@angular/router";
import moment from "moment";

@Component({
  selector: 'app-date-picker-invoice',
  templateUrl: './date-picker-invoice.component.html',
  styleUrl: './date-picker-invoice.component.css'
})
export class DatePickerInvoiceComponent implements OnInit, OnChanges{
@ViewChild("daterangeInput") daterangeInput!: ElementRef;
  selected: any;
  alwaysShowCalendars: boolean;
  @Output() dateRangeSelected = new EventEmitter<{
    startDate: any;
    endDate: any;
  }>();

  @Input() selectedRange!: { startDate: string; endDate: string };

  ranges: any = {
    Today: [moment(), moment()],
    Yesterday: [moment().subtract(1, "days"), moment().subtract(1, "days")],
    "Last 7 Days": [moment().subtract(6, "days"), moment()],
    "Last 30 Days": [moment().subtract(29, "days"), moment()],
    "This Month": [moment().startOf("month"), moment().endOf("month")],
    "Last Month": [
      moment().subtract(1, "month").startOf("month"),
      moment().subtract(1, "month").endOf("month"),
    ],
    Lifetime: [moment("2024-01-01"), moment()], // Added lifetime range
  };

  invalidDates: moment.Moment[] = [
    moment().add(2, "days"),
    moment().add(3, "days"),
    moment().add(5, "days"),
  ];

  isInvalidDate = (m: moment.Moment) => {
    return this.invalidDates.some((d) => d.isSame(m, "day"));
  };

  constructor(private router: Router) {
    this.alwaysShowCalendars = true;
    // if (!this.selectedRange) {
    //   this.setDefaultDateRange();
    // } else {
    //   this.selectedRange;
    // }
  }

  ngOnInit() {
    if (this.selectedRange?.startDate && this.selectedRange?.endDate) {
      this.selected = {
        startDate: moment(this.selectedRange.startDate),
        endDate: moment(this.selectedRange.endDate),
      };
    } else {
      this.setDefaultDateRange();
    }
  }

  // ✅ If parent updates date later
  ngOnChanges(changes: SimpleChanges) {
    if (changes["selectedRange"] && this.selectedRange) {
      this.selected = {
        startDate: moment(this.selectedRange.startDate),
        endDate: moment(this.selectedRange.endDate),
      };
    }
  }

  setDefaultDateRange() {
    this.selected = {
      startDate: moment().subtract(29, "days"),
      endDate: moment(),
    };
    this.onDateRangeChange(this.selected);
  }

  onDatesUpdated(event: any) {
    this.selected = event;
    this.onDateRangeChange(this.selected);
  }

  onDateRangeChange(selected: any) {
    console.log("Start Date:", selected.startDate.format("YYYY-MM-DD"));
    console.log("End Date:", selected.endDate.format("YYYY-MM-DD"));
    this.dateRangeSelected.emit({
      startDate: selected.startDate,
      endDate: selected.endDate,
    });
  }
}
