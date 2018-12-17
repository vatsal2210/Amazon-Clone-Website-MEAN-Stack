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
      if (/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(this.email)) {
      // if (/^\w+@[a-zA-Z_]+?\.[a-zA-Z]{2,3}$/.test(this.email)) {
        if (this.password) {
          return true;
        } else {
          this.alert.error('Password is not entered!');
        }
      } else {
        this.alert.error('Enter valid Email!');
      }
    } else {
      this.alert.error('Email is not entered!');
    }
  }

  async login() {
    this.btnDisabled = true;
    try {
      if (this.validate()) {
        const data = await this.rest.post('/api/login', {
          email: this.email,
          password: this.password
        });

        if (data['success']) {
          localStorage.setItem('token', data['token']);
          console.log(data['manager']);
          await this.user.getProfile();
          if (data['manager'] === true) {
            console.log('manager');
            this.router.navigateByUrl('/manager');
          } else {
            this.router.navigateByUrl('/');
          }
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
