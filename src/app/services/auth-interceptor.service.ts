import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Router } from '@angular/router';
import { jwtDecode } from "jwt-decode";
import { MatDialog } from '@angular/material/dialog';

@Injectable({
  providedIn: 'root'
})
export class AuthInterceptorService implements HttpInterceptor {

  constructor(private router: Router ,
     private dialog: MatDialog) { }

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const token = localStorage.getItem('apitoken');
    console.log('AuthInterceptor: HTTP request intercepted');

    
    if (token) {
      const decodedToken: any = jwtDecode(token);
      const expiryTime = decodedToken.exp * 1000;
      const currentTime = Date.now();

      if (currentTime > expiryTime) {
        console.log('Session expired, notifying components');
        this.logout();
        return next.handle(req); 
      } else {
        const clonedRequest = req.clone({
          setHeaders: {
            Authorization: `Bearer ${token}`
          }
        });
        return next.handle(clonedRequest);
      }
    }

    return next.handle(req);
  }

  logout() {
    localStorage.removeItem('apitoken');
    localStorage.removeItem('tokenExpiry');
    this.router.navigate(['/login']);
  }
}
