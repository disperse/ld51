import 'phaser';

import placard from '../assets/placard.png';
import story1 from '../assets/story-1.png';
import story2 from '../assets/story-2.png';
import story3 from '../assets/story-3.png';
import story4 from '../assets/story-4.png';
import instructions from '../assets/instructions.png';

export class MenuScene extends Phaser.Scene {

  constructor() {
    super({
      key: 'MenuScene'
    });
  }

  preload(): void {
    this.load.image('placard', placard);
    this.load.image('story-1', story1);
    this.load.image('story-2', story2);
    this.load.image('story-3', story3);
    this.load.image('story-4', story4);
    this.load.image('instructions', instructions);
  }

  create(): void {
    this.add.sprite(64, 36, 'placard');

    let index = 0;
    const screens = ['story-1', 'story-2', 'story-3', 'story-4', 'instructions'];
    this.input.keyboard.on('keydown', () => {
      if (index < screens.length) {
        this.add.sprite(64, 36, screens[index]);
        index++
      } else {
        this.scene.start('MainScene');
      }
    });
  }
}
