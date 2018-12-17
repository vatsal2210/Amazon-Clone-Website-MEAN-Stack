import { Component, OnInit } from '@angular/core';
import { RestapiService } from '../restapi.service';
import { AlertService } from '../alert.service';
import { UserService } from '../user.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {
  usersDetails;

  constructor(private rest: RestapiService, private alert: AlertService, private user: UserService, private router: Router) { }

  async ngOnInit() {
    try {
      const data = await this.rest.get('/api/profile');
      console.log(data);
      data['success'] ? (this.usersDetails = data['user']) : this.alert.error('Could not fetch details!');
    } catch (error) {
      this.alert.error(error['message']);
    }
  }

}
