// game objects
var player,
baddie,
platforms,
ladders,
cursors,
coins,
//new variable to store whether or not hero is currently on a ladder
onLadder = false;

var score = 0,
scoreText;

var playerSpeed = 250, 
gravity = 300,
assetRoot = "https://tomoliverharrison.co.uk/phaser/";

//create our game object... remember it's
//width, height, rendering context (canvas, webgl or auto), DOM ID, object of essential phaser functions
var game = new Phaser.Game(600, 400, Phaser.AUTO, 'game', { preload: preload, create: create, update: update });

//function to preload all our game sprites
function preload() {
  //this is for codepen to allow images hosted on my website
  game.load.crossOrigin = "anonymous";
  
  game.load.image('ground', assetRoot + 'assets/platform.png');
  game.load.image('coin', assetRoot + 'assets/coin.png');
  game.load.image('hero', assetRoot + 'assets/hero.png');
  game.load.image('baddie', assetRoot + 'assets/baddie.png');
  game.load.image('ladder', assetRoot + 'assets/ladder.png');
}

//setup all the game objects, physics etc
function create() {
    //set background colour
    game.stage.backgroundColor = "#243166";
    //reset the score
    score = 0;
    //we're going to be using physics, so enable the Arcade Physics system
    game.physics.startSystem(Phaser.Physics.ARCADE);

    //the platforms group will contain the ground and the 2 ledges we can jump on
    platforms = game.add.group();

    //we will enable physics for any object that is created in this group
    platforms.enableBody = true;

    //here we create the ground and pass it the ground sprite
    var ground = platforms.create(0, game.world.height - 64, 'ground');

    //scale it to fit the width of the game (the original sprite is 400x32 in size)
    ground.scale.setTo(2, 2);

    //this stops it from falling away when you jump on it
    ground.body.immovable = true;
  
    //Now let's create a ledge
    var ledge = platforms.create(300, 164, 'ground');
    ledge.body.immovable = true;

    //and a ladder
    //first we create a group, just in case we have move ladders later
    ladders = game.add.group();
    //enable all bodies in this group for physics
    ladders.enableBody = true;
    //then add out sprite to the group
    var ladder = ladders.create(266, 164, 'ladder');
    //make it sure this object doesn't move
    ladder.body.immovable = true;
 
    //the player and its settings
    player = game.add.sprite(32, game.world.height - 150, 'hero');

    //we need to enable physics on the player
    game.physics.arcade.enable(player);

    //player physics properties. Give the little guy a slight bounce.
    player.body.bounce.y = 0.2;
    player.body.gravity.y = gravity;

    //confine our player to the world bounds so he can't fall out of the frame
    player.body.collideWorldBounds = true;
    
    //set a flag for when player gets hit by baddie
    player.dead = false;
    //change rotation point so we can make player spin when hit.
    player.anchor.setTo(.5, .5);
    //add our baddy 
    baddie = game.add.sprite(320, game.world.height - 100, 'baddie');

    //enable physics on the baddie
    game.physics.arcade.enable(baddie);

    //set physics properties. Give the little guy a slight bounce.
    baddie.body.bounce.y = 0.2;
    baddie.body.gravity.y = gravity;

    //confine our baddie to the world bounds so he can't fall out of the frame
    baddie.body.collideWorldBounds = true;
    baddie.body.velocity.x = -100;
    baddie.maxDistance = 200;
    baddie.previousX = baddie.x;
    baddie.anchor.setTo(.5, .5);
    //finally some coins to collect. We start by adding a group...
    coins = game.add.group();

    //we will enable physics for any coin that is created in this group
    coins.enableBody = true;

    //then we create 9 coins within the coins group 
    for (var i = 0; i < 9; i++)
    {
        //create a coin inside of the 'coins' group
        //we are evenly spacing the coins every 70px
        //the  + 16 is half the width of a 32px coin, it means the first coin is not half way off the screen
        var coin = coins.create(i * 70 + 16, 16, 'coin');

        //add gravity to the coins group
        coin.body.gravity.y = gravity;

        //this just gives each coin a slightly random bounce value
        coin.body.bounce.y = 0.7 + Math.random() * 0.2;

        //set coins axis to the be the center, so it rotates nicely
        coin.anchor.setTo(.5, .5);
    }

    //Add score text to the screen
    scoreText = game.add.text(16, 16, 'score: 0', { fontSize: '18px', fill: '#eee' });

    //Create controls object
    cursors = game.input.keyboard.createCursorKeys();
}

