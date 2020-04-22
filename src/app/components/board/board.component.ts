import {Component, OnInit, EventEmitter, Input, Output, OnChanges, SimpleChanges} from '@angular/core';
import {Ship} from '../../models/ships';
import {DropEvent} from 'ng-drag-drop';
import {ShipMessage} from '../../models/messages';
import {CompShot} from '../shot/shot.component';
import {BoardInfo, Cell, InfoShip, InsertedShip} from '../../models/boardModels';

@Component({
  selector: 'app-board',
  templateUrl: './board.component.html',
  styleUrls: ['./board.component.css']
})

export class BoardComponent implements OnInit, OnChanges {

  @Input()
  public board: BoardComponent;

  // cells = Cell[row][column]
  public cells: Cell[][];
  public totalCells = 12;
  public name: string;
  public ships: InsertedShip[];

  @Input()
  public disabled: boolean;

  @Input()
  public shooting: boolean;

  @Output() eventEmitter = new EventEmitter();

  constructor() {
    this.ngOnInit();
  }

  ngOnInit() {
    this.cells = [];
    if (this.board === undefined) {
      for (let i = 0; i <= this.totalCells; i++) {
        this.cells[i] = [];
        for (let j = 0; j <= this.totalCells; j++) {
          this.cells[i][j] = new Cell(i, j);
        }
      }
    } else {
      this.cells = this.board.cells;
    }
    if (this.board) this.shooting = this.board.shooting;
    this.ships = [];
  }

  ngOnChanges(changes: SimpleChanges) {
    for (let propName in changes) {
      if (propName === 'board') {
        const b: BoardComponent = changes[propName].currentValue;
        this.cells = b.cells;
      }
    }
  }

  onShipDrop(ship: DropEvent, r: number, c: number): boolean {
    if (!this.shooting && !this.disabled) {
      if (this.isValidPosition(ship, r, c, true)) {
        const cell = this.cells[r][c];
        const originCol = ship.dragData.originColumn;
        const originRow = ship.dragData.originRow;
        if (originCol !== undefined && originRow !== undefined) {
          this.removeShip(originRow, originCol);
        }
        cell.ship = ship.dragData;
        cell.ship.originColumn = c;
        cell.ship.originRow = r;
        this.ships.push(new InsertedShip(r, c, ship.dragData));
        this.occupyCells(cell.ship.size, r, c, cell.ship.horizontal);
        this.fillNeighbourArea(cell.ship.size, r, c, cell.ship.horizontal);
        const message = new ShipMessage('new-drop', {r: r, c: c, ship: ship.dragData});
        this.eventEmitter.emit(message);
      }
      return true;
    } else {
      const message = new ShipMessage('invalid-shot', 'You are not allowed to perform this action now');
      this.eventEmitter.emit(message);
      return false;
    }
  }

  onCellClick(r: number, c: number) {
    let message;
    if (this.shooting && !this.disabled) {
      const cell = this.cells[r][c];
      if (cell.shot.hit === undefined) {
        message = new ShipMessage('new-shot', new CompShot(r, c));
      } else {
        message = new ShipMessage('invalid-shot', 'You already shot the cell (' + r + ', ' + c + ')');
      }
    } else if (!this.shooting) {
      message = new ShipMessage('invalid-shot', 'You are not allowed to shoot in this board');
    } else {
      message = new ShipMessage('invalid-shot', 'You are not allowed to shoot now');
    }
    this.eventEmitter.emit(message);
  }

  isValidShot(r: number, c: number): boolean {
    return !this.cells[r][c].shot.hit;
  }

  removeShip(row: number, column: number) {
    const originCell = this.cells[row][column];
    this.deOccupyCells(originCell.ship.size, row, column, originCell.ship.horizontal);
    this.removeNeighbourArea(originCell.ship.size, row, column, originCell.ship.horizontal);
    this.ships = this.ships.filter(s => s.ship.originRow !== row && s.ship.originColumn != column);
    const message = new ShipMessage('removed', {row: row, column: column});
    this.eventEmitter.emit(message);
    originCell.ship = undefined;
  }

  public occupyCells(size: number, r: number, c: number, horizontal: boolean) {
    this.changeOccupied(size, r, c, horizontal, true);
  }

  public deOccupyCells(size: number, r: number, c: number, horizontal: boolean) {
    this.changeOccupied(size, r, c, horizontal, false);
  }

  private changeOccupied(size: number, r: number, c: number, horizontal: boolean, value: boolean) {
    if (horizontal) {
      if (this.isInside(size, r, c, horizontal)) {
        for (let i = c; i < c + size; i++) {
          this.cells[r][i].occupied = value;
        }
      }
    } else {
      if (this.isInside(size, r, c, horizontal)) {
        for (let i = r; i < r + size; i++) {
          this.cells[i][c].occupied = value;
        }
      }
    }
  }

