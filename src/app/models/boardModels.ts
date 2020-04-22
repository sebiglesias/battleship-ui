import {CompShot} from '../components/shot/shot.component';
import {Ship} from './ships';

export class Cell {
  id: string;
  row: number;
  column: number;
  occupied: boolean;
  isValid: boolean;
  shot: CompShot;
  ship: Ship;

  constructor(r, c, occupied? , shot?) {
    this.id = r + ',' + c;
    this.row = r;
    this.column = c;
    if (occupied === undefined)this.occupied = false;
    if (occupied !== undefined)this.occupied = occupied;
    if (shot === undefined) this.shot = new CompShot(r, c);
    if (shot !== undefined) this.shot = shot;
  }
}

export class InsertedShip {
  originRow: number;
  originColumn: number;
  ship: Ship;

  constructor(originRow: number, originColumn: number, ship: Ship) {
    this.originRow = originRow;
    this.originColumn = originColumn;
    this.ship = ship;
  }
}

export class InfoShip {
  id: string;
  cells: Cell[];
  size: number;
  shot: number;

  constructor(id, cells, size, shot) {
    this.id = id;
    this.cells = cells;
    this.size = size;
    this.shot = shot;
  }
}

export class BoardInfo {
  gameId: string;
  playerId: string;
  id: string;
  boardCells: Cell[][];
  shipList: InfoShip[];
  totalShipCells: number;

  constructor(boardCells, shipList, totalShipCells) {
    this.boardCells = boardCells;
    this.shipList = shipList;
    this.totalShipCells = totalShipCells;
  }
}
