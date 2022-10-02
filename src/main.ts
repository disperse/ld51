import './style.css'
import 'phaser';
import { MainScene } from './main-scene';
import { MenuScene } from './menu-scene';

export const GameConfig: Phaser.Types.Core.GameConfig = {
  title: 'Banshee',
  url: 'https://github.com/disperse/ld51',
  version: '2.0',
  width: 128,
  height: 72,
  type: Phaser.AUTO,
  parent: 'app',
  scene: [MenuScene, MainScene],
  input: {
    keyboard: true
  },
  physics: {
    default: 'arcade',
    arcade: {
      gravity: {y: 0},
      debug: false
    }
  },
  backgroundColor: '#111111',
  render: {pixelArt: true, antialias: false},
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    // `fullscreenTarget` must be defined for phones to not have
    // a small margin during fullscreen.
    fullscreenTarget: 'app',
    expandParent: true,
  },
};

export class Game extends Phaser.Game {
  constructor(config: Phaser.Types.Core.GameConfig) {
    super(config);
  }
}

window.addEventListener('load', () => {
  // Expose `_game` to allow debugging, mute button and fullscreen button
  (window as any)._game = new Game(GameConfig);
});
