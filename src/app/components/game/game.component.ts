import {Component, OnInit, OnDestroy, ViewChild, ElementRef} from '@angular/core';
import {DropEvent} from 'ng-drag-drop';
import {BoardComponent} from '../board/board.component';
import * as M from 'materialize-css';
import {Socket} from 'ng-socket-io';
import {UserService} from '../../services/user/user.service';
import {Router} from '@angular/router';
import {Cell, InsertedShip} from '../../models/boardModels';
import {CompShot} from '../shot/shot.component';
import {ShipInfoService} from '../../services/ship/ship-info.service';


@Component({
  selector: 'app-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.scss']
})
export class GameComponent implements OnInit, OnDestroy {

  public orientation: boolean;
  // public totalCells = 2 + 2 + 2 + 3 + 3 + 4 + 5;
  public totalCells = 2 + 2;
  public shipTypes: ShipToBePlaced[];

  // 0 has the ships, el 1 has the shots
  public boards: BoardComponent[];

  // Turn variables
  public positioning: boolean;
  public startedGame: boolean;
  public myTurn: boolean;
  public totalShots: number;
  public autoFire: boolean;
  public announcerMessage: string;
  private messages: string[] = [
    'Set your fleet on position!',
    'Wait until your opponent finishes positioning their fleet',
    'Wait for your opponent\'s move!',
    'Make your move!',
    'You won!',
    'You lost!'
  ];

  // Timer variables
  public timer: number;
  private begin;
  private timerDuration = 20;

  public won;

  @ViewChild('modalF') modalF: ElementRef;
  @ViewChild('modalG') modalG: ElementRef;
  @ViewChild('wonByForfeit') wonByForfeit: ElementRef;

  constructor(
    private socket: Socket,
    private userService: UserService,
    private router: Router,
    public shipInfo: ShipInfoService) {

  }

  ngOnInit() {
    this.orientation = true;
    const boardComponent1 = new BoardComponent();
    boardComponent1.setShooting(false);
    boardComponent1.setName('player-board');
    boardComponent1.disabled = false;
    const boardComponent2 = new BoardComponent();
    boardComponent2.setShooting(true);
    boardComponent2.setName('enemy-board');
    boardComponent2.disabled = true;
    this.boards = [boardComponent1, boardComponent2];
    this.addShips();
    this.positioning = true;
    this.announcerMessage = this.messages[0];
    this.totalShots = 0;
    this.autoFire = false;
    this.refreshBoards();
    this.startTimer(this.timerDuration);
    if (this.userService.hasCurrentGameId()) {
      setTimeout(1000, this.socket.emit('reconnection', {
        gameId: this.userService.getGameId(),
        userID: this.userService.getCurrentUserID()
      }));
    }
    this.socket.on('rec', (res) => {
      // console.log('Rec message');
      // console.log(res);
    });
    this.socket.on('moveRes', (res) => {
      this.moveResponse(res);
    });
    this.socket.on('timeout', () => {
      this.won = false;
      this.announcerMessage = this.messages[6];
      this.openFinishedGameModal();
    });
  }

  ngOnDestroy(): void {
  }

  // Swap the orientation of the ships in the left-navbar
  onOrientationChange() {
    this.orientation = !this.orientation;
  }

