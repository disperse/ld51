import 'phaser';
import backgroundMusic1 from '../assets/background-music-1.mp3';
import backgroundMusic2 from '../assets/background-music-2.mp3';
import backgroundMusic3 from '../assets/background-music-3.mp3';
import countIn from '../assets/count-in.mp3';
import c3 from '../assets/c3.mp3';
import downArrow from '../assets/down-arrow.png';
import early from '../assets/early.png';
import filmBackground from '../assets/film2.png';
import ghost1 from '../assets/ghost_1.png';
import ghost2 from '../assets/ghost_2.png';
import ghostSing1 from '../assets/ghost_sing_1.png';
import ghostSing2 from '../assets/ghost_sing_2.png';
import indicatorArrow from '../assets/target-bar.png';
import late from '../assets/late.png';
import leftArrow from '../assets/left-arrow.png';
import missed from '../assets/missed.png';
import ok from '../assets/ok.png';
import perfect from '../assets/perfect.png';
import projector from '../assets/projector.png';
import rightArrow from '../assets/right-arrow.png';
import silentMovie1 from '../assets/silent-movie-sprite-1.png';
import silentMovie2 from '../assets/silent-movie-sprite-2.png';
import silentMovie3 from '../assets/silent-movie-sprite-3.png';
import upArrow from '../assets/up-arrow.png';
import { melody1 } from '../music/piece1.js';
import { melody2 } from '../music/piece2.js';
import { melody3 } from '../music/piece3.js';
import pressAnyKey from '../assets/press-any-key.png';

export interface Note {
  direction: number;
  duration: number;
  note: string;
  sprite?: Phaser.GameObjects.Sprite;
  start: number;
}

