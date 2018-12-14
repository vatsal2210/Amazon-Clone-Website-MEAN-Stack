import { Component, OnInit } from '@angular/core';
import { RestapiService } from '../restapi.service';
import { AlertService } from '../alert.service';

@Component({
  selector: 'app-collection',
  templateUrl: './collection.component.html',
  styleUrls: ['./collection.component.css']
})
export class CollectionComponent implements OnInit {
  collection;
  constructor(private rest: RestapiService, private alert: AlertService) { }

  async ngOnInit() {
    this.collection = await this.rest.get('/api/findColleciton');
    console.log('in collection ', this.collection);
  }

}