  // used to sync the different actions emitted by boards (either ship movements or shots)
  processEvent(event) {
    switch (event.type) {
      case 'new-drop': {
        const info = event.info;
        const cell = this.boards[0].cells[info.r][info.c];
        cell.ship = info.ship;
        cell.ship.originColumn = info.c;
        cell.ship.originRow = info.r;
        this.boards[0].ships.push(new InsertedShip(info.r, info.c, info.ship));
        this.boards[0].occupyCells(cell.ship.size, info.r, info.c, cell.ship.horizontal);
        this.boards[0].fillNeighbourArea(cell.ship.size, info.r, info.c, cell.ship.horizontal);
        this.shipTypes = this.shipTypes.filter(ship => ship.id !== info.ship.id);
        break;
      }
      case 'removed': {
        const info = event.info;
        const originCell = this.boards[0].cells[info.row][info.column];
        this.boards[0].deOccupyCells(originCell.ship.size, info.row, info.column, originCell.ship.horizontal);
        this.boards[0].removeNeighbourArea(originCell.ship.size, info.row, info.column, originCell.ship.horizontal);
        this.boards[0].ships = this.boards[0].ships.filter(s => s.ship.originRow !== info.row && s.ship.originColumn !== info.column);
        originCell.ship = undefined;
        break;
      }
      case 'invalid-position': {
        M.toast({html: event.info});
        break;
      }
      case 'cleared-ship': {
        this.onShipReDrop(event.info);
        break;
      }
      case 'new-shot': {
        const info = event.info;
        this.performShot(info.row, info.column, this.userService.getCurrentUserID(), this.userService.getGameId());
        break;
      }
      case 'invalid-shot': {
        M.toast({html: event.info});
      }
    }
  }

  // erases all ships from my board and adds new ones with the same id to the left navbar
  clearBoard() {
    this.boards[0].clearBoard();
    this.addShips();
  }

  // random position the client's ships. It's brute force until I placed all ships
  randomPosition() {
    this.clearBoard();
    while (this.shipTypes.length > 0) {
      const r = this.getRandomValue();
      const c = this.getRandomValue();
      const horizontal = Math.random() > 0.5;
      const poppedShip = this.shipTypes.pop();
      const dropShip = {
        horizontal: horizontal,
        size: this.shipInfo.getShipSizeFromStr(poppedShip.shipType),
        shipType: poppedShip.shipType,
        img: this.shipInfo.getShipImgFromStr(poppedShip.shipType),
        style: this.shipInfo.getShipStylesFromStr(poppedShip.shipType)
      };
      const dropEvent = new DropEvent([], dropShip);
      if (this.boards[0].isValidPosition(dropEvent, r, c, false)) {
        this.boards[0].onShipDrop(dropEvent, r, c);
      } else {
        this.shipTypes.push(poppedShip);
      }
    }
  }

  // ships to be placed
  addShips() {
    this.shipTypes = [];
    this.shipTypes.push(new ShipToBePlaced('SMALL', '1'));
    this.shipTypes.push(new ShipToBePlaced('SMALL', '2'));
    // this.shipTypes.push(new ShipToBePlaced('SMALL', '3'));
    // this.shipTypes.push(new ShipToBePlaced('MEDIUM', '4'));
    // this.shipTypes.push(new ShipToBePlaced('MEDIUM', '5'));
    // this.shipTypes.push(new ShipToBePlaced('LARGE', '6'));
    // this.shipTypes.push(new ShipToBePlaced('HUGE', '7'));
    // this.shipTypes.push('LARGE');
  }

  // receives the drop event and filters the dragData
  onShipReDropEvent(event: DropEvent) {
    this.onShipReDrop(event.dragData);
  }

  // when dropping a ship onto the left navbar, the ship needs to be removed from the board
  onShipReDrop(data: any) {
    if (data.originRow && data.originColumn) {
      this.shipTypes.push(new ShipToBePlaced(data.shipType, data.id));
      this.boards[0].removeShip(data.originRow, data.originColumn);
    }
  }

  // takes into account the stage of the game (positioning or shooting) and dis/enables the boards respectively
  refreshBoards() {
    if (this.positioning) {
      this.boards[0].disabled = false;
      this.boards[1].disabled = true;
    } else if (this.startedGame) {
      this.boards[0].disabled = true;
      this.boards[1].disabled = !this.myTurn;
    }
  }

  // send the positioned ships info to the game server
  finishPositioning() {
    if (this.shipTypes.length === 0) {
      this.notifyPositionEnd();
      this.announcerMessage = this.messages[1];
      this.boards[0].disabled = true;
      this.clearTimer();
    } else {
      M.toast({html: 'You need to position ALL your ships'});
    }
  }

