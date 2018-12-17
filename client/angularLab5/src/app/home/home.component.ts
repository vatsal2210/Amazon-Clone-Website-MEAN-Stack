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
  topproducts: any;
  productData: any;
  myReview = {
    title: '',
    description: '',
    rating: 0
  };

  btnDisabled = false;
  cartbtnDisabled = false;

  constructor(private rest: RestapiService, private alert: AlertService, private user: UserService, private router: Router) { }
  @ViewChild('dismissFrame1') dismissFrame1: ElementRef;

  async ngOnInit() {
    try {
      const data = await this.rest.get('/api/products');
      console.log(data);
      data['success'] ? (this.products = data['products']) : this.alert.error('Could not fetch products!');
      this.topproducts = data['topProducts'];
    } catch (error) {
      this.alert.error(error['message']);
    }
  }

  get token() {
    const token = localStorage.getItem('token');
    return token;
  }

  async productDetails(id) {
    console.log('Check Product Info ', id);
    this.clearReview();
    const data = await this.rest.get('/api/findProduct/' + id);

    if (data['success']) {
      console.log('productDetails', data);
      this.productData = data['product'][0];
      // this.frame.nativeElement.show();
    } else {
      this.alert.error(data['message']);
    }
  }

  async confirmation() {
    this.dismissFrame1.nativeElement.click();
    this.postReview();
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
        this.clearReview();
      } else {
        this.alert.error(data['message']);
      }
    } catch (error) {
      this.alert.error(error['message']);
    }
    this.btnDisabled = false;
  }

  async addToCart(id) {
    console.log('add to cart ', id);
    try {
      const data = await this.rest.post('/api/addtocart', {
        productId: id,
        quantity: 1,
        action: 1
      });

      if (data['success']) {
        this.alert.success(data['message']);
      } else {
        this.alert.error(data['message']);
      }
    } catch (error) {
      this.alert.error(error['message']);
    }
  }

  clearReview() {
    this.myReview = {
      title: '',
      description: '',
      rating: 0
    };
  }
}
