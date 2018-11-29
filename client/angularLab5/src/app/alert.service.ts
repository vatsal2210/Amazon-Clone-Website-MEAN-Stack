import { Injectable } from '@angular/core';
import { NavigationStart, Router } from '@angular/router';

@Injectable()

export class AlertService {
  message = '';
  messageType = 'danger';
  isArray = false;

  constructor(private router: Router) {
    this.router.events.subscribe(event => {
      if (event instanceof NavigationStart) {
        this.message = '';
      }
    });
  }

  error(message) {
    if (message.length > 0) {
      this.isArray = true;
    }
    this.messageType = 'danger';
    this.message = message;
  }

  success(message) {
    if (message.length > 0) {
      this.isArray = true;
    }
    this.messageType = 'success';
    this.message = message;
  }

  warning(message) {
    if (message.length > 0) {
      this.isArray = true;
    }
    this.messageType = 'warning';
    this.message = message;
  }
}
