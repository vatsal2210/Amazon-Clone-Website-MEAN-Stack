import { Injectable } from '@angular/core';
import { RestapiService } from './restapi.service';
import { AlertService } from './alert.service';

import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  user: any;
  isManager = true;

  constructor(private rest: RestapiService, private alert: AlertService, private router: Router) { }

  async getProfile() {
    console.log('Get User Profile data');
    try {
      if (localStorage.getItem('token')) {
        const data = await this.rest.get(
          'http://localhost:8080/api/profile'
        );
        if (data['user'] == null) {
          this.user = '';
          localStorage.clear();
          console.log('User details not found ', this.user);
        } else {
          this.user = data['user'];
          console.log('User Details found ', this.user);
          if (this.user.isManager) {
            console.log('Manager login');
            this.isManager = true;
            this.router.navigate(['manager']);
          } else {
            console.log('Normal User');
            this.router.navigate(['/']);
          }
        }
      }
    } catch (error) {
      console.log('Token not found! ', error);
      this.alert.error(error);
    }
  }
}
