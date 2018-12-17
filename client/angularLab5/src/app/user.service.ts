import { Injectable } from '@angular/core';
import { RestapiService } from './restapi.service';
import { AlertService } from './alert.service';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  user: any;
  isManager;
  cartItems = 0;

  constructor(private rest: RestapiService, private alert: AlertService, private router: Router) { }

  async getProfile() {
    console.log('Get User Profile data ');
    try {
      if (localStorage.getItem('token')) {
        const data = await this.rest.get('/api/profile');
        if (data['user'] == null) {
          this.user = '';
          localStorage.clear();
          console.log('User details not found ', this.user);
        } else {
          this.user = data['user'];
          this.cartItems = data['cartCount'];
          console.log('User Details found ', this.user, this.cartItems);

          if (this.user.isManager) {
            console.log('Manager login');
            this.isManager = true;
            this.router.navigateByUrl('/manager');
          } else {
            console.log('Normal User');
            this.isManager = false;
            this.router.navigateByUrl('/');
          }
        }
      } else {
        console.log('Token not found');
        this.router.navigateByUrl('login');
      }
    } catch (error) {
      console.log('Token not found! ', error);
      this.alert.error(error);
      localStorage.clear();
      this.router.navigateByUrl('/');
    }
  }

  // addedToCard() {
  //   console.log('added product ');
  //   // this.cartItems = this.cartItems++;
  //   this.app.cartItems = this.cartItems++;
  // }

  // removedFromCart() {
  //   console.log('removed product ');
  //   // this.cartItems = this.cartItems--;
  //   this.app.cartItems = this.cartItems++;
  // }
}
