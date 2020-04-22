import { Component, OnInit } from '@angular/core';
import {UserService} from "../../services/user/user.service";
import {FbName} from "../../models/users";

@Component({
  selector: 'app-enemy-name',
  templateUrl: './enemy-name.component.html',
  styleUrls: ['./enemy-name.component.css']
})
export class EnemyNameComponent implements OnInit {

  public player: string;
  public photo: string;

  constructor(private userService: UserService) { }

  ngOnInit() {
    this.photo = this.userService.getCurrentEnemyPhoto() || '';
    this.player = this.userService.getCurrentEnemyName() || '';
  }

}
