import { Injectable } from '@angular/core';

@Injectable()
export class AudioService {

  constructor() { }

  playShot() {
    AudioService.playAudio("../../../assets/sounds/shot.aiff");
  }

  playWaterPlace() {
    AudioService.playAudio("../../../assets/sounds/splash.wav");
  }



  private static playAudio(src: string) {
    let audio = new Audio();
    audio.src = src;
    audio.load();
    audio.play();
  }

}
