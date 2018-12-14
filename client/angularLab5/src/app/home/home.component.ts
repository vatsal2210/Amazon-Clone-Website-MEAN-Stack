import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';

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
  @ViewChild('frame') frame: ElementRef;

  products: any;
  productData: any;

  constructor(private rest: RestapiService, private alert: AlertService, private user: UserService, private router: Router) { }

  async ngOnInit() {
    try {
      const data = await this.rest.get('/api/products');
      console.log(data);
      data['success'] ? (this.products = data['products']) : this.alert.error('Could not fetch products!');
    } catch (error) {
      this.alert.error(error['message']);
    }
  }

  async productDetails(id) {
    console.log('Check Product Info ', id);
    const data = await this.rest.get('/api/findProduct/' + id);

    if (data['success']) {
      console.log(data);
      this.productData = data['product'][0];
      // this.frame.nativeElement.show();
    } else {
      this.alert.error(data['message']);
    }
  }

}
