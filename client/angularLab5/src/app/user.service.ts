import { Injectable } from '@angular/core';
import { RestapiService } from './restapi.service';
import { AlertService } from './alert.service';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  user: any;

  constructor(private rest: RestapiService, private alert: AlertService) { }

  async getProfile() {
    console.log('Get User Profile data');
    try {
      if (localStorage.getItem('token')) {
        const data = await this.rest.get(
          'http://localhost:8080/api/profile'
        );
        this.user = data['user'];
        console.log('User Details found ', this.user);
      }
    } catch (error) {
      console.log('Token not found! ', error);
      this.alert.error(error);
    }
  }
}
