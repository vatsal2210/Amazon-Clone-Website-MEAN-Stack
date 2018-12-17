import { Component, OnInit } from '@angular/core';
import { RestapiService } from '../restapi.service';
import { AlertService } from '../alert.service';
import { FormControl, Validators } from '@angular/forms';
import { UserService } from '../user.service';
import { AppComponent } from '../app.component';


@Component({
  selector: 'app-cart',
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.css']
})
export class CartComponent implements OnInit {
  quantities = [];
  cartItems = [];
  receipt;
  cartCount;
  btnDisabled = false;
  totalPrice;
  total = 0;
  data: any;
  productQty = new FormControl({ value: '', disabled: true }, Validators.required);

  constructor(private rest: RestapiService, private alert: AlertService, private user: UserService, private app: AppComponent) { }

  async ngOnInit() {
    this.cartRecord();
  }

  /* Update Qty */
  async updateQty(id, action) {

    try {
      const data = await this.rest.post('/api/addtocart', {
        productId: id,
        action: action
      });

      if (data['success']) {
        this.alert.success(data['message']);
        this.cartRecord();
      } else {
        this.alert.error(data['message']);
      }
    } catch (error) {
      this.alert.error(error['message']);
    }
  }

  /* Remove Product */
  async removeProduct(id) {
    try {
      const data = await this.rest.post('/api/removeProduct', {
        id: id,
      });

      if (data['success']) {
        this.alert.success(data['message']);
        this.cartRecord();
      } else {
        this.alert.error(data['message']);
      }
    } catch (error) {
      this.alert.error(error['message']);
    }
  }

  /* Check out */
  async checkout() {
    console.log('Check out items');
    const data = await this.rest.post('/api/orderCart', {});

    if (data['success']) {
      console.log(this.cartItems);
      this.receipt = this.cartItems;
      this.alert.success(data['message']);
    } else {
      this.alert.error(data['message']);
    }
  }

  /* Clear cart */
  async clearCart() {
    console.log('clear cart');
    const data = await this.rest.post('/api/clearCart', {});

    if (data['success']) {
      this.alert.success(data['message']);
      this.cartRecord();
    } else {
      this.alert.error(data['message']);
    }
  }

  async refreshPage() {
    console.log();
    this.cartRecord();
  }

  async cartRecord() {
    const data = await this.rest.get('/api/cart');
    this.cartItems = data['cartItem'];
    this.cartCount = data['cartCount'];
    this.app.cartItems = this.cartCount;
    console.log(this.cartItems);
    if (this.cartItems) {
      this.total = 0;
      this.totalPrice = this.cartItems.forEach((d => {
        this.total += d.totalPrice;
      }));
      this.totalPrice = this.total;
    }
  }
}
