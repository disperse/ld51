import 'phaser';

import endScreen from '../assets/end-screen.png';

export class EndScene extends Phaser.Scene {

  constructor() {
    super({
      key: 'EndScene'
    });
  }

  preload(): void {
    this.load.image('end-screen', endScreen);
  }

  create(): void {
    this.add.sprite(64, 36, 'end-screen');

    this.input.keyboard.on('keydown', () => {
      location.reload();
    });
  }
}
