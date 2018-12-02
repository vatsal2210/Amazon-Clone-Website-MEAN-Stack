import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class RestapiService {
  url = 'http://localhost:8080';

  constructor(private http: HttpClient) { }

  getHeaders() {
    const token = localStorage.getItem('token');
    return token ? new HttpHeaders().set('Authorization', token) : null;
  }

  get(link: string) {
    const api = this.url + '' + link;
    return this.http.get(api, { headers: this.getHeaders() }).toPromise();
  }

  post(link: string, body: any) {
    const api = this.url + '' + link;
    return this.http.post(api, body, { headers: this.getHeaders() }).toPromise();
  }
}
