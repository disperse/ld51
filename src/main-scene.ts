import 'phaser';
import backgroundMusic from '../assets/background-music-1.mp3';
import bNote from '../assets/note_b.wav';
import cNote from '../assets/note_c.wav';
import dNote from '../assets/note_d.wav';
import eNote from '../assets/note_e.wav';
import filmBackground from '../assets/film2.png';
import upArrow from '../assets/up-arrow.png';
import downArrow from '../assets/down-arrow.png';
import leftArrow from '../assets/left-arrow.png';
import rightArrow from '../assets/right-arrow.png';
import indicatorArrow from '../assets/target-bar.png';
import late from '../assets/late.png';
import early from '../assets/early.png';
import perfect from '../assets/perfect.png';
import ghost1 from '../assets/ghost_1.png';
import ghost2 from '../assets/ghost_2.png';
import ghostSing1 from '../assets/ghost_sing_1.png';
import ghostSing2 from '../assets/ghost_sing_2.png';
import silentMovie1 from '../assets/silent-movie-sprite-1.png';
import projector from '../assets/projector.png';

type Direction = "ArrowLeft" | "ArrowUp" | "ArrowRight" | "ArrowDown"

class Note {
  startTime: number;
  endTime: number;
  noteIndex: number;
  direction: Direction;
  sprite: Phaser.GameObjects.Sprite | undefined;

  constructor(start: number, end: number, note: number, dir: Direction) {
    this.startTime = start;
    this.endTime = end;
    this.noteIndex = note;
    this.direction = dir;
  }
}

export class MainScene extends Phaser.Scene {
  private distanceToArrow = 90; // pixels
  private scrollSpeed = 40; // ms / pixel
  private perfectTime = 50;
  private exactTime = 100; // ms timing accuracy
  private lateEarlyTime = 200; // display late / early message
  private startTime!: number;
  private elapsedTime!: number;
  private gameStarted!: boolean;
  private notes!: Array<Phaser.Sound.BaseSound>;
  private targetNotes!: Array<Note>;
  private music!: Phaser.Sound.BaseSound;
  private late!: Phaser.GameObjects.Sprite;
  private early!: Phaser.GameObjects.Sprite;
  private perfect!: Phaser.GameObjects.Sprite;
  private ghost!: Phaser.GameObjects.Sprite;
  private projector!: Phaser.GameObjects.Sprite;
  private filmSprite!: Phaser.GameObjects.TileSprite;

  constructor() {
    super({
      key: 'MainScene'
    });
  }

  preload(): void {
    this.load.spritesheet('silent-movie-1', silentMovie1, {frameWidth: 72, frameHeight: 56, endFrame: 167});
    this.load.audio('background-music-1', backgroundMusic);
    this.load.audio('b-note', bNote);
    this.load.audio('c-note', cNote);
    this.load.audio('d-note', dNote);
    this.load.audio('e-note', eNote);
    // this.load.aseprite('film', filmBackground, filmJson);
    this.targetNotes = [
      new Note(1000, 500, 0, 'ArrowUp'),
      new Note(2000, 700, 1, 'ArrowDown'),
      new Note(3000, 1500, 2, 'ArrowLeft'),
      new Note(4000, 3000, 3, 'ArrowDown'),
      new Note(5000, 4200, 2, 'ArrowUp'),
      new Note(6000, 5500, 1, 'ArrowUp'),
      new Note(7000, 7000, 2, 'ArrowDown'),
      new Note(8000, 7250, 1, 'ArrowLeft'),
      new Note(9000, 9000, 2, 'ArrowRight'),
      new Note(10000, 9900, 3, 'ArrowUp'),
    ];
    this.load.image('film', filmBackground);
    this.load.image('ArrowUp', upArrow);
    this.load.image('ArrowDown', downArrow);
    this.load.image('ArrowLeft', leftArrow);
    this.load.image('ArrowRight', rightArrow);
    this.load.image('indicator-arrow', indicatorArrow);
    this.load.image('late', late);
    this.load.image('early', early);
    this.load.image('perfect', perfect);
    this.load.image('ghost-1', ghost1);
    this.load.image('ghost-2', ghost2);
    this.load.image('ghost-sing-1', ghostSing1);
    this.load.image('ghost-sing-2', ghostSing2);
    this.load.image('projector', projector);
  }