  public isValidPosition(e: DropEvent, r: number, c: number, showErrors: boolean) {
    const ship = e.dragData;
    const size: number = ship.size;
    const h: boolean = ship.horizontal;
    if (!this.isInside(size, r, c, h)) {
      if (showErrors) {
        const message = new ShipMessage('invalid-position', 'The position you selected leaves the ship outside of the board!');
        this.eventEmitter.emit(message);
      }
      return false;
    }
    if (this.areCellsOccupied(size, r, c, h)) {
      if (showErrors) {
        const message = new ShipMessage('invalid-position', 'The position you selected is occupied by another ship!');
        this.eventEmitter.emit(message);
      }
      return false;
    }
    // if (this.isInNeighbourArea(size, r, c, h)) {
    //   const message = new ShipMessage('invalid-position', 'You need to have at least 1 empty space in between ships!');
    //   this.eventEmitter.emit(message);
    //   return false;
    // }
    return true;
  }

  private areCellsOccupied(size: number, r: number, c: number, horizontal: boolean): boolean {
    let occupied = false;
    if (horizontal) {
      if (this.isInside(size, r, c, horizontal)) {
        for (let i = c; i < c + size; i++) {
          if (this.cells[r][i].occupied) {
            occupied = true;
          }
        }
        return occupied;
      }
    } else {
      if (this.isInside(size, r, c, horizontal)) {
        for (let i = r; i < r + size; i++) {
          if (this.cells[i][c].occupied) {
            occupied = true;
          }
        }
        return occupied;
      }
    }
    return occupied;
  }

  private isInside(size: number, r: number, c: number, horizontal: boolean): boolean {
    if (horizontal) {
      return r >= 0 && r <= this.totalCells && c >= 0 && c <= this.totalCells && c + size <= this.totalCells + 1;
    } else {
      return r >= 0 && r <= this.totalCells && c >= 0 && c <= this.totalCells && r + size <= this.totalCells + 1;
    }
  }

  // NeighbourArea is buggy, so it is now commented.
  private isInNeighbourArea(size: number, r: number, c: number, horizontal: boolean): boolean {
    let occupied = false;
    if (horizontal) {
      if (this.isInside(size, r, c, horizontal)) {
        for (let i = c; i < c + size; i++) {
          if (this.cells[r][i].isValid) {
            occupied = true;
          }
        }
        return occupied;
      }
    } else {
      if (this.isInside(size, r, c, horizontal)) {
        for (let i = r; i < r + size; i++) {
          if (this.cells[i][c].isValid) {
            occupied = true;
          }
        }
        return occupied;
      }
    }
    return occupied;
  }

  public fillNeighbourArea(size: number, r: number, c: number, horizontal: boolean) {
    this.changeNeighbourArea(size, r, c, horizontal, true);
  }

  removeNeighbourArea(size: number, r: number, c: number, horizontal: boolean) {
    this.changeNeighbourArea(size, r, c, horizontal, false);
  }

