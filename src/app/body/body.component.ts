import { style } from '@angular/animations';
import { Component, Input, OnChanges, SimpleChanges, HostListener, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-body',
  templateUrl: './body.component.html',
  styleUrl: './body.component.css'
})
export class BodyComponent implements OnInit , OnChanges {
  @Input() collapsed = false;
  @Input() screenWidth = 0;

  ngOnInit(): void {
    this.getBodyClass();
  }
  
  ngOnChanges(changes: SimpleChanges): void {
    this.getBodyClass();
  }

  getBodyClass(): string {
    let styleClass = ''; 
    if(this.collapsed && this.screenWidth > 768) {
      styleClass = 'body-trimmed';
    } else if(this.collapsed && this.screenWidth <= 768 && this.screenWidth > 0) {
      styleClass = 'body-md-screen'
    }

    if(this.router.url === '/login')
    {
      styleClass = 'login-page'
    }
    else if(this.router.url === '/forgot')
    {
      styleClass = 'login-page'
    }
    else if(this.router.url === '/otp')
    {
      styleClass = 'login-page'
    }
    else if(this.router.url.includes('reset'))
    {
      styleClass = 'login-page'
    }
    else if(this.router.url.includes('confirm'))
      {
        styleClass = 'login-page'
      }
      else if(this.router.url.includes('verification'))
        {
          styleClass = 'login-page'
        }
    return styleClass;
  }
  constructor(private router: Router)
  {}

}
