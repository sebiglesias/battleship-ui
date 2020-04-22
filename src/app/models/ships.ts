export enum ShipType {
  SMALL,
  MEDIUM,
  LARGE,
  HUGE
}

export class Ship {
  id: string;
  shipType: ShipType;
  source: string;
  shipStyle: string[];
  size: number;
  horizontal: boolean;
  originRow: number;
  originColumn: number;
  hits: number;

  constructor(shipType: ShipType, id?: string) {
    this.shipType = shipType;
    this.id = id;
  }

}
