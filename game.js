let gameSettings = {
    playerSpeed: 60,
}

let config = {
    width: 480,
    height: 320,
    backgroundColor: 0x000000,
    scene: [Scene1, Scene2],
    pixelArt: true,
    physics: {
        default: "arcade",
        arcade: {
            debug: true,
            gravity: {y: 900}
        }
    }
  }
  
  
  let game = new Phaser.Game(config);