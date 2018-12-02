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
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.css']
})
export class UsersComponent implements OnInit {
  users;
  action;
  userId;
  value;

  constructor(private rest: RestapiService, private alert: AlertService, private router: Router) { }
  @ViewChild('dismissFrame1') dismissFrame1: ElementRef;

  async ngOnInit() {
    const data = await this.rest.get('/admin/getUsers');
    this.users = data['users'];
    console.log('in users ', this.users);
  }

  async changeStatus(id, value) {
    this.userId = id;
    this.value = value === 0 ? 'false' : 'true';
    console.log('changeStatus', this.userId, this.value);
    this.action = 1;
  }

  async changeManagerStatus(id, value) {
    this.userId = id;
    this.value = value === 0 ? 'false' : 'true';
    console.log('changeManagerStatus', this.userId, this.value);
    this.action = 2;
  }

  async confirmation() {
    this.dismissFrame1.nativeElement.click();
    console.log(this.action, this.userId, this.value);
    if (this.action === 1) {
      console.log('Call change status api');
      const data = await this.rest.post('/admin/changeUserStatus', {
        id: this.userId,
        isActive: this.value
      });

      if (data['success']) {
        this.alert.success(data['message']);
        const userdata = await this.rest.get('/admin/getUsers');
        this.users = userdata['users'];
      } else {
        this.alert.error(data['message']);
      }

    } else if (this.action === 2) {
      console.log('call manager status update');
      const data = await this.rest.post('/admin/changeManagerStatus', {
        id: this.userId,
        isManager: this.value
      });

      if (data['success']) {
        this.alert.success(data['message']);
        const userdata = await this.rest.get('/admin/getUsers');
        this.users = userdata['users'];
      } else {
        this.alert.error(data['message']);
      }
    } else {
      console.log('Something went wrong');
      this.alert.error(['Something went wrong. Try Again']);
    }
  }

}
