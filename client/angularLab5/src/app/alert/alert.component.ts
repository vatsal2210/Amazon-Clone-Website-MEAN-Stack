import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { AlertService } from '../alert.service';

@Component({
  selector: 'app-alert',
  templateUrl: './alert.component.html',
  styleUrls: ['./alert.component.css']
})
export class AlertComponent implements OnInit {

  constructor(private alert: AlertService) { }

  ngOnInit() {
  }

  closeAlert() {
    console.log('called');
  }
}
