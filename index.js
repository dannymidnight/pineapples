var canvas = document.getElementById('canvas');
var ctx = canvas.getContext('2d');

var MAX_TILES = 100;
var NEXT_WAVE_INTERVAL = 10000;

var colors = [
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

var images = [
  'astronaut.png',
  'pineapple.png'
];

var tiles = [], logo;
var queue = [];
var activeImage = new Image();
var queueNextWave = false;
var lastWaveTime = 0;
var lastColorTime = 0;

function fetchNextImage() {
  return images[Math.floor(Math.random() * images.length)];
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
  this.image.src = "./99d/99d-logomark-in-square-trans.svg";
  this.scale = 0.25;
  this.color = colors[0];
  this.x = 0;
  this.y = 0;
  this.width = this.image.width;
  this.height = this.image.width;
  this.dx = Math.random() * 2 + 1;
  this.dy = Math.random() * 2 + 1;
}

Logo.prototype.draw = function(bounds) {
  var size = canvas.width/6;
  this.width = size;
  this.height = size;

  if ((this.x + this.width) >= bounds.width) {
    this.dx = -1 * Math.abs(this.dx);
  } else if (this.x <= 0) {
    this.dx = Math.abs(this.dx);
  }

  if ((this.y + this.height) >= bounds.height) {
    this.dy = -1 * Math.abs(this.dy);
  } else if (this.y <= 0) {
    this.dy = Math.abs(this.dy);
  }

  this.x += this.dx;
  this.y += this.dy;

  ctx.fillStyle = this.color;
  ctx.fillRect(this.x, this.y, this.width, this.height);
  ctx.drawImage(this.image, this.x, this.y, this.width, this.height);
};

Logo.prototype.switchColor = function() {
  this.color = colors[Math.floor(Math.random() * colors.length)];
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

  window.requestAnimationFrame(draw);
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

  // Logo
  if (currentTime >= lastColorTime + 1000)  {
    logo.switchColor();
    lastColorTime = currentTime;
  }

  logo.draw(canvas);
}

init();
