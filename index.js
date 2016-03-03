var canvas = document.getElementById('canvas');
var ctx = canvas.getContext('2d');

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

var pineapples = [], logo;

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

// Pineapple
// --------------------------------------------------

function Pineapple(image, name) {
  var direction = Math.random() < 0.5 ? -1 : 1;
  this.image = image;
  this.dx = (Math.random() * 2 + 1) * direction;
  this.dy = (Math.random() * 2 + 1) * direction;
  this.x = Math.random() * canvas.width;
  this.y = Math.random() * canvas.height;
}

Pineapple.prototype.updatePosition = function(bounds) {
  bounceInBounds(this, bounds);
};

Pineapple.prototype.draw = function() {
  this.width = this.image.width * .5;
  this.height = this.image.height * .5;

  ctx.drawImage(this.image, this.x, this.y, this.width, this.height);
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

function init() {
  canvas.height = window.innerHeight;
  canvas.width = window.innerWidth;

  pineapples = [];
  logo = null;

  var createLogo = new Promise(function(resolve) {
    var image = new Image();
    image.src = "./99d/99d-logomark-in-square-trans.svg";

    image.onload = function() {
      logo = new Logo(image);
      resolve();
    };
  });

  var createPineapples = new Promise(function(resolve) {
    var image = new Image();
    image.src = "./pineapple.png";

    image.onload = function() {
      for (var i = 0; i < 50; i++) {
        pineapples.push(new Pineapple(image));
      }
      resolve();
    };
  });

  Promise.all([createLogo, createPineapples]).then(function() {
    window.onresize = function() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    window.requestAnimationFrame(draw);
  });
}

var lastTime = 0;
function draw(currentTime) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  window.requestAnimationFrame(draw);

  // Pinapples gone wild
  pineapples.map(function(pineapple) {
    pineapple.draw();
    pineapple.updatePosition(canvas);
  });

  // Logo
  if (currentTime >= lastTime + 1000)  {
    logo.switchColor();
    lastTime = currentTime;
  }
  logo.draw();
  logo.updatePosition(canvas);

  // RESKIN, RESKIN, RESKIN
  // ctx.font="8em Larsseit-Bold";
  // ctx.textAlign="center";
  // ctx.fillText("Reskin!",canvas.width/2,canvas.height/2);
}

init();
