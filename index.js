// Polyfill
(function() {
  var lastTime = 0;
  var vendors = ['ms', 'moz', 'webkit', 'o'];
  for(var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
    window.requestAnimationFrame = window[vendors[x]+'RequestAnimationFrame'];
    window.cancelAnimationFrame = window[vendors[x]+'CancelAnimationFrame']
      || window[vendors[x]+'CancelRequestAnimationFrame'];
  }

  if (!window.requestAnimationFrame)
    window.requestAnimationFrame = function(callback, element) {
      var currTime = new Date().getTime();
      var timeToCall = Math.max(0, 16 - (currTime - lastTime));
      var id = window.setTimeout(function() { callback(currTime + timeToCall); }, timeToCall);
      lastTime = currTime + timeToCall;
      return id;
    };

  if (!window.cancelAnimationFrame)
    window.cancelAnimationFrame = function(id) {
      clearTimeout(id);
    };
}());


var canvas = document.getElementById('canvas');
var ctx = canvas.getContext('2d');

var MAX_TILES = 50;
var NEXT_WAVE_INTERVAL = 20000;
var CYCLE_FOREGROUND_COLOR = true;
var FOREGROUND_IMAGE = './99d/99d-logomark-in-square-trans.svg';

var COLORS = [
  '#ff7e65',
  '#f6caa2',
  '#ce283D',
  '#f0a9b7',
  '#752873',
  '#b36ea7',
  '#1f3ca6',
  '#81a3e6',
  '#2f9780',
  '#a4d2d4',
  '#95837b',
  '#cbbba5'
];

var IMAGES = [
  'images/astronaut.png',
  'images/pineapple.png',
  'images/hummingbird.png',
  'images/jockey.png',
  'images/lemon.png',
  'images/pineapple.png',
  'images/octopus.png',
  'images/lemon.png',
  /* 'images/cake-x3.png',*/
];

var tiles = [], logo;
var queue = [];
var activeImage = new Image();
var queueNextWave = false;
var lastWaveTime = 0;

function fetchNextImage() {
  return IMAGES[Math.floor(Math.random() * IMAGES.length)];
}

// Image tile
// --------------------------------------------------

function Tile() {
  var direction = Math.random() < 0.5 ? -1 : 1;
  this.image = {};
  this.dx = (Math.random() * 2 + 1) * direction;
  this.dy = (Math.random() * 2 + 1) * direction;
  this.x = Math.random() * canvas.width;
  this.y = Math.random() * canvas.height;
  this.angle = Math.random() * 180;
  this.spinSpeed = Math.random() * .4;
}

Tile.prototype.draw = function(bounds) {
  var outOfBounds = false;
  var inQueue = queue.indexOf(this) !== -1;
  var boundsPadding = 100;

  if ((this.x - boundsPadding) >= bounds.width) {
    this.dx = -1 * Math.abs(this.dx);
    outOfBounds = true;
  } else if ((this.x + this.width + boundsPadding) <= 0) {
    this.dx = Math.abs(this.dx);
    outOfBounds = true;
  }

  if ((this.y - boundsPadding) >= bounds.height) {
    this.dy = -1 * Math.abs(this.dy);
    outOfBounds = true;
  } else if ((this.y + this.height + boundsPadding) <= 0) {
    this.dy = Math.abs(this.dy);
    outOfBounds = true;
  }

  if (outOfBounds && queueNextWave) {
    if (!inQueue) {
      queue.push(this);
    }
  }

  if (!inQueue) {
    this.x += this.dx;
    this.y += this.dy;
    this.width = this.image.width * .5;
    this.height = this.image.height * .5;

    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.translate(this.width/2, this.height/2);
    ctx.rotate(Math.PI / 180 * (this.angle += this.spinSpeed));
    ctx.drawImage(this.image, -1 * this.width/2, -1 * this.width/2, this.width, this.height);
    ctx.restore();
  }
};

// Logo
// --------------------------------------------------

function Logo() {
  this.image = new Image();
  this.image.src = FOREGROUND_IMAGE;
  this.color = COLORS[0];
  this.x = 0;
  this.y = 0;
  this.width = this.image.width;
  this.height = this.image.height;
  this.dx = 1.5;
  this.dy = 1.5;
}

Logo.prototype.draw = function(bounds) {
  var size = canvas.width/6;

  this.width = size * (this.image.width/100)
  this.height = size * (this.image.height/100);

  if ((this.x + this.width) >= bounds.width) {
    this.switchColor();
    this.dx = -1 * Math.abs(this.dx);
  } else if (this.x <= 0) {
    this.switchColor();
    this.dx = Math.abs(this.dx);
  }

  if ((this.y + this.height) >= bounds.height) {
    this.switchColor();
    this.dy = -1 * Math.abs(this.dy);
  } else if (this.y <= 0) {
    this.switchColor();
    this.dy = Math.abs(this.dy);
  }

  this.x += this.dx;
  this.y += this.dy;

  if (CYCLE_FOREGROUND_COLOR) {
    ctx.fillStyle = this.color;
    ctx.fillRect(this.x, this.y, this.width, this.height);
  }

  ctx.drawImage(this.image, this.x, this.y, this.width, this.height);
};

Logo.prototype.switchColor = function() {
  this.color = COLORS[Math.floor(Math.random() * COLORS.length)];
};

// The thing.
// --------------------------------------------------

function init() {
  canvas.height = window.innerHeight;
  canvas.width = window.innerWidth;

  logo = new Logo();

  activeImage.src = fetchNextImage();
  for (var i = 0; i < MAX_TILES; i++) {
    tiles.push(new Tile());
    tiles[i].image = activeImage;
  }

  window.onresize = function() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  };

  // Preload all the images.
  const loadImages = IMAGES.map((src) => {
    return new Promise((resolve) => {
      let image = new Image();
      image.src = src;
      image.onload = () => {
        console.info('Loaded: %s', src);
      };

      resolve();
    });
  });

  Promise.all(loadImages).then(() => {
    window.requestAnimationFrame(draw);
  });
}

function draw(currentTime) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  window.requestAnimationFrame(draw);

  if (queue.length === tiles.length) {
    queue = [];
    activeImage.src = fetchNextImage();
    queueNextWave = false;
    lastWaveTime = currentTime;
  }

  if (!queueNextWave && currentTime >= lastWaveTime + NEXT_WAVE_INTERVAL)  {
    queueNextWave = true;
  }

  // Pinapples gone wild
  tiles.map(function(tile) {
    tile.draw(canvas);
  });

  logo.draw(canvas);
}

init();
