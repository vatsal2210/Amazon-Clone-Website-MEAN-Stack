import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { UserService } from './user.service';
import { CartService } from './cart.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})

export class AppComponent implements OnInit {

  title = 'Lab5';
  isManager;
  cartItems = 0;

  constructor(private router: Router, private user: UserService, private cart: CartService) { }

  async ngOnInit() {
    await this.user.getProfile();
    console.log('app', this.user);
    this.isManager = this.user.isManager;
    this.cartItems = this.user.cartItems;
    console.log(this.cartItems);
  }

  get token() {
    const token = localStorage.getItem('token');
    return token;
  }

  logout() {
    this.user.user = {};
    localStorage.clear();
    this.router.navigate(['']);
  }

}
