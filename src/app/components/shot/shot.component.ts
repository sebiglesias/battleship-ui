import {Component, Input, OnChanges, OnInit} from '@angular/core';

@Component({
  selector: 'app-shot',
  templateUrl: './shot.component.html',
  styleUrls: ['./shot.component.css']
})
export class ShotComponent implements OnChanges, OnInit{

  public shot: CompShot;

  @Input()
  public row: number;

  @Input()
  public column: number;

  @Input()
  public hit: boolean;

  private images = {
    'HIT': {
      'img': '../../../assets/images/EXPLOSION.svg',
    },
    'MISS': {
      'img': '../../../assets/images/AGUA.svg',
    }
  };

  constructor() { }

  ngOnInit() {
    this.selectImg();
  }

  ngOnChanges() {
    this.selectImg();
  }

  selectImg() {
    if (this.hit !== undefined) {
      let img = 'MISS';
      if (this.hit) img = 'HIT';
      this.shot = {
        row: this.row,
        column: this.column,
        hit: this.hit,
        img: this.images[img].img
      };
    }
  }

}

export class CompShot {
  row: number;
  column: number;
  hit: boolean;
  img: string;

  constructor(row: number, column: number, hit?: boolean) {
    this.row = row;
    this.column = column;
    this.hit = hit;
  }
}