  notifyPositionEnd() {
    const info = this.boards[0].getInfo();
    // console.log('Board Info to send to the server');
    info.gameId = this.userService.getGameId();
    info.playerId = this.userService.getCurrentUserID();
    // console.log(info);
    this.socket.emit('startGame', info);
  }

  // process incoming board info from game server and draws accordingly (visualizes board data and turn info). Also processes the auto-fire
  moveResponse(res) {
    if (res.turn === undefined && res.myBoard === undefined) {
      this.clearBoard();
      this.refreshBoards();
    } else {
      this.clearTimer();
      this.positioning = false;
      this.startedGame = true;
      const currentUserID = this.userService.getCurrentUserID();
      // console.log('Inside moveResponse method');
      // console.log(res);
      this.changeTurn(currentUserID === res.turn);
      this.receiveBoards(res.myBoard, res.boardOpponent);
      this.receiveDestroyedShips(res.destroyedShips);
      this.startTimer(this.timerDuration);
      if (res.winner !== undefined) {
        this.clearTimer();
        if (currentUserID === res.winner) {
          this.announcerMessage = this.messages[4];
          this.won = true;
          this.openFinishedGameModal();
        } else if (res.winner === 'abandon') {
          this.announcerMessage = this.messages[4];
          this.won = true;
          this.openWonAbandonModal();
        } else {
          this.won = false;
          this.announcerMessage = this.messages[6];
          this.openFinishedGameModal();
        }
      } else {
        this.randomFire();
      }
    }
  }

  // interpret both boards and draw respectively
  receiveBoards(myBoard, boardOpponent) {
    // this.boards[0].cells = myBoard.cells;
    this.boards[0].ships = myBoard.ships;
    this.boards[0].totalCells = myBoard.totalCells;
    this.totalShots = myBoard.totalShots;
    this.interpretMyBoard(myBoard.cells);
    this.interpretBoardOpponent(new BoardOpponent(boardOpponent));
    this.refreshBoards();
  }

  // draws destroyedShips
  receiveDestroyedShips(destroyedShips) {
    if (destroyedShips) {
      for (let i = 0; i < destroyedShips.length; i++) {
        const shipCells = destroyedShips[i].cells;
        for (let j = 0; j < shipCells; j++) {
          const row = shipCells[j].row;
          const column = shipCells[j].column;
          if (shipCells.ship) {
            this.boards[1].cells[row][column].ship = shipCells.ship;
          }
        }
      }
    }
  }

  // draw the client's ships and received shots
  interpretMyBoard(myBoardCells) {
    for (let i = 0; i <= 12; i++) {
      for (let j = 0; j <= 12; j++) {
        const occupied = myBoardCells[i][j].occupied;
        const shot = myBoardCells[i][j].shot.hit !== undefined;
        if (occupied && shot) {
          this.boards[0].cells[i][j] = new Cell(i, j, occupied, new CompShot(i, j, true));
          this.boards[0].cells[i][j].ship = myBoardCells[i][j].ship;
        } else if (!occupied && shot) {
          this.boards[0].cells[i][j] = new Cell(i, j, occupied, new CompShot(i, j, false));
        } else {
          this.boards[0].cells[i][j] = new Cell(i, j, occupied);
          this.boards[0].cells[i][j].ship = myBoardCells[i][j].ship;
        }
      }
    }
  }

  // draw the enemy's ships and performed shots
  interpretBoardOpponent(boardOpponent: BoardOpponent) {
    const eCells = boardOpponent.enemyCells;
    for (let i = 0; i <= 12; i++) {
      for (let j = 0; j <= 12; j++) {
        const occupied = eCells[i][j].occupied;
        const shot = eCells[i][j].shooted;
        if (occupied && shot) {
          this.boards[1].cells[i][j] = new Cell(i, j, occupied, new CompShot(i, j, true));
        } else if (!occupied && shot) {
          this.boards[1].cells[i][j] = new Cell(i, j, occupied, new CompShot(i, j, false));
        } else {
          this.boards[1].cells[i][j] = new Cell(i, j, occupied);
        }
      }
    }
  }