  create(): void {
    this.scale.refresh();

    this.anims.create({
      key: 'play-movie',
      frames: this.anims.generateFrameNumbers('silent-movie-1', {start: 0, end: 166, first: 0}),
      frameRate: 10,
      repeat: -1,
    });
    const silentMovie = this.add.sprite(37, 29, 'silent-movie-1');
    silentMovie.play('play-movie');

    this.music = this.sound.add('background-music-1');

    this.notes = [
      this.sound.add('b-note', {volume: 0.5, detune: 50}),
      this.sound.add('c-note', {volume: 0.5, detune: 50}),
      this.sound.add('d-note', {volume: 0.5, detune: 50}),
      this.sound.add('e-note', {volume: 0.5, detune: 50}),
    ]

    this.projector = this.add.sprite(80, 40, 'projector');
    this.filmSprite = this.add.tileSprite(64, 64, 127, 15, 'film');
    const indicatorArrow = this.add.sprite((127 - this.distanceToArrow), 66, 'indicator-arrow');
    indicatorArrow.setBlendMode(Phaser.BlendModes.ADD);

    this.ghost = this.add.sprite(110, 40, 'ghost-1');
    this.tweens.add({
      targets: this.ghost,
      y: 30,
      duration: 3000,
      ease: 'Back',
      easeParams: [ 3.5 ],
      delay: 1000,
      yoyo: true,
      repeat: -1,
    });

    this.late = this.add.sprite(107, 5, 'late');
    this.early = this.add.sprite(107, 5, 'early');
    this.perfect = this.add.sprite(107, 5, 'perfect');
    this.early.alpha = 0.0;
    this.late.alpha = 0.0;
    this.perfect.alpha = 0.0;

    this.input.keyboard.on('keydown', (evt: KeyboardEvent) => {
      if (!this.gameStarted) {
        this.startGame();
      } else {
        this.handleInput(evt);
      }
    });

    this.input.keyboard.on('keyup', (evt: KeyboardEvent) => this.handleInput(evt));
  }

  startGame(): void {
    this.scene.start(this);
    this.music.play();
    this.startTime = Date.now();
    this.gameStarted = true;
  }

  warnLateEarly(isLate: boolean): void {
    this.late.alpha = (isLate) ? 1.0 : 0.0;
    this.early.alpha = (isLate) ? 0.0 : 1.0;
  }

  updateTargetNotes(): void {
    this.targetNotes.forEach(tn => {
      const arrowPos = Math.ceil(127 - this.distanceToArrow - ((this.elapsedTime - tn.startTime) / this.scrollSpeed));
      // if arrow is in view
      if (arrowPos < 127 && arrowPos > -10) {
        if (tn.sprite === undefined) {
          tn.sprite = this.add.sprite(arrowPos, 64, tn.direction);
        } else {
          tn.sprite.x = arrowPos;
        }
      } else {
        if (tn.sprite !== undefined) {
          tn.sprite.destroy();
          tn.sprite = undefined;
        }
      }
    });
  }

  isCursorKeyCode(code: string): boolean {
    return (
      code === "ArrowLeft"
      || code === "ArrowUp"
      || code === "ArrowRight"
      || code === "ArrowDown"
    );
  }

  sing(note: Phaser.Sound.BaseSound) {
    note.play();
    this.ghost.setTexture((Math.random() < 0.5) ? 'ghost-sing-1' : 'ghost-sing-2');
  }

  stopSinging(note: Phaser.Sound.BaseSound) {
    note.stop();
    this.ghost.setTexture((Math.random() < 0.5) ? 'ghost-1' : 'ghost-2');
  }

  handleInput(evt: KeyboardEvent): void {
    if (this.isCursorKeyCode(evt.code)) {
      let error = true;
      this.targetNotes.forEach(tn => {
        let note = this.notes[tn.noteIndex];
        if (evt.type === 'keydown') {
          let difference = this.elapsedTime - tn.startTime
          if (Math.abs(difference) < this.lateEarlyTime) {
            if (tn.direction === evt.code) {
              error = false;
              this.sing(note);
            }
            if (Math.abs(difference) > this.exactTime) {
              this.warnLateEarly(difference > 0)
            }
            if (Math.abs(difference) < this.perfectTime) {
              this.perfect.alpha = 1.0;
              this.late.alpha = 0.0;
              this.early.alpha = 0.0;
            }
          }
        }

        if (evt.type === 'keyup' && note.isPlaying) {
          this.stopSinging(note);
        }
      });
      if (error) {
        console.log('oops!');
      }
    }
  }

  fadeText(): void {
    if (this.late.alpha > 0) this.late.alpha -= 0.01;
    if (this.early.alpha > 0) this.early.alpha -= 0.01;
    if (this.perfect.alpha > 0) this.perfect.alpha -= 0.01;
  }

  update(_: number, delta: number): void {
    if (this.gameStarted) {
      this.filmSprite.tilePositionX += delta / this.scrollSpeed;
      this.elapsedTime = Date.now() - this.startTime;
      this.updateTargetNotes();
      this.fadeText();
    }
  }

}
