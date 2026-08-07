import { Component, ViewChild, ElementRef, Output, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';
import moment from 'moment';

@Component({
  selector: 'app-daterange',
  templateUrl: './daterange.component.html',
  styleUrls: ['./daterange.component.css']
})
export class DaterangeComponent {
  @ViewChild('daterangeInput') daterangeInput!: ElementRef;
  selected: any;
  alwaysShowCalendars: boolean;
  @Output() dateRangeSelected = new EventEmitter<{ startDate: any, endDate: any }>();
  
  ranges: any = {

    'Today': [moment(), moment()],
    'Yesterday': [moment().subtract(1, 'days'), moment().subtract(1, 'days')],
    'Last 7 Days': [moment().subtract(6, 'days'), moment()],
    'Last 30 Days': [moment().subtract(29, 'days'), moment()],
    'This Month': [moment().startOf('month'), moment().endOf('month')],
    'Last Month': [moment().subtract(1, 'month').startOf('month'), moment().subtract(1, 'month').endOf('month')],
    'Lifetime': [moment('2024-01-01'), moment()] // Added lifetime range
  }
  
  invalidDates: moment.Moment[] = [moment().add(2, 'days'), moment().add(3, 'days'), moment().add(5, 'days')];
  
  isInvalidDate = (m: moment.Moment) => {

    return this.invalidDates.some(d => d.isSame(m, 'day'));
  }

  constructor( private router : Router) {
    this.alwaysShowCalendars = true;
    this.setDefaultDateRange();
  }
  
  setDefaultDateRange() {
    this.selected = {
      startDate: moment('2024-01-01'),
      endDate: moment()
    };
    this.onDateRangeChange(this.selected);
  }
  
  onDatesUpdated(event: any) {

    this.selected = event;
    this.onDateRangeChange(this.selected);
  }

  onDateRangeChange(selected: any) {
    this.dateRangeSelected.emit({ startDate: selected.startDate, endDate: selected.endDate });
  }
  
  isReportPage: boolean = false;
  ngOnInit(): void {
    this.router.events.subscribe(() => {
      this.isReportPage = this.router.url.includes('/report');
    });
  }
}