  // disable and enable the enemy board for shooting depending on my turn
  changeTurn(myTurn: boolean) {
    if (myTurn) {
      this.myTurn = true;
      this.boards[1].disabled = false;
      this.announcerMessage = this.messages[3];
    } else {
      this.myTurn = false;
      this.announcerMessage = this.messages[2];
    }
  }

  // return to home and erase any game trace
  endGame() {
    this.router.navigate(['home']);
    this.userService.removeGame();
  }

  // inform the game server of the forfeit and finish game
  forfeit() {
    // console.log('Send Abandon emit');
    if (this.userService.getGameId() !== undefined) {
      this.socket.emit('abandon',
        {
          gameId: this.userService.getGameId(),
          playerId: this.userService.getCurrentUserID()
        });
    }
    this.endGame();
  }

  // turn autofire on or off
  autoFireChange() {
    this.autoFire = !this.autoFire;
    if (this.autoFire) {
      this.randomFire();
    }
  }

  // super dumb brute force random fire, randomly chosen row and column
  randomFire() {
    if (!this.boards[1].disabled && this.autoFire) {
      let stopCondition = true;
      while (stopCondition) {
        const r = this.getRandomValue();
        const c = this.getRandomValue();
        if (this.boards[1].isValidShot(r, c)) {
          this.performShot(r, c, this.userService.getCurrentUserID(), this.userService.getGameId());
          stopCondition = false;
        }
      }
    }
  }

  private getRandomValue(): number {
    return Math.floor(Math.random() * 13);
  }

  // shoot the enemy and end turn
  private performShot(row, column, userID, gameId) {
    this.boards[1].disabled = true;
    // console.log('New-shot Event info');
    const newShotInfo = {
      row: row,
      column: column,
      userID: userID,
      gameId: gameId
    };
    // console.log(newShotInfo);
    // console.log('Send move emit');
    this.socket.emit('move', newShotInfo);
  }

  // start countdown. Begin variable is initialized in order to clear it and reset the timer later
  startTimer(duration) {
    this.timer = duration;
    this.begin = setInterval(() => {
      if (this.timer > 0) {
        --this.timer;
      } else if (this.myTurn && !this.positioning) {
        this.timer = duration;
        this.forfeit();
      }
    }, 1000);
  }

  // reset timer
  clearTimer() {
    clearInterval(this.begin);
  }

  // modal shown to confirm forfeit
  public openForfeitModal() {
    this.modalF.nativeElement.style.display = 'block';
  }

  public hideForfeitModal() {
    this.modalF.nativeElement.style.display = 'none';
  }

  // modal shown after ending the game
  public openFinishedGameModal() {
    this.modalG.nativeElement.style.display = 'block';
  }

  public openWonAbandonModal() {
    this.wonByForfeit.nativeElement.style.display = 'block';
  }

}

// model for ships in the left nav-bar
export class ShipToBePlaced {
  shipType: string;
  id: string;

  constructor(shipType: string, id: string) {
    this.shipType = shipType;
    this.id = id;
  }
}

// enemy board requires more logic than own board for shots
export class BoardOpponent {
  enemyCells: EnemyCell[][];

  constructor(enemyCells) {
    this.enemyCells = enemyCells;
  }
}

export class EnemyCell {
  private id: string;
  row: number;
  column: number;
  occupied: boolean;
  shooted: boolean;

  constructor(id, row, column, occupied, shooted) {
    this.id = id;
    this.row = row;
    this.column = column;
    this.occupied = occupied;
    this.shooted = shooted;
  }
}
