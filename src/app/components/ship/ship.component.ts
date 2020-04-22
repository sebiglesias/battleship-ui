import { Component, OnInit, Input } from '@angular/core';
import {Ship, ShipType} from "../../models/ships";
import {ShipInfoService} from '../../services/ship/ship-info.service';

@Component({
  selector: 'app-ship',
  templateUrl: './ship.component.html',
  styleUrls: ['./ship.component.css']
})
export class ShipComponent implements OnInit {

  @Input()
  public enableDrag: boolean;

  @Input()
  private shipType: ShipType;

  @Input()
  private originRow: number;

  @Input()
  private originColumn: number;

  @Input()
  private initialOrientation: boolean;

  @Input()
  public shipOrientation: boolean;

  @Input()
  private id: string;

  @Input()
  public hits: number;

  public ship: Ship;

  constructor(private shipInfo: ShipInfoService) { }

  ngOnInit() {
    if (this.shipType) {
      this.ship = {
        id: this.id,
        shipType: this.shipType,
        source: this.shipInfo.getShipImg(this.shipType),
        shipStyle:  this.shipInfo.getShipStyle(this.shipType),
        size: this.shipInfo.getShipSize(this.shipType),
        horizontal: this.initialOrientation,
        originColumn: this.originColumn,
        originRow: this.originRow,
        hits: this.hits
      };
    }
  }

  getShip(): Ship {
    this.ship.horizontal = this.shipOrientation;
    return this.ship;
  }

}
