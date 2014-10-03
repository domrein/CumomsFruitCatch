var viewWidth = 640;
var viewHeight = 480;

// Create a pixi renderer
var renderer = PIXI.autoDetectRenderer(viewWidth, viewHeight);
renderer.view.className = "rendererView";

// add render view to DOM
document.body.appendChild(renderer.view);

// create an new instance of a pixi stage
var stage = new PIXI.Stage(0xFFFFFF);
// shared layers
var bgLayer = new PIXI.DisplayObjectContainer();
var cloudLayer = new PIXI.DisplayObjectContainer();
var mainLayer = new PIXI.DisplayObjectContainer();
var uiLayer = new PIXI.DisplayObjectContainer();
stage.addChild(bgLayer);
stage.addChild(cloudLayer);
stage.addChild(mainLayer);
stage.addChild(uiLayer);

var gameOver;
var highScore = 0;
var score;
var chain;
var scoreText = new PIXI.Text("Score: " + score);
uiLayer.addChild(scoreText);

// create a background texture
var bgTexture = PIXI.Texture.fromImage("assets/art/BG.png");
// create a new background sprite
var bgSprite = new PIXI.Sprite(bgTexture);
bgLayer.addChild(bgSprite);

var cumom = PIXI.Sprite.fromImage("assets/art/Cumom.png");
cumom.anchor.x = cumom.anchor.y = .5;
var tongue = new PIXI.Graphics();
cumom.addChild(tongue);
mainLayer.addChild(cumom);

var bigCloud = PIXI.Sprite.fromImage("assets/art/BigCloud.png");
bigCloud.position.x = 100;
bigCloud.position.y = 10;
cloudLayer.addChild(bigCloud);
var littleCloud = PIXI.Sprite.fromImage("assets/art/LittleCloud.png");
littleCloud.position.x = 400;
littleCloud.position.y = 90;
cloudLayer.addChild(littleCloud);

var fruits = [];
var fruitImages = ["RedFruit", "GreenFruit"];
var rocks = [];

var tick = 0;
requestAnimationFrame(animate);

var scene;

loadPlayScene();

function loadTitleScene() {
  scene = "title";
}

function loadPlayScene() {
  scene = "play";
  lastX = 320;
  tick = 0;
  fruits = [];
  rocks = [];
  cumom.position.x = 320;
  cumom.position.y = 420;
  // props used for game over
  cumom.jumpSpeed = 0;
  cumom.rotationSpeed = 0;
  gameOver = false;
  score = 0;
  chain = 0;
  scoreText.setText("Score: " + score);
}

var lastX;
function animate() {
  bigCloud.position.x -= .2;
  if (bigCloud.position.x + bigCloud.width < 0) {
    bigCloud.position.x = 640;
  }
  littleCloud.position.x -= .15;
  if (littleCloud.position.x + littleCloud.width < 0) {
    littleCloud.position.x = 640;
  }

  // move cumom toward mouse
  var mouseX = stage.getMousePosition().x;
  if (mouseX < 0 || mouseX > 640) {
    mouseX = lastX;
  }
  else {
    lastX = mouseX;
  }

  if (!gameOver) {
    cumom.position.x += (mouseX - cumom.position.x) / 20;
    if (cumom.position.x - cumom.width / 2 < 0) {
      cumom.position.x = 0 + cumom.width / 2;
    }
    else if (cumom.position.x + cumom.width / 2 > 640) {
      cumom.position.x = 640 - cumom.width / 2;
    }
    // make cumom bounce
    cumom.position.y = 420 - Math.abs(Math.sin(tick / 5.0)) * 10;
  }
  else {
    cumom.position.y += cumom.jumpSpeed;
    cumom.jumpSpeed += .075;
    cumom.position.x += 0.2;
    cumom.rotation += .05;
  }

  // make falling fruit
  if (Math.random() > 0.99) {
    var fruit = PIXI.Sprite.fromImage("assets/art/" + fruitImages[Math.floor(Math.random() * fruitImages.length)]  + ".png");
    fruit.scale.x = fruit.scale.y = Math.random() * .4 + .6;
    fruit.setInteractive(true);
    fruit.onTongue = false;
    fruit.eaten = false;
    fruit.mousedown = function(mouseData){
      mouseData.target.onTongue = true;
    }
    fruit.anchor.x = fruit.anchor.y = .5;
    fruit.rotationSpeed = Math.random() * .1 + .01;
    if (Math.random() > .5) {
      fruit.rotationSpeed = -fruit.rotationSpeed;
    }
    fruit.position.x = Math.random() * (640 - fruit.width);
    fruit.position.y = -100;
    fruit.fallSpeed = Math.random() * 2 + 1.5;
    mainLayer.addChild(fruit);
    fruits.push(fruit);
  }

  // make falling rocks
  if (Math.random() > 0.999 - tick / 500000) {
    var rock = PIXI.Sprite.fromImage("assets/art/Rock.png");
    rock.eaten = false;
    rock.scale.x = rock.scale.y = Math.random() * .4 + .6;
    rock.anchor.x = rock.anchor.y = .5;
    rock.rotationSpeed = Math.random() * .1 + .01;
    if (Math.random() > .5) {
      rock.rotationSpeed = -rock.rotationSpeed;
    }
    rock.position.x = Math.random() * (640 - rock.width);
    rock.position.y = -100;
    rock.fallSpeed = Math.random() * 2.5 + 2;
    mainLayer.addChild(rock);
    rocks.push(rock);
  }

  fruits.forEach(function(fruit) {
    if (fruit.onTongue) {
      // draw tongue
      tongue.clear();
      // tongue.beginFill(0xFF3300);
      tongue.lineStyle(6, 0xf9b2d5, 1);
      tongue.moveTo(0, 0);
      tongue.lineTo(fruit.position.x - cumom.position.x, fruit.position.y - cumom.position.y);
      tongue.endFill();

      fruit.rotationSpeed *= 0.95;
      fruit.position.x += ((cumom.position.x) - (fruit.position.x)) / 4;
      fruit.position.y += ((cumom.position.y) - (fruit.position.y)) / 4;
      if (Math.abs(fruit.position.x - cumom.position.x) < 5 && Math.abs(fruit.position.y - cumom.position.y) < 5) {
        fruit.eaten = true;
        chain += 1;
        score += chain;
        if (score > highScore) {
          highScore = score;
        }
        scoreText.setText("Score: " + score);
        mainLayer.removeChild(fruit);
        tongue.clear();
      }
    }
    else {
      if (fruit.position.y > 450) {
        fruit.eaten = true;
        chain = 0;
        mainLayer.removeChild(fruit);
      }
      fruit.position.y += fruit.fallSpeed;
    }
    fruit.rotation += fruit.rotationSpeed;
  });

  rocks.forEach(function(rock) {
    rock.position.y += rock.fallSpeed;
    if (Math.abs(rock.position.x - cumom.position.x) < 55 && Math.abs(rock.position.y - cumom.position.y) < 55) {
      gameOver = true;
      cumom.jumpSpeed = -7;
      rock.eaten = true;
      mainLayer.removeChild(rock);
    }
    else if (rock.position.y > 450) {
      rock.eaten = true;
      mainLayer.removeChild(rock);
    }
    rock.rotation += rock.rotationSpeed;
  });

  fruits = fruits.filter(function(fruit) {
    return !fruit.eaten;
  });

  rocks = rocks.filter(function(rock) {
    return !rock.eaten;
  });
  
  // increment the ticker
  tick++;
  renderer.render(stage);
  requestAnimationFrame(animate);
}
