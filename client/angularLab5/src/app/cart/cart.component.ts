import { Component, OnInit } from '@angular/core';
import { RestapiService } from '../restapi.service';
import { AlertService } from '../alert.service';
import { FormControl, Validators } from '@angular/forms';

@Component({
  selector: 'app-cart',
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.css']
})
export class CartComponent implements OnInit {
  quantities = [];
  cartItems = [];
  btnDisabled = false;
  productQty = new FormControl({ value: '', disabled: true }, Validators.required);

  constructor(private rest: RestapiService, private alert: AlertService) { }

  async ngOnInit() {
    const data = await this.rest.get('/api/cart');
    this.cartItems = data['cartItem'];
    console.log(this.cartItems);
  }

  /* Update Qty */
  async updateQty(id, action) {
    console.log('update for ', id);
    console.log(this.productQty.value);

    try {
      const data = await this.rest.post('/api/addtocart', {
        productId: id,
        quantity: this.productQty.value,
        action: action
      });

      if (data['success']) {
        this.alert.success(data['message']);
        const details = await this.rest.get('/api/cart');
        this.cartItems = details['cartItem'];
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
        const details = await this.rest.get('/api/cart');
        this.cartItems = details['cartItem'];
      } else {
        this.alert.error(data['message']);
      }
    } catch (error) {
      this.alert.error(error['message']);
    }
  }

  /* Check out */
  async checkout() {

  }
}