  changeNeighbourArea(size: number, r: number, c: number, horizontal: boolean, value: boolean) {
    if (horizontal) {
      if (r === 0) {
        if (c === 0) {
          for (let i = c; i <= c + size; i++) {
            this.cells[r + 1][i].isValid = value;
          }
          this.cells[r][c + size].isValid = value;
        } else if (c > 0 && c + size < this.totalCells - 1) {
          for (let i = c; i <= c + size; i++) {
            this.cells[r + 1][i].isValid = value;
          }
          this.cells[r][c - 1].isValid = value;
          this.cells[r][c + size].isValid = value;
        } else if (c + size === this.totalCells - 1) {
          for (let i = c; i <= c + size; i++) {
            this.cells[r + 1][i].isValid = value;
          }
          this.cells[r][c - 1].isValid = value;
        }
      } else if (r > 0 && r < this.totalCells) {
        if (c === 0) {
          for (let i = c; i <= c + size; i++) {
            this.cells[r - 1][i].isValid = value;
            this.cells[r + 1][i].isValid = value;
          }
          this.cells[r][c + size].isValid = value;
        } else if (c > 0 && c + size < this.totalCells - 1) {
          for (let i = c; i <= c + size; i++) {
            this.cells[r - 1][i].isValid = value;
            this.cells[r + 1][i].isValid = value;
          }
          this.cells[r][c - 1].isValid = value;
          this.cells[r][c + size].isValid = value;
        } else if (c + size === this.totalCells - 1) {
          for (let i = c; i <= c + size; i++) {
            this.cells[r - 1][i].isValid = value;
            this.cells[r + 1][i].isValid = value;
          }
          this.cells[r][c - 1].isValid = value;
        }
      } else if (r === this.totalCells) {
        if (c === 0) {
          for (let i = c; i <= c + size; i++) {
            this.cells[r - 1][i].isValid = value;
          }
          this.cells[r][c + size].isValid = value;
        } else if (c > 0 && c + size < this.totalCells - 1) {
          for (let i = c; i <= c + size; i++) {
            this.cells[r - 1][i].isValid = value;
          }
          this.cells[r][c - 1].isValid = value;
          this.cells[r][c + size].isValid = value;
        } else if (c + size === this.totalCells - 1) {
          for (let i = c; i <= c + size; i++) {
            this.cells[r - 1][i].isValid = value;
          }
          this.cells[r][c - 1].isValid = value;
        }
      }
    } else {
      if (c === 0) {
        if (r === 0) {
          for (let i = r; i <= r + size; i++) {
            this.cells[i][c + 1].isValid = value;
          }
          this.cells[r + size][c].isValid = value;
        } else if (r > 0 && r + size < this.totalCells - 1) {
          for (let i = r; i <= r + size; i++) {
            this.cells[i][c + 1].isValid = value;
          }
          this.cells[r - 1][c].isValid = value;
          this.cells[r + size][c].isValid = value;
        } else if (r + size === this.totalCells - 1) {
          for (let i = r; i <= r + size; i++) {
            this.cells[i][c + 1].isValid = value;
          }
          this.cells[r - 1][c].isValid = value;
        }
      } else if (c > 0 && c < this.totalCells) {
        if (r === 0) {
          for (let i = r; i <= r + size; i++) {
            this.cells[i][c - 1].isValid = value;
            this.cells[i][c + 1].isValid = value;
          }
          this.cells[r = size][c].isValid = value;
        } else if (r > 0 && r + size < this.totalCells - 1) {
          for (let i = r; i <= r + size; i++) {
            this.cells[r - 1][i].isValid = value;
            this.cells[r + 1][i].isValid = value;
          }
          this.cells[r - 1][c].isValid = value;
          this.cells[r + size][c].isValid = value;
        } else if (r + size === this.totalCells - 1) {
          for (let i = r; i <= r + size; i++) {
            this.cells[i][c - 1].isValid = value;
            this.cells[i][c + 1].isValid = value;
          }
          this.cells[r - 1][c].isValid = value;
        }
      } else if (r === this.totalCells) {
        if (r === 0) {
          for (let i = r; i <= r + size; i++) {
            this.cells[i][c - 1].isValid = value;
          }
          this.cells[r + size][c].isValid = value;
        } else if (r > 0 && r + size < this.totalCells - 1) {
          for (let i = r; i <= r + size; i++) {
            this.cells[i][c - 1].isValid = value;
          }
          this.cells[r - 1][c].isValid = value;
          this.cells[r + size][c].isValid = value;
        } else if (r + size === this.totalCells - 1) {
          for (let i = r; i <= r + size; i++) {
            this.cells[i][c - 1].isValid = value;
          }
          this.cells[r - 1][c].isValid = value;
        }
      }
    }
  }

  clearBoard() {
    if (!this.disabled) {
      for (let i = 0; i < this.ships.length; i++) {
        const insertedShip = this.ships[i];
        this.eventEmitter.emit(new ShipMessage('cleared-ship', insertedShip.ship));
        this.deOccupyCells(insertedShip.ship.size, insertedShip.originRow, insertedShip.originColumn, insertedShip.ship.horizontal);
        this.removeNeighbourArea(insertedShip.ship.size, insertedShip.originRow, insertedShip.originColumn, insertedShip.ship.horizontal);
        this.cells[insertedShip.originRow][insertedShip.originColumn].ship = undefined;
      }
      this.ships = [];
    }
  }

  getInfo(): BoardInfo {
    const infoShipMap: Map<Ship, Cell[]> = this.getInfoShipMap();
    const keys = Array.from(infoShipMap.keys());
    const array = new Array<InfoShip>();
    let counter = 0;
    // while( keys.return()) {
    for (const ship of keys) {
      const cellArray = infoShipMap.get(ship);
      counter += cellArray.length;
      let numberOfHits = 0;
      if (ship.hits) {
        numberOfHits = ship.hits;
      }
      array.push(new InfoShip(ship.id, cellArray, ship.size, numberOfHits));
    }
    return new BoardInfo(this.cells, array, counter);
  }

  private getInfoShipMap() {
    const array = new Map<Ship, Cell[]>();
    this.ships.map(iShip => {
      const cellArray = new Array<Cell>();
      const ship = iShip.ship;
      if (ship.horizontal) {
        for (let i = ship.originColumn; i < ship.originColumn + ship.size; i++) {
          cellArray.push(this.cells[ship.originRow][i]);
        }
      } else if (!ship.horizontal) {
        for (let i = ship.originRow; i < ship.originRow + ship.size; i++) {
          cellArray.push(this.cells[i][ship.originColumn]);
        }
      }
      array.set(ship, cellArray);
    });
    return array;
  }

  setShooting(shooting: boolean) {
    this.shooting = shooting;
  }

  setName(name: string) {
    this.name = name;
  }
}
