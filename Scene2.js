class Scene2 extends Phaser.Scene {
    constructor() {
        super("playGame");
    }

    create() {
        this.background = this.add.tileSprite(0, 0, 480, 320, "background");
        this.background.setOrigin(0, 0);
        this.backgroundMusic = this.sound.add('level1');
        this.backgroundMusic.loop = true;
        this.backgroundMusic.play();

        this.pickUpSound = this.sound.add('pickUp');

        this.map = this.make.tilemap({
            key: 'map'
        });
        this.tiles = this.map.addTilesetImage('tiles', 'tiles');

        this.groundLayer = this.map.createDynamicLayer('mid', this.tiles, 0, 0);
        this.winLayer = this.map.createDynamicLayer('winpass', this.tiles, 0, 0);
        this.winLayer.visible = false;
        this.laddersLayer = this.map.createDynamicLayer('ladders', this.tiles, 0, 0);
        this.chestsLayer = this.map.createDynamicLayer('chests', this.tiles, 0, 0);
        this.collideLayer = this.map.createDynamicLayer('collide', this.tiles, 0, 0);
        this.objects = this.map.objects;

        this.playerStart = this.findPlayerStart();
        this.playerWin = this.findPlayerWin();

        this.player = this.physics.add.sprite(this.playerStart.x, this.playerStart.y, 'player', 0);
        this.player.setOrigin(0.5, 0);
        this.player.body.debugShowBody = true;
        this.player.body.setSize(16, 24);
        this.player.setCollideWorldBounds(true);

        this.map.setCollisionBetween(1, 999, true, this.collideLayer);

        this.laddersLayer.setTileIndexCallback(29, this.allowClimb, this);

        this.groundTiles = [1, 2, 3, 4, 5, 6, 9, 15, 16, 17, 18, 19, 20, 26, 38];
        this.collideLayer.setTileIndexCallback(this.groundTiles, this.allowMove, this);

        this.cursorKeys = this.input.keyboard.createCursorKeys();

        this.chestsLayer.setTileIndexCallback(50, this.getChest, this);
    

        this.physics.add.overlap(this.player, this.chestsLayer);

        this.score = 0;
        this.scoreLabel = this.add.bitmapText(20, 10, "C64", "SCORE", 12);

        this.winLayer.setTileIndexCallback(29, this.checkWin, this);
    }

    zeroPad(number, size) {
        let stringNumber = String(number);
        while (stringNumber.length < (size || 2)) {
            stringNumber = "0" + stringNumber;
        }
        return stringNumber;
    }

    findPlayerStart() {
        let start = {
            x: 0,
            y: 0,
        };

        this.map.objects.forEach(object => {
            for (let j = 0; j < object.objects.length; j++) {
                if (object.objects[j].name == 'playerStart') {
                    start.x = object.objects[j].x + object.objects[j].width / 2;
                    start.y = object.objects[j].y + object.objects[j].height;
                }
            }
        });
        return start;
    }

    findPlayerWin() {
        let win = {
            x: 0,
            y: 0,
        };

        this.map.objects.forEach(object => {
            for (let j = 0; j < this.objects.length; j++) {
                if (object.objects[j].name == 'playerWin') {
                    win.x = object.objects[j].x + object.objects[j]. width / 2;
                    win.y = object.objects[j].x + object.objects[j].heigth;
                }
            }
        });
        return win;
    }

    allowMove(sprite, tile) {
        if (tile) {
            if (this.cursorKeys.left.isDown) {
                this.player.anims.play('playerWalkLeft', true);
                this.player.setVelocityX(-gameSettings.playerSpeed);
            } else if (this.cursorKeys.right.isDown) {
                this.player.anims.play('playerWalkRight', true);
                this.player.setVelocityX(gameSettings.playerSpeed);
            } else {
                this.player.setVelocityX(0);
                this.player.anims.play('playerStand');
            }
        }
    }

    allowClimb(sprite, tile) {
            let leftTile = this.map.getTileAt(tile.x -1, tile.y, true);
            let rightTile = this.map.getTileAt(tile.x +1, tile.y, true);

            for (let i = 0; i < this.groundTiles.length; i++) {
                if (leftTile.index == this.groundTiles[i] || rightTile.index == this.groundTiles[i]) {
                    this.player.allowGravity = true;
                    if (this.cursorKeys.left.isDown) {
                        this.player.anims.play('playerWalkLeft', true);
                        this.player.setVelocityX(-gameSettings.playerSpeed);
                    } else if (this.cursorKeys.right.isDown) {
                        this.player.anims.play('playerWalkRight', true);
                        this.player.setVelocityX(gameSettings.playerSpeed);
                    } else {
                        this.player.setVelocityX(0);
                        this.player.anims.play('playerStand');
                    }
                }
            }

            let distance = Math.abs(this.player.x - (tile.pixelX + tile.width / 2));
            if (this.cursorKeys.up.isDown && distance <= 3) {
                console.log ('up');
                this.player.x = tile.pixelX + tile.width / 2;
                this.player.anims.play('playerClimb', true);
                this.player.setVelocityX(0);
                this.player.setVelocityY(-gameSettings.playerSpeed);
            } else if (this.cursorKeys.down.isDown) {
                this.player.anims.play('playerClimb', true);
                this.player.setVelocityX(0);
                this.player.setVelocityY(gameSettings.playerSpeed);
            } else {
                this.player.setVelocityY(-1);
            }
    }

    getChest(sprite, tile) {
        this.chestsLayer.removeTileAt(tile.x, tile.y);
        this.score += 50;
        if (this.score == 150) {
            this.buildExit();
        }
        this.scoreFormated = this.zeroPad(this.score, 6);
        this.scoreLabel.text = "SCORE " + this.scoreFormated;
        this.pickUpSound.play();
    }

    buildExit() {
        this.winLayer.visible = true;
    }

    checkWin(sprite, tile) {
        if (this.score == 150) {
            this.allowClimb(sprite, tile);
            if (sprite.y == this.playerWin.y) {
                console.log('win');
            }
        }
    }

    update() {
        this.physics.overlap(this.player, this.winLayer);
        this.physics.overlap(this.player, this.collideLayer);
        this.physics.collide(this.player, this.collideLayer);
        this.physics.overlap(this.player, this.laddersLayer);
    }
}