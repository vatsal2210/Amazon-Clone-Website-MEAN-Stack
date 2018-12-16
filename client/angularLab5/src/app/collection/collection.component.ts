import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { RestapiService } from '../restapi.service';
import { AlertService } from '../alert.service';
import { ReactiveFormsModule, FormControl, Validators } from '@angular/forms';

@Component({
  selector: 'app-collection',
  templateUrl: './collection.component.html',
  styleUrls: ['./collection.component.css']
})
export class CollectionComponent implements OnInit {
  collections;
  products;
  collectionArray = true;
  deleteCollectionId;
  productId = new FormControl('', Validators.required);
  collectionName = new FormControl('', Validators.required);
  collectionDescription = new FormControl('', Validators.required);
  collectionVisibility = new FormControl('', Validators.required);
  formId = new FormControl('', Validators.required);

  add = true;
  modelTitle;

  productList = [];
  @ViewChild('dismissFrame') dismissFrame: ElementRef;
  @ViewChild('dismissFrame1') dismissFrame1: ElementRef;

  constructor(private rest: RestapiService, private alert: AlertService) { }

  clearForm() {
    this.modelTitle = 'Add Product';
  }

  async ngOnInit() {
    const data = await this.rest.get('/api/collections');
    console.log(data);
    this.collections = data['collection'];
    console.log('in collection ', this.collections);
    if (this.collections.length === 0) {
      this.collectionArray = false;
    }
  }

  async showProducts() {
    console.log('Call show product div ');
    const data = await this.rest.get('/api/products');
    this.products = data['products'];
    console.log('Found all products ', this.products);
  }

  async onCheckboxChange(product, event) {
    if (event.target.checked) {
      this.productList.push(product.id);
    } else {
      for (let i = 0; i < this.products.length; i++) {
        if (this.productList[i] === product.id) {
          this.productList.splice(i, 1);
        }
      }
    }
    console.log(this.productList);
    // https://stackoverflow.com/questions/34997128/angular-2-get-values-of-multiple-checked-checkboxes
  }

  async addCollection() {
    console.log(this.productList);
    console.log(this.collectionName.value);
    console.log(this.collectionDescription.value);
    console.log(this.collectionVisibility.value);

    const data = await this.rest.post('/api/addCollection', {
      title: this.collectionName.value,
      description: this.collectionDescription.value,
      productId: this.productList,
      visibility: this.collectionVisibility.value
    });

    if (data['success']) {
      this.alert.success(data['message']);
      const collections = await this.rest.get('/api/collections');
      this.collections = collections['collection'];
      this.dismissFrame.nativeElement.click();
      this.productList = [];
    } else {
      this.alert.error(data['message']);
    }
  }

  // Find Collection Details
  async editCollection(id) {
    console.log('Find product ', id);
    const data = await this.rest.get('/api/collectionDetails/' + id);
    if (data['success']) {
      const details = data['products'];
      this.add = false;
      this.modelTitle = 'Edit Collection';
      this.formId.setValue(details[0]._id);
      this.collectionName.setValue(details[0].name);
      this.collectionDescription.setValue(details[0].description);
      this.collectionVisibility.setValue(details[0].visibility);

      const productData = await this.rest.get('/api/products');
      this.products = productData['products'];
      this.productList = details[0].products;

      this.products.forEach((e1) => details[0].products.forEach((e2) => {
        if (e1.id === e2.product) {
          console.log('compared');
          // this.collectionProduct.setValue(true);
        }
      }));
    } else {
      this.alert.error(data['message']);
    }
  }

  /* Update Collection */
  async updateCollection() {
    console.log('Update Collection Request');
    console.log(this.productList);
    console.log(this.collectionName.value);
    console.log(this.collectionDescription.value);
    console.log(this.collectionVisibility.value);
    console.log(this.formId.value);

    const data = await this.rest.post('/api/updateCollection', {
      id: this.formId.value,
      title: this.collectionName.value,
      description: this.collectionDescription.value,
      productId: this.productList,
      visibility: this.collectionVisibility.value
    });

    if (data['success']) {
      this.alert.success(data['message']);
      const collections = await this.rest.get('/api/collections');
      this.collections = collections['collection'];
      this.dismissFrame.nativeElement.click();
    } else {
      this.alert.error(data['message']);
    }
  }


  /* Delete Collection */
  async deleteCollectionid(id) {
    this.deleteCollectionId = id;
  }

  async deleteCollection() {
    console.log(this.deleteCollectionId);
    const data = await this.rest.post('/api/deleteCollection', {
      'id': this.deleteCollectionId
    });
    if (data['success']) {
      this.alert.success(data['message']);
      const collections = await this.rest.get('/api/collections');
      this.collections = collections['collection'];
      this.dismissFrame1.nativeElement.click();
    }
    this.alert.error(data['message']);
  }

}
