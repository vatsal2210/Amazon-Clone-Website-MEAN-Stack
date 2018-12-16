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
  myReview = {
    title: '',
    description: '',
    rating: 0
  };

  btnDisabled = false;

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
      console.log('productDetails', data);
      this.productData = data['product'][0];
      // this.frame.nativeElement.show();
    } else {
      this.alert.error(data['message']);
    }
  }

  async postReview() {
    this.btnDisabled = true;
    try {
      const data = await this.rest.post('/api/review', {
        productId: this.productData._id,
        description: this.myReview.description,
        rating: this.myReview.rating
      });

      if (data['success']) {
        const productDetails = await this.rest.get('/api/findProduct/' + this.productData._id);
        this.productData = productDetails['product'][0];
      } else {
        this.alert.error(data['message']);
      }
    } catch (error) {
      this.alert.error(error['message']);
    }

    this.btnDisabled = false;
  }

  addToCart() {
    // this.data.addToCart(this.product)
    //   ? this.alert.success('Product successfully added to cart!')
    //   : this.alert.error('Product has already been added to cart!');
  }

}
