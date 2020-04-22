import {Injectable} from '@angular/core';
import 'rxjs/add/observable/of';
import 'rxjs/add/operator/filter';
import 'rxjs/add/observable/fromPromise';
import {HttpClient} from '@angular/common/http';
import {Socket} from 'ng-socket-io';
import { AuthService } from "angularx-social-login";
import { GoogleLoginProvider } from "angularx-social-login";
import { SocialUser } from "angularx-social-login";



@Injectable()
export class UserService {

  private currentUser: SocialUser;

  constructor(private http: HttpClient, private socket: Socket, private authService: AuthService) {

    this.currentUser = undefined;

    this.socket.on('user',  (res) => {
      // console.log('Websocket user socket.on');
      // console.log(res);
      localStorage.setItem('userID', res.id);
      localStorage.setItem('hits', res.hits);
      localStorage.setItem('lost', res.lost);
      localStorage.setItem('wins', res.win);
      localStorage.setItem('totalShoots', res.totalShoots);
    });
  }

  signInWithGoogle(): void {
    this.authService.signIn(GoogleLoginProvider.PROVIDER_ID).then( (response: SocialUser) => {
      // console.log(response);
      this.currentUser = response;
      localStorage.setItem('name', response.name);
      localStorage.setItem('facebookId' , this.currentUser.id);
      localStorage.setItem('photo', response.photoUrl);
      this.socket.emit('login', response.id)
    } ).catch();
  }

  signOut(): void {
    this.authService.signOut();
    this.logout();
  }

  // loginWithFacebook(): Observable<boolean> {
    // return Observable.fromPromise(this.fb.login()
    //   .then((response: LoginResponse) => {
    //     if (response.status === 'connected') {
    //       this.currentUser = response.authResponse;
    //       this.fb.api('/' + this.currentUser.userID, 'get').then( (res) => {
    //         localStorage.setItem('name', res.name);
    //       });
    //       localStorage.setItem('facebookId', this.currentUser.userID);
    //       localStorage.setItem('photo', 'https://graph.facebook.com/' + this.currentUser.userID + '/picture?type=small');
    //       console.log('Send Login emit');
    //       this.socket.emit('login', this.currentUser.userID);
    //       return true;
    //     }
    //   })
    //   .catch((error: any) => {
    //     // console.error(error);
    //     return false;
    //   }));
  // }

  logout() {
    this.socket.emit('logout', {
      playerId: this.getCurrentUserID()
    });
    localStorage.removeItem('gameId');
    localStorage.removeItem('userID');
    localStorage.removeItem('facebookId');
    localStorage.removeItem('photo');
    localStorage.removeItem('name');
    localStorage.removeItem('hits');
    localStorage.removeItem('lost');
    localStorage.removeItem('wins');
    localStorage.removeItem('totalShoots');
    localStorage.removeItem('enemy');
    localStorage.removeItem('enemyName');
    localStorage.removeItem('enemyPhoto');
    this.currentUser = undefined;
  }

  hasCurrentUser(): boolean {
    return !!localStorage.getItem('userID');
  }

  getCurrentUserID() {
    if (this.hasCurrentUser()) {
      return localStorage.getItem('userID');
    }
  }

  getCurrentUserFacebookID() {
    return localStorage.getItem('facebookId');
  }

  getEnemyUserID() {
    return localStorage.getItem('enemy');
  }

  getUserWins(): number {
    if (this.hasCurrentUser()) {
      return +localStorage.getItem('wins');
    }
  }

  getUserLosses(): number {
    if (this.hasCurrentUser()) {
      return +localStorage.getItem('lost');
    }
  }

  getCurrentUserName(): string {
    if (this.hasCurrentUser()) {
      return localStorage.getItem('name');
    }
    return '';
  }

  getGameId() {
    if (this.hasCurrentGameId()) {
      return localStorage.getItem('gameId');
    }
  }

  getCurrentUserPhoto(): string {
    if (this.hasCurrentUser())  {
      return localStorage.getItem('photo');
    }
    return '';
  }

  public hasCurrentGameId() {
    return !!localStorage.getItem('gameId');
  }

  removeGame() {
    localStorage.removeItem('gameId');
  }

  setGame(game) {
    const playerA = game.playerA;
    const playerB = game.playerA;
    const fbId = this.getCurrentUserFacebookID();
    if (playerA.facebookId === fbId) {
      localStorage.setItem('enemy', playerB.facebookId);
      localStorage.setItem('enemyName', playerB.name);
      localStorage.setItem('enemyPhoto', playerB.photo);
    } else {
      localStorage.setItem('enemy', playerA.facebookId);
      localStorage.setItem('enemyName', playerA.name);
      localStorage.setItem('enemyPhoto', playerA.photo);
    }
    localStorage.setItem('gameId', game.gameId);
  }

  getUserHits() {
    return +localStorage.getItem('hits');
  }

  getTotalShoots() {
    return +localStorage.getItem('totalShoots');
  }

  getCurrentEnemyPhoto() {
    return localStorage.getItem('enemyPhoto');
  }

  getCurrentEnemyName() {
    return localStorage.getItem('enemyName');
  }

  setEnemyId(facebookId: string) {

  }
}

