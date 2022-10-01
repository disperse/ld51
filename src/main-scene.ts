import 'phaser';
import backgroundMusic from '../assets/background-music-1.mp3';
import bNote from '../assets/note_b.wav';
import cNote from '../assets/note_c.wav';
import dNote from '../assets/note_d.wav';
import eNote from '../assets/note_e.wav';
import filmBackground from '../assets/film.png';
import filmJson from '../assets/film.json';
import upArrow from '../assets/up-arrow.png';
import downArrow from '../assets/down-arrow.png';
import leftArrow from '../assets/left-arrow.png';
import rightArrow from '../assets/right-arrow.png';
import indicatorArrow from '../assets/indicator-arrow.png';
import late from '../assets/late.png';
import early from '../assets/early.png';

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
  private distanceToArrow = 60; // pixels
  private scrollSpeed = 40; // ms / pixel
  private exactTime = 100; // ms timing accuracy
  private lateEarlyTime = 200; // display late / early message
  private startTime!: number;
  private elapsedTime!: number;
  private statusText!: Phaser.GameObjects.Text;
  private gameStarted!: boolean;
  private notes!: Array<Phaser.Sound.BaseSound>;
  private targetNotes!: Array<Note>;
  private music!: Phaser.Sound.BaseSound;
  private late!: Phaser.GameObjects.Sprite;
  private early!: Phaser.GameObjects.Sprite;

  constructor() {
    super({
      key: 'MainScene'
    });
  }

  preload(): void {
    this.load.audio('background-music-1', backgroundMusic);
    this.load.audio('b-note', bNote);
    this.load.audio('c-note', cNote);
    this.load.audio('d-note', dNote);
    this.load.audio('e-note', eNote);
    this.load.aseprite('film', filmBackground, filmJson);
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
    this.load.image('ArrowUp', upArrow);
    this.load.image('ArrowDown', downArrow);
    this.load.image('ArrowLeft', leftArrow);
    this.load.image('ArrowRight', rightArrow);
    this.load.image('indicator-arrow', indicatorArrow);
    this.load.image('late', late);
    this.load.image('early', early);
  }

  create(): void {
    this.scale.refresh();

    this.statusText = this.add.text(1, 1, 'Press any key to start', {
      fontSize: '10px',
      fontFamily: 'Helvetica',
      color: 'black',
    });

    this.add.sprite((127 - this.distanceToArrow), 52, 'indicator-arrow');
    this.music = this.sound.add('background-music-1');

    this.notes = [
      this.sound.add('b-note', {volume: 0.5, detune: 50}),
      this.sound.add('c-note', {volume: 0.5, detune: 50}),
      this.sound.add('d-note', {volume: 0.5, detune: 50}),
      this.sound.add('e-note', {volume: 0.5, detune: 50}),
    ]

    this.anims.createFromAseprite('film');
    this.add.sprite(64, 64, 'film').play({key: 'rolling', repeat: -1});

    this.late = this.add.sprite(107, 10, 'late');
    this.early = this.add.sprite(107, 10, 'early');
    this.early.alpha = 0;
    this.late.alpha = 0;

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

  handleInput(evt: KeyboardEvent): void {
    if (this.isCursorKeyCode(evt.code)) {
      let error = true;
      this.targetNotes.forEach(tn => {
        let note = this.notes[tn.noteIndex];
        if (evt.type === 'keydown') {
          let difference = this.elapsedTime - tn.startTime
          if (Math.abs(difference) < this.lateEarlyTime) {
            this.statusText.setText(difference.toString());
            if (tn.direction === evt.code) {
              error = false;
              note.play();
            }
            if (Math.abs(difference) > this.exactTime) {
              this.warnLateEarly(difference > 0)
            }
          }
        }

        if (evt.type === 'keyup' && note.isPlaying) {
          note.stop();
        }
      });
      if (error) {
        console.log('oops!');
      }
    }
  }

  update(): void {
    if (this.gameStarted) {
      this.elapsedTime = Date.now() - this.startTime;
      this.updateTargetNotes();
      if (this.late.alpha > 0) this.late.alpha -= 0.01;
      if (this.early.alpha > 0) this.early.alpha -= 0.01;
    }
  }
}
