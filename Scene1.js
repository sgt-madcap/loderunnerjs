  class Scene1 extends Phaser.Scene {
      constructor() {
          super("bootGame");
      }

      preload() {
          this.load.image("background", "assets/images/background.jpg");
          this.load.spritesheet('player', 'assets/images/guy.png', {
              frameWidth: 16,
              frameHeight: 24
          });
          this.load.tilemapTiledJSON('map', 'assets/map.json');
          this.load.image('tiles', 'assets/tiles.png');
          this.load.bitmapFont("C64", "assets/fonts/C64.png", "assets/fonts/C64.fnt");
          this.load.audio('level1', 'assets/sound/Level1.mp3');
          this.load.audio('pickUp', 'assets/sound/pickUpItem.wav');
      }

      create() {
          this.add.text(20, 20, "Loading game...");
          this.scene.start("playGame");

          this.anims.create({
              key: 'playerWalkRight',
              frames: this.anims.generateFrameNames('player', {
                  start: 4,
                  end: 7,
              }),
              frameRate: 5,
              repeat: -1
          });

          this.anims.create({
              key: 'playerWalkLeft',
              frames: this.anims.generateFrameNames('player', {
                  start: 8,
                  end: 11
              }),
              frameRate: 5,
              repeat: -1
          });

          this.anims.create({
              key: 'playerStand',
              frames: this.anims.generateFrameNames('player', {
                  start: 0,
                  end: 0
              }),
              frameRate: 5,
              repeat: -1
          });

          this.anims.create({
              key: 'playerClimb',
              frames: this.anims.generateFrameNames('player', {
                  start: 12,
                  end: 15
              }),
              frameRate: 5,
              repeat: -1
          });
      }
  }