import 'phaser';
import bNote from '../assets/note_b.wav';
import backgroundMusic from '../assets/background-music-1.mp3';
import cNote from '../assets/note_c.wav';
import dNote from '../assets/note_d.wav';
import downArrow from '../assets/down-arrow.png';
import eNote from '../assets/note_e.wav';
import early from '../assets/early.png';
import filmBackground from '../assets/film2.png';
import ghost1 from '../assets/ghost_1.png';
import ghost2 from '../assets/ghost_2.png';
import ghostSing1 from '../assets/ghost_sing_1.png';
import ghostSing2 from '../assets/ghost_sing_2.png';
import indicatorArrow from '../assets/target-bar.png';
import late from '../assets/late.png';
import leftArrow from '../assets/left-arrow.png';
import perfect from '../assets/perfect.png';
import projector from '../assets/projector.png';
import rightArrow from '../assets/right-arrow.png';
import silentMovie1 from '../assets/silent-movie-sprite-1.png';
import upArrow from '../assets/up-arrow.png';

class Note {
  direction: number;
  endTime: number;
  noteIndex: number;
  sprite: Phaser.GameObjects.Sprite | undefined;
  startTime: number;

  constructor(start: number, end: number, note: number, dir: number) {
    this.direction = dir;
    this.endTime = end;
    this.noteIndex = note;
    this.startTime = start;
  }
}

export class MainScene extends Phaser.Scene {
  private directions: Array<string> = ["ArrowLeft", "ArrowUp", "ArrowRight", "ArrowDown"]
  private distanceToArrow = 90; // pixels
  private down!: Phaser.Input.Keyboard.Key;
  private early!: Phaser.GameObjects.Sprite;
  private elapsedTime!: number;
  private exactTime = 100; // ms timing accuracy
  private filmSprite!: Phaser.GameObjects.TileSprite;
  private gameStarted!: boolean;
  private ghost!: Phaser.GameObjects.Sprite;
  private late!: Phaser.GameObjects.Sprite;
  private lateEarlyTime = 200; // display late / early message
  private left!: Phaser.Input.Keyboard.Key;
  private music!: Phaser.Sound.BaseSound;
  private notes!: Array<Phaser.Sound.BaseSound>;
  private perfect!: Phaser.GameObjects.Sprite;
  private perfectTime = 50;
  private right!: Phaser.Input.Keyboard.Key;
  private scrollSpeed = 40; // ms / pixel
  private startTime!: number;
  private targetNotes!: Array<Note>;
  private up!: Phaser.Input.Keyboard.Key;

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
    this.targetNotes = [
      new Note(1000, 500, 0, 1),
      new Note(2000, 700, 1, 3),
      new Note(3000, 1500, 2, 2),
      new Note(4000, 3000, 3, 0),
      new Note(5000, 4200, 2, 1),
      new Note(6000, 5500, 1, 1),
      new Note(7000, 7000, 2, 3),
      new Note(8000, 7250, 1, 0),
      new Note(9000, 9000, 2, 3),
      new Note(10000, 9900, 3, 1),
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
    this.up = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.UP);
    this.down = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.DOWN);
    this.left = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.LEFT);
    this.right = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.RIGHT);

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
      this.sound.add('c-note', {volume: 0.5, detune: -100}),
      this.sound.add('c-note', {volume: 0.5, detune: 0}),
      this.sound.add('c-note', {volume: 0.5, detune: 100}),
      this.sound.add('c-note', {volume: 0.5, detune: 200}),
    ]

    const projectorSprite = this.add.sprite(80, 40, 'projector');
    this.tweens.add({
      targets: projectorSprite,
      y: 41,
      duration: 200,
      ease: 'Bounce',
      yoyo: true,
      repeat: -1,
    });

    this.filmSprite = this.add.tileSprite(64, 64, 127, 15, 'film');
    this.add.sprite((127 - this.distanceToArrow), 66, 'indicator-arrow').setBlendMode(Phaser.BlendModes.ADD);

    this.ghost = this.add.sprite(110, 40, 'ghost-1');
    this.tweens.add({
      targets: this.ghost,
      y: 30,
      duration: 3000,
      ease: 'Back', easeParams: [ 3.5 ],
      delay: 1000,
      yoyo: true,
      repeat: -1,
    });

    this.late = this.add.sprite(20, 5, 'late');
    this.early = this.add.sprite(20, 5, 'early');
    this.perfect = this.add.sprite(25, 5, 'perfect');
    this.early.alpha = 0.0;
    this.late.alpha = 0.0;
    this.perfect.alpha = 0.0;

    this.input.keyboard.on('keydown', () => {
      if (!this.gameStarted) {
        this.startGame();
      }
    });
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
          tn.sprite = this.add.sprite(arrowPos, 65, this.directions[tn.direction]);
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

  handleInput(arrowNum: number, down: boolean): void {
    let error = true;
    this.targetNotes.forEach(tn => {
      let note = this.notes[tn.noteIndex];
      if (down) {
        let difference = this.elapsedTime - tn.startTime
        if (Math.abs(difference) < this.lateEarlyTime) {
          if (tn.direction === arrowNum) {
            error = false;
            this.sing(note);
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
      }

      if (!down && note.isPlaying) {
        this.stopSinging(note);
        // TODO: deal with end of notes
        error = false;
      }
    });
    if (error) {
      console.log('oops!');
    }
  }

  fadeText(): void {
    if (this.late.alpha > 0) this.late.alpha -= 0.01;
    if (this.early.alpha > 0) this.early.alpha -= 0.01;
    if (this.perfect.alpha > 0) this.perfect.alpha -= 0.01;
  }

  update(_: number, delta: number): void {
    if (this.gameStarted) {
      if (Phaser.Input.Keyboard.JustDown(this.left)) this.handleInput(0, true);
      if (Phaser.Input.Keyboard.JustDown(this.up)) this.handleInput(1, true);
      if (Phaser.Input.Keyboard.JustDown(this.right)) this.handleInput(2, true);
      if (Phaser.Input.Keyboard.JustDown(this.down)) this.handleInput(3, true);

      if (Phaser.Input.Keyboard.JustUp(this.left)) this.handleInput(0, false);
      if (Phaser.Input.Keyboard.JustUp(this.up)) this.handleInput(1, false);
      if (Phaser.Input.Keyboard.JustUp(this.right)) this.handleInput(2, false);
      if (Phaser.Input.Keyboard.JustUp(this.down)) this.handleInput(3, false);

      this.filmSprite.tilePositionX += delta / this.scrollSpeed;
      this.elapsedTime = Date.now() - this.startTime;
      this.updateTargetNotes();
      this.fadeText();
    }
  }

}
