export class ShipMessage {
  type: string;
  info: any;

  constructor(type: string, info: any) {
    this.type = type;
    this.info = info;
  }
}
