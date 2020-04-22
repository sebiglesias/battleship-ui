import {Component, EventEmitter, OnInit, Output} from '@angular/core';
import {Socket} from 'ng-socket-io';
import {UserService} from '../../services/user/user.service';
import {Router} from '@angular/router';


@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.css']
})
export class MenuComponent implements OnInit {

  public player: string;
  public looking4game: boolean;
  @Output() eventEmitter = new EventEmitter();
  public wins: number;
  public losses: number;
  public hits: number;
  public totalShoots: number;
  public winLossRatio: number;
  public hitMissRatio: number;

  constructor(private socket: Socket, private userService: UserService, private router: Router) {
    this.socket.on('game', (res) => {
      // console.log('Inside on Game');
      // console.log(res);
    });
    this.socket.on('newGame', (res) => {
      // console.log('Inside on newGame');
      // console.log(res);
      this.userService.setGame(res);
      this.router.navigate(['game']);
    });
    this.socket.on('canceledGame', (res) => {
      // console.log('Inside on canceledGame');
      // console.log(res);
    });
  }

  ngOnInit() {
    this.player = this.userService.getCurrentUserName();
    this.wins = this.userService.getUserWins() || 0;
    this.losses = this.userService.getUserLosses() || 0;
    this.hits = this.userService.getUserHits() || 0;
    this.totalShoots = this.userService.getTotalShoots() || 0;
    if (this.losses > 0 || this.wins > 0) {
      this.winLossRatio = (this.wins / (this.wins + this.losses)) * 100;
    } else {
      this.winLossRatio = undefined;
    }
    if (this.totalShoots > 0) {
      this.hitMissRatio = (this.hits / (this.totalShoots)) * 100;
    } else {
      this.hitMissRatio = undefined;
    }
    this.looking4game = false;
    if (this.userService.getCurrentUserID() !== undefined) {
      // console.log('reconnecting');
      this.socket.emit('reconnection', {
        userID: this.userService.getCurrentUserID().replace(/['"]+/g, ''),
        facebookId: (this.userService.getCurrentUserFacebookID() || '').replace(/['"]+/g, ''),
        photo: this.userService.getCurrentUserPhoto(),
        name: this.userService.getCurrentUserName()
      });
    }
  }

  logout() {
    this.router.navigate(['home']).then(
      () => this.userService.logout()
    );
  }

  lookForGame() {
    this.looking4game = true;
    // console.log('Send play emit');
    if (this.looking4game)this.socket.emit('play', {
      facebookId: this.userService.getCurrentUserFacebookID(),
      playerId: this.userService.getCurrentUserID(),
      photo: this.userService.getCurrentUserPhoto(),
      name: this.userService.getCurrentUserName()
    });
  }

  stopLookingForGame() {
    this.looking4game = false;
    // console.log('Send cancelplay emit');
    this.socket.emit('cancelPlay');
  }
}
