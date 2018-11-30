import { Component, OnInit } from '@angular/core';

import { RestapiService } from '../restapi.service';
import { AlertService } from '../alert.service';
import { UserService } from '../user.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

  products: any;

  constructor(private rest: RestapiService, private alert: AlertService, private user: UserService, private router: Router) { }

  async ngOnInit() {
    try {
      const data = await this.rest.get('http://localhost:8080/api/products');
      data['success'] ? (this.products = data['products']) : this.alert.error('Could not fetch products!');
    } catch (error) {
      this.alert.error(error['message']);
    }
  }

}
