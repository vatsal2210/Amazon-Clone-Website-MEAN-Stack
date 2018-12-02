import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { AlertService } from '../alert.service';
import { RestapiService } from '../restapi.service';
import { UserService } from '../user.service';

@Component({
  selector: 'app-registration',
  templateUrl: './registration.component.html',
  styleUrls: ['./registration.component.css']
})
export class RegistrationComponent implements OnInit {

  name = '';
  email = '';
  password = '';
  password1 = '';

  btnDisabled = false;

  constructor(private router: Router, private alert: AlertService, private rest: RestapiService, private user: UserService) { }

  ngOnInit() {
  }

  validate() {
    if (this.name) {
      if (this.email) {
        if (this.password) {
          if (this.password1) {
            if (this.password === this.password1) {
              return true;
            } else {
              this.alert.error('Password do not match.');
            }
          } else {
            this.alert.error('Confirmation Password is not entered');
          }
        } else {
          this.alert.error('Password is not entered');
        }
      } else {
        this.alert.error('Email is not entered');
      }
    } else {
      this.alert.error('Name is not entered');
    }
  }

  async register() {
    this.btnDisabled = true;
    try {
      if (this.validate()) {
        const data = await this.rest.post('/api/signup', {
          name: this.name,
          email: this.email,
          password: this.password,
        });

        if (data['success']) {
          localStorage.setItem('token', data['token']);
          await this.user.getProfile();
          this.router.navigate(['login'])
            .then(() => {
              this.alert.success(data['message']);
            })
            .catch(error => this.alert.error(error));
        } else {
          console.log('error found ', data['message']);
          this.alert.error(data['message']);
        }
      }
    } catch (error) {
      this.alert.error(error['message']);
    }

    this.btnDisabled = false;
  }

}
