var canvas = document.getElementById('canvas');
var ctx = canvas.getContext('2d');

var MAX_TILES = 100;

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

function bounceInBounds(obj, bounds) {
  if ((obj.x + obj.width) >= bounds.width) {
    obj.dx = -1 * Math.abs(obj.dx);
  } else if (obj.x <= 0) {
    obj.dx = Math.abs(obj.dx);
  }

  if ((obj.y + obj.height) >= bounds.height) {
    obj.dy = -1 * Math.abs(obj.dy);
  } else if (obj.y <= 0) {
    obj.dy = Math.abs(obj.dy);
  }

  obj.x += obj.dx;
  obj.y += obj.dy;
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

Tile.prototype.fetchImage = function() {
  var image = new Image();
  image.src = images[Math.floor(Math.random() * images.length)];
  this.image = image;
};

Tile.prototype.draw = function(bounds) {
  var switchImage = false;

  if ((this.x - 100) >= bounds.width) {
    this.dx = -1 * Math.abs(this.dx);
    switchImage = true;
  } else if ((this.x + this.width + 100) <= 0) {
    this.dx = Math.abs(this.dx);
    switchImage = true;
  }

  if ((this.y - 100) >= bounds.height) {
    this.dy = -1 * Math.abs(this.dy);
    switchImage = true;
  } else if ((this.y + this.height + 100) <= 0) {
    this.dy = Math.abs(this.dy);
    switchImage = true;
  }

  if (switchImage) {
    this.fetchImage();
  }

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
};

// Logo
// --------------------------------------------------

function Logo(image) {
  this.image = image;
  this.scale = 0.25;
  this.color = colors[0];
  this.x = 0;
  this.y = 0;
  this.width = image.width;
  this.height = image.width;
  this.dx = Math.random() * 2 + 1;
  this.dy = Math.random() * 2 + 1;
}

Logo.prototype.draw = function() {
  var size = canvas.width/6;
  this.width = size;
  this.height = size;

  ctx.fillStyle = this.color;
  ctx.fillRect(this.x, this.y, this.width, this.height);
  ctx.drawImage(this.image, this.x, this.y, this.width, this.height);
};

Logo.prototype.switchColor = function() {
  this.color = colors[Math.floor(Math.random() * colors.length)];
};

Logo.prototype.updatePosition = function(bounds) {
  bounceInBounds(this, bounds);
};


// The thing.
// --------------------------------------------------

function init() {
  canvas.height = window.innerHeight;
  canvas.width = window.innerWidth;

  tiles = [];
  logo = null;

  var createLogo = new Promise(function(resolve) {
    var image = new Image();
    image.src = "./99d/99d-logomark-in-square-trans.svg";

    image.onload = function() {
      logo = new Logo(image);
      resolve();
    };
  });

  var createTiles = new Promise(function(resolve) {
    for (var i = 0; i < MAX_TILES; i++) {
      tiles.push(new Tile());
      tiles[i].fetchImage();
    }
    resolve();
  });

  Promise.all([createLogo, createTiles]).then(function() {
    window.onresize = function() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    window.requestAnimationFrame(draw);
  });
}

var lastImageTime = 0, lastColorTime = 0;
function draw(currentTime) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  window.requestAnimationFrame(draw);

  // Pinapples gone wild
  tiles.map(function(tile) {
    tile.draw(canvas);
  });

  // Logo
  if (currentTime >= lastColorTime + 1000)  {
    logo.switchColor();
    lastColorTime = currentTime;
  }

  logo.draw();
  logo.updatePosition(canvas);
}

init();
