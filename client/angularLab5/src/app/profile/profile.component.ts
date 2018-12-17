import { Component, OnInit } from '@angular/core';
import { RestapiService } from '../restapi.service';
import { AlertService } from '../alert.service';
import { UserService } from '../user.service';
import { Router } from '@angular/router';
import { ReactiveFormsModule, FormControl, Validators } from '@angular/forms';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {
  usersDetails;
  emailDisable = true;
  name = new FormControl('', Validators.required);
  id = new FormControl('', Validators.required);

  constructor(private rest: RestapiService, private alert: AlertService, private user: UserService, private router: Router) { }

  async ngOnInit() {
    try {
      const data = await this.rest.get('/api/profile');
      console.log(data);
      data['success'] ? (this.usersDetails = data['user']) : this.alert.error('Could not fetch details!');
      this.name.setValue(this.usersDetails.name);
      this.id.setValue(this.usersDetails._id);
    } catch (error) {
      this.alert.error(error['message']);
    }
  }

  async updateProfile() {
    console.log('update name');
    if ((this.usersDetails.name !== this.name.value) && (this.name.value.length > 0)) {
      const data = await this.rest.post('/api/updateprofile', {
        id: this.id.value,
        name: this.name.value
      });

      if (data['success']) {
        this.alert.success(data['message']);
        this.name.setValue(this.name.value);
        await this.rest.get('/api/profile');
      } else {
        this.alert.error(data['message']);
      }
    } else {
      console.log('no change is name');
    }
  }

}
