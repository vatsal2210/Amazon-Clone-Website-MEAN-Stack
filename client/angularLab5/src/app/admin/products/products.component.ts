import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { RestapiService } from '../../restapi.service';
import { AlertService } from '../../alert.service';
import { Router } from '@angular/router';
import { ReactiveFormsModule, FormControl, Validators } from '@angular/forms';
import { NgModule } from '@angular/core';

@NgModule({
  imports: [
    FormControl,
    Validators,
    ReactiveFormsModule
  ],
})

@Component({
  selector: 'app-products',
  templateUrl: './products.component.html',
  styleUrls: ['./products.component.css']
})


export class ProductsComponent implements OnInit {
  @ViewChild('dismissFrame') dismissFrame: ElementRef;
  @ViewChild('dismissFrame1') dismissFrame1: ElementRef;

  products;
  findproduct;
  deleteItemResponse;
  sorted = false;
  modelTitle;
  deleteProductid;
  add = true;
  fileData;
  productReview;
  productReviewId;

  formTitle = new FormControl('', Validators.required);
  formDescription = new FormControl('', Validators.required);
  formPrice = new FormControl('', Validators.required);
  formTax = new FormControl('', Validators.required);
  formQuantity = new FormControl('', Validators.required);
  formId = new FormControl('');

  constructor(private rest: RestapiService, private alert: AlertService, private router: Router) { }

  async ngOnInit() {
    this.products = await this.rest.get('/admin/getProducts');
    console.log('in manager ', this.products);
  }

  /* Clear form field */
  clearForm() {
    this.modelTitle = 'Add Product';
    this.formId.reset();
    this.formTitle.reset();
    this.formDescription.reset();
    this.formPrice.reset();
    this.formTax.reset();
    this.formQuantity.reset();
  }

  /* Sort Products */
  sortBy(by: string | any): void {
    console.log('clicked');
    this.products.products.sort((a: any, b: any) => {
      if (a[by] < b[by]) {
        return this.sorted ? 1 : -1;
      }
      if (a[by] > b[by]) {
        return this.sorted ? -1 : 1;
      }
      console.log('return 0');
      return 0;
    });
    this.sorted = !this.sorted;
  }

  /* File Upload */
  handleFileInput(files) {
    console.log(files);
    // this.fileData = files;
    this.fileData = new FormData();
    this.fileData.append('file', files);
  }

  /* Form Submit */
  async addProduct() {
    this.add = true;
    const data = await this.rest.post('/admin/product', {
      id: this.formId.value,
      title: this.formTitle.value,
      description: this.formDescription.value,
      price: this.formPrice.value,
      quantity: this.formQuantity.value,
      tax: this.formTax.value,
      file: this.fileData
    });

    if (data['success']) {
      this.alert.success(data['message']);
      this.products = await this.rest.get('/admin/getProducts');
      this.dismissFrame.nativeElement.click();
    } else {
      this.alert.error(data['message']);
    }
  }

  /* Edit Item */
  async editProduct(id) {
    const data = await this.rest.get('/api/findProduct/' + id);
    if (data['success']) {
      this.findproduct = data['product'];
      this.add = false;
      this.modelTitle = 'Edit Product - ' + this.findproduct[0].title;
      this.formId.setValue(this.findproduct[0]._id);
      this.formTitle.setValue(this.findproduct[0].title);
      this.formDescription.setValue(this.findproduct[0].description);
      this.formPrice.setValue(this.findproduct[0].price);
      this.formTax.setValue(this.findproduct[0].tax);
      this.formQuantity.setValue(this.findproduct[0].quantity);
    } else {
      this.alert.error(data['message']);
    }
  }

  /* Update Product */
  async updateProduct() {
    console.log('Update Product Request');
    const data = await this.rest.post('/admin/product', {
      id: this.formId.value,
      title: this.formTitle.value,
      description: this.formDescription.value,
      price: this.formPrice.value,
      quantity: this.formQuantity.value,
      tax: this.formTax.value,
    });

    if (data['success']) {
      this.alert.success(data['message']);
      this.products = await this.rest.get('/admin/getProducts');
      this.dismissFrame.nativeElement.click();
    } else {
      this.alert.error(data['message']);
    }
  }

  /* Delete Item */
  async deleteProductId(id) {
    this.deleteProductid = id;
  }

  async deleteProduct() {
    const data = await this.rest.post('/admin/deleteProduct', {
      id: this.deleteProductid
    });
    if (data['success']) {
      this.alert.success(data['message']);
      this.products = await this.rest.get('/admin/getProducts');
      this.dismissFrame1.nativeElement.click();
    }
    this.alert.error(data['message']);
  }

  async getProductReview(id) {
    this.productReviewId = id;
    const data = this.products.products;
    const findProductReview = data.find(x => x._id === id);
    this.productReview = findProductReview.reviews.length > 0 ? findProductReview : '';
  }

  /* Change comment status */
  async changeCommentStatus(id, status) {
    const data = await this.rest.post('/admin/commentStatus', {
      id: id,
      status: status
    });
    if (data['success']) {
      this.alert.success(data['message']);
      this.products = await this.rest.get('/admin/getProducts');
      const details = this.products.products;
      this.productReview = details.find(x => x._id === this.productReviewId);
    } else {
      this.alert.error(data['message']);
    }
  }

}
