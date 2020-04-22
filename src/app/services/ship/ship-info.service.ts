import { Injectable } from '@angular/core';
import {ShipType} from '../../models/ships';

@Injectable()
export class ShipInfoService {

  private sizes = {
    'SMALL': {
      'img': ['../../../assets/images/AVION22.svg', '../../../assets/images/AVION2.svg'],
      'size': 2,
      'style': ['vertical-small-ship', 'horizontal-small-ship']
    },
    'MEDIUM': {
      'img': ['../../../assets/images/AVION32.svg', '../../../assets/images/AVION3.svg'],
      'size': 3,
      'style': ['vertical-medium-ship', 'horizontal-medium-ship']
    },
    'LARGE': {
      'img': ['../../../assets/images/AVION42.svg', '../../../assets/images/AVION4.svg'],
      'size': 4,
      'style': ['vertical-large-ship', 'horizontal-large-ship']
    },
    'HUGE': {
      'img': ['../../../assets/images/PORTAAVIONES2.svg', '../../../assets/images/PORTAAVIONES.svg'],
      'size': 5,
      'style': ['vertical-huge-ship', 'horizontal-huge-ship']
    }
  };

  constructor() { }


  getShipTypeFromStr(str: string): ShipType {
    switch(str) {
      case 'SMALL':
        return ShipType.SMALL;
      case 'MEDIUM':
        return ShipType.MEDIUM;
      case 'LARGE':
        return ShipType.LARGE;
      case 'HUGE':
        return ShipType.HUGE;
      default:
        return undefined;
    }
  }

  getShipSizeFromStr(str: string): ShipType {
    switch(str) {
      case 'SMALL':
        return 2;
      case 'MEDIUM':
        return 3;
      case 'LARGE':
        return 4;
      case 'HUGE':
        return 5;
      default:
        return undefined;
    }
  }

  getShipImgFromStr(str: string): string {
    return this.sizes[str].img;
  }

  getShipStylesFromStr(str: string): any {
    return this.sizes[str].style;
  }

  getShipImg(shipType: ShipType): any {
    return this.sizes[shipType.toString()].img;
  }

  getShipStyle(shipType: ShipType): any {
    return this.sizes[shipType.toString()].style;
  }

  getShipSize(shipType: ShipType): any {
    return this.sizes[shipType.toString()].size;
  }
}
