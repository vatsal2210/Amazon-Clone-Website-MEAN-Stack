import { Component, OnInit } from '@angular/core';

import { AlertService } from '../alert.service';
import { RestapiService } from '../restapi.service';
import { UserService } from '../user.service';

import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  email = '';
  password = '';
  btnDisabled = false;

  constructor(private user: UserService, private alert: AlertService, private rest: RestapiService, private router: Router, ) { }

  ngOnInit() {
  }

  validate() {
    if (this.email) {
      if (this.password) {
        return true;
      } else {
        this.alert.error('Password is not entered!');
      }
    } else {
      this.alert.error('Email is not entered!');
    }
  }

  async login() {
    this.btnDisabled = true;
    try {
      if (this.validate()) {
        const data = await this.rest.post(
          'http://localhost:8080/api/login',
          {
            email: this.email,
            password: this.password
          }
        );

        if (data['success']) {
          localStorage.setItem('token', data['token']);
          await this.user.getProfile();
          this.router.navigate(['/']);
        } else {
          this.alert.error(data['message']);
        }
      }
    } catch (error) {
      this.alert.error(error['message']);
    }

    this.btnDisabled = false;

  }

}
