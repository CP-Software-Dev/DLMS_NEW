import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders,HttpParams } from '@angular/common/http';
import { ApiService } from '../services/api.service';
import { ToastrService } from 'ngx-toastr';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class WebhookService {

  constructor(private ApiService: ApiService,private http: HttpClient , private toastr: ToastrService) { }

  sendWebhook(payload: any,apiKey:string,webhookUrl:string): Observable<any> {
    const myheaders = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': apiKey
    });

    console.log("webhookurl:", webhookUrl); 
    console.log("send payload:", payload);

     return this.http.post(webhookUrl, payload, { headers: myheaders });
  }

  fetchWebhooks(sellerId: string): Observable<any> {
    let params = new HttpParams().set('sellerId', sellerId);

    return this.http.get<any>(this.ApiService.Webhooks, { params }).pipe(
      map(res => {
        if (res.status) {
          if (res.data && res.data.length > 0) {
            let activeWebhook = res.data.find((webhook: { status: string; }) => webhook.status === 'Active');
            if (activeWebhook) {
              return {
                webhookUrl: activeWebhook.webhookURL,
                apiKey: activeWebhook.secretToken
              };
            } else {
              this.toastr.error("Webhook is inactive", 'Failure');
              throw new Error("Webhook is inactive");
            }
          } else {
            this.toastr.error("Webhook data is empty", 'Failure');
            throw new Error("Webhook data is empty");
          }
        } else {
          throw new Error("Invalid response status");
        }
      }),
      catchError(error => {
        console.error("API Error:", error);
        return throwError(error);
      })
    );
  }

}