//the game loop. Game logic lives in here.
//this is called every frame
function update() {
    //reset ladder status
    onLadder = false;
  
    //reset player gravity
    player.body.gravity.y = gravity;

    //Collide the player and the coins with the platforms
    game.physics.arcade.collide(player, platforms);
    game.physics.arcade.collide(coins, platforms);

    //collide baddie with platforms and player
    game.physics.arcade.collide(baddie, platforms);
    
    //check how far baddie has travelled. If past maximum amount then switch direction
    if (Math.abs(baddie.x - baddie.previousX) >= baddie.maxDistance) {
        switchDirection(baddie);
    }
  
    //we user overlap here instead of collide so baddie doesn't move
    game.physics.arcade.overlap(player, baddie, hitBaddie);
  
    //check if player is on ladder
    game.physics.arcade.overlap(player, ladders, isOnLadder);

    //Checks to see if the player overlaps with any of the coins, if he does call the collectcoin function
    game.physics.arcade.overlap(player, coins, collectcoin, null, this);
    
    //Reset the players velocity (movement)
    player.body.velocity.x = 0;
  
    //only take input from controls if we are still alive. No controlling a corpse.
    if(!player.dead)
    {
        //if left key is down
        if (cursors.left.isDown)
        {
            //Move to the left
            player.body.velocity.x = -playerSpeed;
        }
        //if right key is down
        else if (cursors.right.isDown)
        {
            //Move to the right
            player.body.velocity.x = playerSpeed;
        }

        //Allow the player to jump if they are touching the ground.
        if (cursors.up.isDown && player.body.touching.down)
        {
            player.body.velocity.y = -playerSpeed;
        }

        if(onLadder)
        {
            if(cursors.up.isDown)
            {
                player.body.velocity.y = -playerSpeed/2;
            }
            if(cursors.down.isDown)
            {
                player.body.velocity.y = playerSpeed/2;
            }
            if((!cursors.up.isDown && !cursors.down.isDown) && !game.input.pointer1.isDown)
            {
                player.body.gravity.y = 0;
                player.body.velocity.y = 0;
            }
        }
      
        //touch controls
        //check for two points of touch, pointer1 or pointer 2. This lets people use their thumbs in landscape mode and easily switch between the two
        if (game.input.pointer1.isDown || game.input.pointer2.isDown)
        {   
            //If touch is to the left of the player move them left
            if (game.input.x < player.body.x - player.body.width) 
            {      
                //Move to the left      
                player.body.velocity.x = -playerSpeed;        
            }    
            //If touch is to the right of the player move them right
            if (game.input.x > player.body.x + player.body.width) 
            {      
                //Move to the right
                player.body.velocity.x = playerSpeed;
            } 
            // jump
            if(game.input.y < player.body.y - player.body.height && player.body.touching.down)
            {
                player.body.velocity.y = -playerSpeed;
            }

            if(onLadder)
            {
                if(game.input.y > player.body.y + player.body.height)
                {
                    player.body.velocity.y = playerSpeed/2;
                }
                if(game.input.y < player.body.y - player.body.height)
                {
                    player.body.velocity.y = -playerSpeed/2;
                }
            }
        }
    }
}

//called from the main game loop whenever a hero collects a coin
function collectcoin (player, coin) {
   //check if we have already hit coin, and player is not dead
   if(!coin.hit && !player.dead)
   {
        //if not then change hit flag to true
        coin.hit = true;

        //make coin jump up slightly
        coin.body.velocity.y = -100;

        //animate coin so it becomes invisible and spins. Store this tween in a variable
        var tween = game.add.tween(coin).to( { alpha: 0, angle: 360 }, 500, "Linear", true);
        //animate the scale property of our coin to make it halve in size
        game.add.tween(coin.scale).to( { x: .5, y: .5 }, 500, "Linear", true);
       
        //when our fade tween is complete call the function killcoin
        tween.onComplete.add(removeSprite);

        //update the score and write to screen
        score += 10;
        scoreText.text = 'Score: ' + score;
   }
}

function hitBaddie(player, baddie) {
    //if baddie is hit on head and hasn't already been hit
    if (baddie.body.touching.up && !baddie.hit) 
    {
        // set baddie as being hit and remove physics
        baddie.hit = true;
        baddie.body.velocity.y = -100;
        baddie.body.velocity.x = 0;

        //make our player bounce
        player.body.velocity.y = -gravity;
      
        //create empty tweens
        var baddieTween = game.add.tween(baddie),
        baddieScaleTween = game.add.tween(baddie.scale);

        //assign tween values
        baddieTween.to({ alpha: 0, angle: 360}, 1000, Phaser.Easing.Linear.None);
        baddieScaleTween.to({ x: .5, y:.5 }, 1000, Phaser.Easing.Linear.None);

        //when tween is finished, remove sprite
        baddieTween.onComplete.add(removeSprite);
      
        //start the tweens
        baddieScaleTween.start();
        baddieTween.start();
    }
    //otherwise you've hit baddie, but not on the head. This makes you die
    else
    {
        //set player to dead
        player.dead = true;
        player.body.velocity.y =-playerSpeed;
        player.body.velocity.x = 0;
      
        //create empty tweens
        var playerTween = game.add.tween(player),
        playerScaleTween = game.add.tween(player.scale);

        //assign tween values
        playerTween.to({ alpha: 0,  angle: 360}, 500, Phaser.Easing.Linear.None);
        playerScaleTween.to({ x: .5, y:.5 }, 500, Phaser.Easing.Linear.None);

        //when scale tween is finished, restart game
        playerScaleTween.onComplete.add(restartGame);

        //start the tweens
        playerScaleTween.start();
        playerTween.start();
    }
}

//this replaced killcoin and is more generic
function removeSprite(sprite) {
    // Removes the sprite from the screen
    sprite.kill();
}

function switchDirection(baddie)
{
   //reverse velocity so baddie moves are same speed but in opposite direction
   baddie.body.velocity.x *= -1;
   //reset count
   baddie.previousX = baddie.x;
}

//when hero and ladder are touching, this is called
function isOnLadder()
{
  onLadder = true;
}

function restartGame()
{
  game.state.start(game.state.current);
}