const letterNotes = [ 'C2', 'C#2', 'D2', 'D#2', 'E2', 'F2', 'F#2', 'G2', 'G#2', 'A2', 'A#2', 'B2', 'C3', 'C#3', 'D3',
  'D#3', 'E3', 'F3', 'F#3', 'G3', 'G#3', 'A3', 'A#3', 'B3', 'C4' ];

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
  private lateEarlyTime = 300; // display late / early message
  private left!: Phaser.Input.Keyboard.Key;
  private missed!: Phaser.GameObjects.Sprite;
  private music!: Phaser.Sound.BaseSound;
  private ok!: Phaser.GameObjects.Sprite;
  private count!: Phaser.Sound.BaseSound;
  private notes!: { [note: string] : Phaser.Sound.BaseSound };
  private perfect!: Phaser.GameObjects.Sprite;
  private perfectTime = 50;
  private right!: Phaser.Input.Keyboard.Key;
  private scrollSpeed = 40; // ms / pixel
  private startTime!: number;
  private up!: Phaser.Input.Keyboard.Key;
  private musicPlayed: boolean = false;
  private currentlyPlaying!: Phaser.Sound.BaseSound;
  private melodies!: Array<Array<Note>>;
  private melodyIndex!: number;
  private backgroundMusic: Array<string> = ['background-music-1', 'background-music-2', 'background-music-3'];
  private silentMovie!: Phaser.GameObjects.Sprite;
  private silentMovies!: Array<string>;
  private silentMovieAnims!: Array<string>;

  constructor() {
    super({
      key: 'MainScene'
    });
  }

  preload(): void {
    this.load.spritesheet('silent-movie-1', silentMovie1, {frameWidth: 72, frameHeight: 56, endFrame: 167});
    this.load.spritesheet('silent-movie-2', silentMovie2, {frameWidth: 84, frameHeight: 56, endFrame: 102});
    this.load.spritesheet('silent-movie-3', silentMovie3, {frameWidth: 84, frameHeight: 56, endFrame: 154});
    this.load.audio('background-music-1', backgroundMusic1);
    this.load.audio('background-music-2', backgroundMusic2);
    this.load.audio('background-music-3', backgroundMusic3);
    this.load.audio('C3', c3);
    this.load.audio('count-in', countIn);
    this.load.image('film', filmBackground);
    this.load.image('ArrowUp', upArrow);
    this.load.image('ArrowDown', downArrow);
    this.load.image('ArrowLeft', leftArrow);
    this.load.image('ArrowRight', rightArrow);
    this.load.image('indicator-arrow', indicatorArrow);
    this.load.image('ok', ok);
    this.load.image('missed', missed);
    this.load.image('late', late);
    this.load.image('early', early);
    this.load.image('perfect', perfect);
    this.load.image('ghost-1', ghost1);
    this.load.image('ghost-2', ghost2);
    this.load.image('ghost-sing-1', ghostSing1);
    this.load.image('ghost-sing-2', ghostSing2);
    this.load.image('projector', projector);
    this.load.image('press-any-key', pressAnyKey);
  }

  create(): void {
    this.scale.refresh();
    this.up = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.UP);
    this.down = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.DOWN);
    this.left = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.LEFT);
    this.right = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.RIGHT);

    this.melodyIndex = 0;
    this.melodies = [melody1, melody2, melody3];
    this.silentMovies = ['silent-movie-1', 'silent-movie-2', 'silent-movie-3'];
    this.silentMovieAnims = ['play-movie-1', 'play-movie-2', 'play-movie-3'];

    this.anims.create({
      key: 'play-movie-1',
      frames: this.anims.generateFrameNumbers('silent-movie-1', {start: 0, end: 166, first: 0}),
      frameRate: 10,
      repeat: -1,
    });

    this.anims.create({
      key: 'play-movie-2',
      frames: this.anims.generateFrameNumbers('silent-movie-2', {start: 0, end: 102, first: 0}),
      frameRate: 9,
      repeat: -1,
    });

    this.anims.create({
      key: 'play-movie-3',
      frames: this.anims.generateFrameNumbers('silent-movie-3', {start: 0, end: 102, first: 0}),
      frameRate: 9,
      repeat: -1,
    });

    this.music = this.sound.add('background-music-1');
    this.count = this.sound.add('count-in');

    this.notes = {}
    let detune = -1200;
    letterNotes.forEach((ln) => {
      this.notes[ln] = this.sound.add('C3', {volume: 0.5, detune: detune});
      detune += 100
    });

    this.silentMovie = this.add.sprite(37, 29, 'silent-movie-1');

    const projectorSprite = this.add.sprite(80, 40, 'projector');
    projectorSprite.setDepth(1);
    this.tweens.add({
      targets: projectorSprite,
      y: 41,
      duration: 200,
      ease: 'Bounce',
      yoyo: true,
      repeat: -1,
    });

    this.filmSprite = this.add.tileSprite(64, 64, 127, 15, 'film');
    this.filmSprite.setDepth(2);
    const target = this.add.sprite((127 - this.distanceToArrow), 66, 'indicator-arrow').setBlendMode(Phaser.BlendModes.ADD);
    target.setDepth(4);

    this.ghost = this.add.sprite(110, 40, 'ghost-1');
    this.ghost.setDepth(3);
    this.tweens.add({
      targets: this.ghost,
      y: 30,
      duration: 3000,
      ease: 'Back', easeParams: [ 3.5 ],
      delay: 1000,
      yoyo: true,
      repeat: -1,
    });

    this.ok = this.add.sprite(10, 5, 'ok');
    this.missed = this.add.sprite(21, 5, 'missed');
    this.late = this.add.sprite(20, 5, 'late');
    this.early = this.add.sprite(20, 5, 'early');
    this.perfect = this.add.sprite(25, 5, 'perfect');
    this.ok.alpha = 0.0;
    this.missed.alpha = 0.0;
    this.early.alpha = 0.0;
    this.late.alpha = 0.0;
    this.perfect.alpha = 0.0;

    const press = this.add.sprite(60, 20, 'press-any-key');
    press.setDepth(6);
    this.input.keyboard.on('keydown', () => {
      if (!this.gameStarted) {
        press.destroy(true);
        this.silentMovie.play('play-movie-1');
        this.startGame();
      }
    });
  }

  startGame(): void {
    this.count.play();
    this.startTime = Date.now();
    this.gameStarted = true;
  }

  timingMessage(difference: number): void {
    this.late.alpha = 0.0;
    this.early.alpha = 0.0;
    this.perfect.alpha = 0.0;
    this.ok.alpha = 0.0;
    this.missed.alpha = 0.0;
    const absDiff = Math.abs(difference);
    if (absDiff < this.perfectTime) {
      this.perfect.alpha = 1.0;
    } else if (absDiff < this.exactTime) {
      this.ok.alpha = 1.0;
    } else if (absDiff < this.lateEarlyTime) {
      this.late.alpha = (difference > 0) ? 1.0 : 0.0;
      this.early.alpha = (difference < 0) ? 0.0 : 1.0;
    } else {
      this.missed.alpha = 1.0;
    }
  }

  updateTargetNotes(): void {
    this.melodies[this.melodyIndex].forEach(tn => {
      const arrowPos = Math.floor(127 - this.distanceToArrow - ((this.elapsedTime - tn.start) / this.scrollSpeed));
      // if arrow is in view
      if (arrowPos < 127 && arrowPos > -10) {
        if (tn.sprite === undefined) {
          tn.sprite = this.add.sprite(arrowPos, 65, this.directions[tn.direction]);
          tn.sprite.setDepth(5);
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
    if (this.currentlyPlaying !== undefined && this.currentlyPlaying.isPlaying) {
      this.currentlyPlaying.stop();
    }
    this.currentlyPlaying = note;
    note.play();
    this.ghost.setTexture((Math.random() < 0.5) ? 'ghost-sing-1' : 'ghost-sing-2');
  }

  stopSinging() {
    this.currentlyPlaying.stop();
    this.ghost.setTexture((Math.random() < 0.5) ? 'ghost-1' : 'ghost-2');
  }

  getClosestNote(): Note {
    return this.melodies[this.melodyIndex].sort((a, b) => {
      return Math.abs(this.elapsedTime - a.start) - Math.abs(this.elapsedTime - b.start);
    })[0];
  }

  handleInput(arrowNum: number, down: boolean): void {
    let error = true;
    let closestNote = this.getClosestNote();
    let note = this.notes[closestNote.note];
    if (down) {
      let difference = this.elapsedTime - closestNote.start
      this.timingMessage(difference);
      if (Math.abs(difference) < this.lateEarlyTime) {
        if (closestNote.direction === arrowNum) {
          error = false;
          this.sing(note);
        }
      }
    } else if (this.currentlyPlaying !== undefined && this.currentlyPlaying.isPlaying) {
      this.stopSinging();
      error = false;
    }
    if (error) {
      this.missed.alpha = 1.0;
    }
  }

  fadeText(): void {
    if (this.late.alpha > 0) this.late.alpha -= 0.01;
    if (this.early.alpha > 0) this.early.alpha -= 0.01;
    if (this.perfect.alpha > 0) this.perfect.alpha -= 0.01;
    if (this.ok.alpha > 0) this.ok.alpha -= 0.01;
    if (this.missed.alpha > 0) this.missed.alpha -= 0.01;
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
      this.elapsedTime = Date.now() - this.startTime - 2500;
      if (this.elapsedTime > 0 && !this.musicPlayed) {
        this.music.play();
        this.musicPlayed = true;
      }
      this.updateTargetNotes();
      this.fadeText();
      if (this.elapsedTime > 10000) {
        if (this.melodyIndex < this.melodies.length - 1) {
          this.melodies[this.melodyIndex].forEach(tn => {
            if (tn.sprite !== undefined) {
              tn.sprite.destroy();
            }
          });
          this.melodyIndex++;
          this.silentMovie.stop();
          this.silentMovie.destroy();
          this.silentMovie = this.add.sprite(37, 29, this.silentMovies[this.melodyIndex]);
          this.silentMovie.play(this.silentMovieAnims[this.melodyIndex]);
          this.music = this.sound.add(this.backgroundMusic[this.melodyIndex]);
          this.musicPlayed = false;
          this.startTime = Date.now()
          this.elapsedTime = Date.now() - this.startTime - 2500;
          this.count.play();
        } else {
          this.scene.start('EndScene');
        }
      }
    }
  }

}
