import 'phaser';
import tntUrl from '../assets/tnt_10x10.png';
import jumpUrl from '../assets/assets_jump.ogg';
import { GameConfig } from './main';

export class MenuScene extends Phaser.Scene {
  private startKey!: Phaser.Input.Keyboard.Key;
  private sprites: { s: Phaser.GameObjects.Image, r: number }[] = [];

  constructor() {
    super({
      key: 'MenuScene'
    });
  }

  preload(): void {
    this.startKey = this.input.keyboard.addKey(
      Phaser.Input.Keyboard.KeyCodes.S,
    );
    this.startKey.isDown = false;
    this.load.image('tnt', tntUrl);
    this.load.audio('jump', jumpUrl);
  }

  create(): void {
    this.add.text(10, 10, 'S to restart', {
      fontSize: '60px',
      fontFamily: 'Helvetica',
    });

    const gameWidth = (GameConfig.width) ? +GameConfig.width : 800;
    const gameHeight = (GameConfig.height) ? +GameConfig.height : 600;

    for (let i = 0; i < 300; i++) {
      const x = Phaser.Math.Between(-64, gameWidth);
      const y = Phaser.Math.Between(-64, gameHeight);

      const image = this.add.image(x, y, 'tnt');
      this.sprites.push({s: image, r: 2 + Math.random() * 6});
    }
  }

  update(): void {
    if (this.startKey.isDown) {
      this.sound.play('jump');
      this.scene.start(this);
    }

    for (const element of this.sprites) {
      const sprite = element.s;
      sprite.y += element.r;
      if (sprite.y > 700) {
        sprite.y = -256;
      }
    }
  }
}
