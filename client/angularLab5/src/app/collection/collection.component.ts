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
  collectionProduct = [];
  userCollections;

  productList = [];
  @ViewChild('dismissFrame') dismissFrame: ElementRef;
  @ViewChild('dismissFrame1') dismissFrame1: ElementRef;

  constructor(private rest: RestapiService, private alert: AlertService) { }

  clearForm() {
    this.modelTitle = 'Add Product';
  }

  async ngOnInit() {
    const data = await this.rest.get('/api/usercollection');
    console.log(data);
    this.collections = data['collection'];
    console.log('in collection ', this.collections);
    if (this.collections.length === 0) {
      this.collectionArray = false;
    }

    const details = await this.rest.get('/api/collections');
    this.userCollections = details['collection'];
    console.log('this.usercollection', this.userCollections);
  }

  /* Find All collections list */
  async collectionList() {
    // const data = await this.rest.get('/api/collections');
    // this.usercollection = data['collection'];
    // console.log('this.usercollection', this.usercollection);
  }

  /* Show products details */
  async showProducts() {
    this.resetForm();
    this.add = true;
    console.log('Call show product div ');
    const data = await this.rest.get('/api/products');
    this.products = data['products'];
    console.log('Found all products ', this.products);
  }

  /* On Product checkbox change */
  async onCheckboxChange(product, event) {
    if (!this.add) {
      const status = event.target.checked ? 1 : 0;
      console.log('call api ', product.id, event.target.checked);
      const data = await this.rest.post('/api/updateCollectionProduct', {
        id: this.formId.value,
        productId: product.id,
        status: status
      });

      if (data['success']) {
        this.alert.success(data['message']);
      }
    } else {
      if (event.target.checked) {
        this.productList.push(product.id);
      } else {
        for (let i = 0; i < this.products.length; i++) {
          if (this.productList[i] === product.id) {
            this.productList.splice(i, 1);
          }
        }
      }
    }
  }

  /* Add Collection */
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
      const collections = await this.rest.get('/api/usercollection');
      this.collections = collections['collection'];
      this.dismissFrame.nativeElement.click();
      this.resetForm();
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
          this.collectionProduct.push(e2.product);
        }
      }));
      this.productList = this.collectionProduct;
    } else {
      this.alert.error(data['message']);
    }
  }

  /* Update Collection */
  async updateCollection() {
    const data = await this.rest.post('/api/updateCollection', {
      id: this.formId.value,
      title: this.collectionName.value,
      description: this.collectionDescription.value,
      // productId: this.productList,
      visibility: this.collectionVisibility.value
    });

    if (data['success']) {
      this.alert.success(data['message']);
      const collections = await this.rest.get('/api/usercollection');
      this.collections = collections['collection'];
      this.dismissFrame.nativeElement.click();
      this.resetForm();
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
      const collections = await this.rest.get('/api/usercollection');
      this.collections = collections['collection'];
      this.dismissFrame1.nativeElement.click();
    }
    this.alert.error(data['message']);
  }

  resetForm() {
    this.productId.setValue('');
    this.collectionName.setValue('');
    this.collectionDescription.setValue('');
    this.collectionVisibility.setValue(false);
    this.productList = [];
    this.products = [];
    this.collectionProduct = [];
  }

}
