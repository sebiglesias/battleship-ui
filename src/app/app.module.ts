import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { AppComponent } from './app.component';
import { HomeComponent } from './components/home/home.component';
import {RouterModule, Routes} from '@angular/router';
import { FacebookModule } from 'ngx-facebook';
import {UserService} from './services/user/user.service';
import { MenuComponent } from './components/menu/menu.component';
import { SocketIoModule, SocketIoConfig } from 'ng-socket-io';
import { HttpClientModule } from '@angular/common/http';
import { GameComponent } from './components/game/game.component';
import { BoardComponent } from './components/board/board.component';
import { NgDragDropModule } from 'ng-drag-drop';
import { ShipComponent } from './components/ship/ship.component';
import {AuthGuard} from './auth.guard';
import { UserNameComponent } from './components/user-name/user-name.component';
import { ShotComponent } from './components/shot/shot.component';
import { BoardContainerComponent } from './components/board-container/board-container.component';
import { EnemyNameComponent } from './components/enemy-name/enemy-name.component';
import {ServiceWorkerModule} from '@angular/service-worker';
import {environment} from '../environments/environment';
import {ShipInfoService} from './services/ship/ship-info.service';
import { SocialLoginModule, AuthServiceConfig } from 'angularx-social-login';
import { GoogleLoginProvider} from 'angularx-social-login';
import { SocialLoginComponent } from './components/social-login/social-login.component';

const CONFIG = new AuthServiceConfig([
  {
    id: GoogleLoginProvider.PROVIDER_ID,
    provider: new GoogleLoginProvider('1055700909378-q9fd0hur9au8620e7se9h6qhsih6g0sp.apps.googleusercontent.com')
  }
]);

export function provideConfig() {
  return CONFIG;
}

const routes: Routes = [
  { path: '', component: HomeComponent},
  { path: 'home', component: HomeComponent},
  { path: 'game', component: GameComponent, canActivate: [AuthGuard]},
];

// const config: SocketIoConfig = { url: 'http://52.14.84.4:3000', options: {} };
const config: SocketIoConfig = { url: 'http://localhost:3000', options: {} };

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    MenuComponent,
    GameComponent,
    BoardComponent,
    ShipComponent,
    UserNameComponent,
    ShotComponent,
    BoardContainerComponent,
    EnemyNameComponent,
    SocialLoginComponent,
  ],
  imports: [
    BrowserModule,
    RouterModule.forRoot(
      routes,
      { enableTracing: false } // <-- debugging purposes only
    ),
    FacebookModule.forRoot(),
    SocketIoModule.forRoot(config),
    HttpClientModule,
    NgDragDropModule.forRoot(),
    environment.production ? ServiceWorkerModule.register('/ngsw-worker.js') : [],
    SocialLoginModule,
  ],
  providers: [
    UserService,
    MenuComponent,
    AuthGuard,
    ShipInfoService,
    {
      provide: AuthServiceConfig,
      useFactory: provideConfig
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
