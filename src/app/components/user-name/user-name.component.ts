import { Component, OnInit } from '@angular/core';
import {UserService} from "../../services/user/user.service";
import {FbName} from "../../models/users";

@Component({
  selector: 'app-user-name',
  templateUrl: './user-name.component.html',
  styleUrls: ['./user-name.component.css']
})
export class UserNameComponent implements OnInit {

  public player: string;
  public photo: string;

  constructor(private userService: UserService) { }

  ngOnInit() {
    this.photo = this.userService.getCurrentUserPhoto();
    this.player = this.userService.getCurrentUserName();
  }
}
