import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { UserService } from './user.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})

export class AppComponent implements OnInit {

  title = 'Lab5';
  isManager;

  constructor(private router: Router, private user: UserService) { }

  async ngOnInit() {
    await this.user.getProfile();
    console.log('app', this.user.isManager);
    this.isManager = this.user.isManager;
  }

  get token() {
    const token = localStorage.getItem('token');
    return token;
  }

  logout() {
    this.user.user = {};
    localStorage.clear();
    this.router.navigate(['']);
  }

}
