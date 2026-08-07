import { Component, OnInit } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';

interface SideNavToggle {
  screenWidth: number;
  collapsed: boolean;
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'Cp-Logistic';

  isSideNavCollapsed = false;            
  screenWidth = 0;

  shouldShowSideNav(): boolean {
    return !this.isLoginPage() && !this.isForgotPage() && !this.isOtpPage() && !this.isResetPage() && !this.isConfirmationPage() && !this.isVerificationPage();
  }

  isUserPage(): boolean {
    const url = this.router.url;
    return url.includes('user') && !url.includes('admin/users') && !url.includes('user-dialog');
  }

  onToggleSideNav(data: SideNavToggle): void {
    this.screenWidth = data.screenWidth;
    this.isSideNavCollapsed = data.collapsed;
  }

   constructor(private router: Router) { }



  isLoginPage(): boolean {
    return this.router.url === '/login';
  }
  isForgotPage(): boolean {
    return this.router.url === '/forgot';
  }

  isOtpPage(): boolean {
    return this.router.url === '/otp';
  }

  isResetPage(): boolean {
    return this.router.url.includes('reset');
  }

  isConfirmationPage(): boolean {
    return this.router.url.includes('confirm');
  }

  isVerificationPage(): boolean {
    return this.router.url.includes('verification');
  }
}
