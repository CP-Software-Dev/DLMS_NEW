import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Usermodal } from '../modals/usermodel';
import { ApiService } from './api.service';

@Injectable({
  providedIn: 'root'
})
export class MemberServiceService {
  constructor(private apiservice : ApiService, private http:HttpClient) { 
  }
  getUser(): Observable<any> {
    return this.http.get(this.apiservice.Users);
  }
}
