import {Component, OnInit} from '@angular/core';
import {Router} from '@angular/router';
import {UserService} from '../../services/user/user.service';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/first';
import {Socket} from 'ng-socket-io';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {


  constructor(private userService: UserService, private router: Router, private socket: Socket) {
  }

  ngOnInit() {

  }

  login() {
    // this.userService.loginWithFacebook();
    this.userService.signInWithGoogle();
  }

  logout() {
    this.userService.logout();
    this.router.navigate(['home']);
  }

  isUserAuthenticated(): boolean {
    return this.userService.hasCurrentUser();
  }

  processEvent(event) {
    // console.log(event);
  }

}
