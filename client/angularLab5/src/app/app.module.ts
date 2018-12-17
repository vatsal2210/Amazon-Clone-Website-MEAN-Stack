import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { MDBBootstrapModule } from 'angular-bootstrap-md';
import { ModalModule, WavesModule, InputsModule } from 'angular-bootstrap-md';
import { CarouselModule, CardsFreeModule, ButtonsModule } from 'angular-bootstrap-md';
import { FormsModule, FormControl, Validators, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

import { AlertService } from './alert.service';
import { UserService } from './user.service';
import { RestapiService } from './restapi.service';
import { CartService } from './cart.service';

import { LoginComponent } from './login/login.component';
import { RegistrationComponent } from './registration/registration.component';
import { HomeComponent } from './home/home.component';
import { ProfileComponent } from './profile/profile.component';
import { CartComponent } from './cart/cart.component';
import { AlertComponent } from './alert/alert.component';
import { ManagerComponent } from './manager/manager.component';
import { UsersComponent } from './admin/users/users.component';
import { ProductsComponent } from './admin/products/products.component';
import { CollectionComponent } from './collection/collection.component';

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    RegistrationComponent,
    HomeComponent,
    ProfileComponent,
    CartComponent,
    AlertComponent,
    ManagerComponent,
    UsersComponent,
    ProductsComponent,
    CollectionComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    NgbModule.forRoot(),
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    MDBBootstrapModule.forRoot(),
    CarouselModule, ModalModule, WavesModule, InputsModule, ButtonsModule, CardsFreeModule
  ],
  providers: [AlertService, UserService, RestapiService, CartService],
  bootstrap: [AppComponent]
})
export class AppModule { }
